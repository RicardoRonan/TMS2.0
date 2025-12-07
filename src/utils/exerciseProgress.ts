/**
 * Exercise Progress Utility
 * Handles updating tutorial progress when exercises are completed
 */

import { supabase } from '../supabase'

/**
 * Update tutorial progress when an exercise is completed
 */
export async function updateProgressOnExerciseComplete(
  userId: string,
  tutorialPageId: string,
  categoryId: string
): Promise<void> {
  try {
    // Check if there are any incomplete exercises for this page
    const { data: exercises, error: exercisesError } = await supabase
      .from('tutorial_exercises')
      .select('id')
      .eq('tutorial_page_id', tutorialPageId)

    if (exercisesError) {
      console.error('Error fetching exercises:', exercisesError)
      return
    }

    // Check if all exercises are completed
    if (exercises && exercises.length > 0) {
      const { data: submissions, error: submissionsError } = await supabase
        .from('tutorial_exercise_submissions')
        .select('exercise_id, passed')
        .eq('user_id', userId)
        .eq('tutorial_page_id', tutorialPageId)
        .in('exercise_id', exercises.map(e => e.id))

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError)
        return
      }

      const allExercisesCompleted = exercises.every(exercise => {
        const submission = submissions?.find(s => s.exercise_id === exercise.id)
        return submission?.passed === true
      })

      if (allExercisesCompleted) {
        // Mark page as complete in tutorial_progress
        await supabase
          .from('tutorial_progress')
          .upsert({
            user_id: userId,
            tutorial_category_id: categoryId,
            tutorial_page_id: tutorialPageId,
            completed: true,
            completed_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,tutorial_category_id,tutorial_page_id'
          })
      }
    } else {
      // No exercises, just mark page as viewed
      await supabase
        .from('tutorial_progress')
        .upsert({
          user_id: userId,
          tutorial_category_id: categoryId,
          tutorial_page_id: tutorialPageId,
          completed: true,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,tutorial_category_id,tutorial_page_id'
        })
    }
  } catch (error) {
    console.error('Error updating progress on exercise complete:', error)
  }
}

/**
 * Check if all exercises for a page are completed
 */
export async function areAllExercisesCompleted(
  userId: string,
  tutorialPageId: string
): Promise<boolean> {
  try {
    const { data: exercises, error: exercisesError } = await supabase
      .from('tutorial_exercises')
      .select('id')
      .eq('tutorial_page_id', tutorialPageId)

    if (exercisesError || !exercises || exercises.length === 0) {
      return true // No exercises means "completed"
    }

    const { data: submissions, error: submissionsError } = await supabase
      .from('tutorial_exercise_submissions')
      .select('exercise_id, passed')
      .eq('user_id', userId)
      .eq('tutorial_page_id', tutorialPageId)
      .in('exercise_id', exercises.map(e => e.id))

    if (submissionsError) {
      return false
    }

    return exercises.every(exercise => {
      const submission = submissions?.find(s => s.exercise_id === exercise.id)
      return submission?.passed === true
    })
  } catch (error) {
    console.error('Error checking exercise completion:', error)
    return false
  }
}

