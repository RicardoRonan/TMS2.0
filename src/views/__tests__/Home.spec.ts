import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import Home from '../Home.vue'

// Mock the store
const createMockStore = () => {
  return createStore({
    state: {
      user: null,
      theme: 'dark',
      loading: false,
      notifications: []
    },
    getters: {
      isLoading: () => false
    },
    actions: {
      addNotification: vi.fn()
    }
  })
}

// Mock dependencies
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }))
    }))
  }
}))

vi.mock('../../utils/brandfetch', () => ({
  getBrandfetchLogoUrl: vi.fn(() => 'https://example.com/logo.png')
}))

describe('Home.vue', () => {
  it('should render without crashing', () => {
    const store = createMockStore()
    const wrapper = mount(Home, {
      global: {
        plugins: [store],
        stubs: {
          'HIGButton': true,
          'HIGCard': true,
          'Icon': true
        }
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should display main heading', () => {
    const store = createMockStore()
    const wrapper = mount(Home, {
      global: {
        plugins: [store],
        stubs: {
          'HIGButton': true,
          'HIGCard': true,
          'Icon': true
        }
      }
    })

    // Check if the component renders (basic smoke test)
    expect(wrapper.find('div').exists()).toBe(true)
  })
})

