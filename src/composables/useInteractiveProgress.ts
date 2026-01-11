import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useStore } from 'vuex'
import { supabase } from '../supabase'

export type ProgressState = 'locked' | 'in_progress' | 'passed'

export interface InteractiveProgress {
  id: string
  user_id: string
  interactive_block_id: string
  tutorial_slug?: string
  progress_state: ProgressState
  saved_code: string | { html?: string; css?: string; js?: string } | null
  xp_awarded: boolean
  passed_at: string | null
  updated_at: string
}

export interface InteractiveBlockDefinition {
  id: string
  title: string
  instructions?: string
  starter_code: string | { files: Array<{ name: string; language: string; content: string }> }
  run_mode: string
  checks: Array<{ type: string; value: string; message?: string }>
  hints: string[]
  xp_award: number
}

export interface UseInteractiveProgressReturn {
  progress: Readonly<Ref<InteractiveProgress | null>>
  blockDefinition: Readonly<Ref<InteractiveBlockDefinition | null>>
  loading: Readonly<Ref<boolean>>
  saving: Readonly<Ref<boolean>>
  error: Readonly<Ref<string | null>>
  loadProgress: () => Promise<void>
  loadBlockDefinition: () => Promise<void>
  saveCode: (code: string | { html?: string; css?: string; js?: string }, immediate?: boolean) => Promise<void>
  markPassed: () => Promise<boolean> // Returns true if XP was awarded
  isPassed: ComputedRef<boolean>
  isInProgress: ComputedRef<boolean>
}

let saveDebounceTimer: number | null = null
const DEBOUNCE_MS = 300

/**
 * Composable for managing interactive block progress and XP
 */
export function useInteractiveProgress(
  blockId: string,
  tutorialSlug?: string
): UseInteractiveProgressReturn {
  const store = useStore()
  const progress = ref<InteractiveProgress | null>(null)
  const blockDefinition = ref<InteractiveBlockDefinition | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const currentUser = computed(() => store.getters.currentUser)

  const isPassed = computed(() => progress.value?.progress_state === 'passed')
  const isInProgress = computed(() => progress.value?.progress_state === 'in_progress')

  // Load block definition
  const loadBlockDefinition = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('interactive_blocks')
        .select('*')
        .eq('id', blockId)
        .single()

      if (fetchError) throw fetchError

      blockDefinition.value = data as InteractiveBlockDefinition
    } catch (err: any) {
      console.error('Error loading block definition:', err)
      error.value = err.message || 'Failed to load block definition'
      blockDefinition.value = null
    } finally {
      loading.value = false
    }
  }

  // Load user progress
  const loadProgress = async () => {
    if (!currentUser.value?.uid) {
      progress.value = null
      return
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('interactive_progress')
        .select('*')
        .eq('user_id', currentUser.value.uid)
        .eq('interactive_block_id', blockId)
        .maybeSingle()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      progress.value = data as InteractiveProgress | null

      // If no progress exists, create initial state
      if (!progress.value) {
        progress.value = {
          id: '',
          user_id: currentUser.value.uid,
          interactive_block_id: blockId,
          tutorial_slug: tutorialSlug,
          progress_state: 'in_progress',
          saved_code: null,
          xp_awarded: false,
          passed_at: null,
          updated_at: new Date().toISOString()
        }
      }
    } catch (err: any) {
      console.error('Error loading progress:', err)
      error.value = err.message || 'Failed to load progress'
    } finally {
      loading.value = false
    }
  }

  // Save code snapshot (with debounce)
  const saveCode = async (
    code: string | { html?: string; css?: string; js?: string },
    immediate = false
  ) => {
    if (!currentUser.value?.uid) return

    // Clear existing debounce
    if (saveDebounceTimer !== null) {
      clearTimeout(saveDebounceTimer)
      saveDebounceTimer = null
    }

    const doSave = async () => {
      try {
        saving.value = true
        error.value = null

        const progressData = {
          user_id: currentUser.value!.uid,
          interactive_block_id: blockId,
          tutorial_slug: tutorialSlug,
          saved_code: code,
          progress_state: progress.value?.progress_state || 'in_progress',
          updated_at: new Date().toISOString()
        }

        const { data, error: saveError } = await supabase
          .from('interactive_progress')
          .upsert(progressData, {
            onConflict: 'user_id,interactive_block_id'
          })
          .select()
          .single()

        if (saveError) throw saveError

        progress.value = data as InteractiveProgress
      } catch (err: any) {
        console.error('Error saving code:', err)
        error.value = err.message || 'Failed to save code'
      } finally {
        saving.value = false
      }
    }

    if (immediate) {
      await doSave()
    } else {
      saveDebounceTimer = window.setTimeout(doSave, DEBOUNCE_MS)
    }
  }

  // Mark step as passed and award XP
  const markPassed = async (): Promise<boolean> => {
    if (!currentUser.value?.uid) return false
    if (!blockDefinition.value) return false

    try {
      saving.value = true
      error.value = null

      // Update progress state
      const progressData = {
        user_id: currentUser.value.uid,
        interactive_block_id: blockId,
        tutorial_slug: tutorialSlug,
        progress_state: 'passed' as ProgressState,
        passed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error: updateError } = await supabase
        .from('interactive_progress')
        .upsert(progressData, {
          onConflict: 'user_id,interactive_block_id'
        })
        .select()
        .single()

      if (updateError) throw updateError

      progress.value = data as InteractiveProgress

      // Award XP idempotently using database function
      if (!progress.value.xp_awarded && blockDefinition.value.xp_award > 0) {
        const { data: xpData, error: xpError } = await supabase.rpc(
          'award_xp_if_not_awarded',
          {
            p_user_id: currentUser.value.uid,
            p_interactive_block_id: blockId,
            p_xp_amount: blockDefinition.value.xp_award
          }
        )

        if (xpError) {
          console.error('Error awarding XP:', xpError)
          // Don't throw - progress is still saved
        } else if (xpData) {
          // XP was awarded - refresh user data to get updated XP/level
          const { data: userData } = await supabase
            .from('users')
            .select('xp_total, level')
            .eq('id', currentUser.value.uid)
            .single()

          if (userData) {
            // Update store with new XP/level
            store.dispatch('setUser', {
              ...currentUser.value,
              xpTotal: userData.xp_total,
              level: userData.level
            })

            // Show XP earned notification
            store.dispatch('addNotification', {
              type: 'success',
              message: `+${blockDefinition.value.xp_award} XP earned!`,
              description: `You're now Level ${userData.level}`
            })

            return true
          }
        }
      }

      return false
    } catch (err: any) {
      console.error('Error marking as passed:', err)
      error.value = err.message || 'Failed to mark as passed'
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    progress: progress as Readonly<Ref<InteractiveProgress | null>>,
    blockDefinition: blockDefinition as Readonly<Ref<InteractiveBlockDefinition | null>>,
    loading: loading as Readonly<Ref<boolean>>,
    saving: saving as Readonly<Ref<boolean>>,
    error: error as Readonly<Ref<string | null>>,
    loadProgress,
    loadBlockDefinition,
    saveCode,
    markPassed,
    isPassed,
    isInProgress
  }
}
