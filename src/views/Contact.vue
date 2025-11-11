<template>
  <div class="min-h-screen bg-bg-primary">
    <!-- Header -->
    <section class="py-16 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Get in Touch
          </h1>
          <p class="text-xl text-text-secondary mb-8">
            Have a question or want to collaborate? We'd love to hear from you.
          </p>
        </div>
      </div>
    </section>

    <!-- Contact Form and Info -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- Contact Form -->
            <div>
              <HIGCard>
                <div class="p-6">
                  <h2 class="text-2xl font-bold text-text-primary mb-6">Send us a message</h2>
                  
                  <form @submit.prevent="handleSubmit" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <HIGInput
                        v-model="form.firstName"
                        type="text"
                        label="First Name"
                        placeholder="John"
                        :error="errors.firstName"
                        required
                        @blur="validateField('firstName')"
                      />
                      
                      <HIGInput
                        v-model="form.lastName"
                        type="text"
                        label="Last Name"
                        placeholder="Doe"
                        :error="errors.lastName"
                        required
                        @blur="validateField('lastName')"
                      />
                    </div>
                    
                    <HIGInput
                      v-model="form.email"
                      type="email"
                      label="Email"
                      placeholder="john@example.com"
                      :error="errors.email"
                      required
                      @blur="validateField('email')"
                    />
                    
                    <HIGInput
                      v-model="form.subject"
                      type="text"
                      label="Subject"
                      placeholder="How can we help?"
                      :error="errors.subject"
                      required
                      @blur="validateField('subject')"
                    />
                    
                    <FullScreenTextarea
                      v-model="form.message"
                      label="Message"
                      :rows="6"
                      placeholder="Tell us about your project or question..."
                      :error="errors.message"
                      required
                      @blur="validateField('message')"
                    />
                    
                    <HIGButton
                      type="submit"
                      variant="primary"
                      size="lg"
                      :loading="loading"
                      :disabled="!isFormValid"
                      full-width
                    >
                      Send Message
                    </HIGButton>
                  </form>
                </div>
              </HIGCard>
            </div>

            <!-- Contact Information -->
            <div class="space-y-8">
              <HIGCard>
                <div class="p-6">
                  <h2 class="text-2xl font-bold text-text-primary mb-6">Contact Information</h2>
                  
                  <div class="space-y-6">
                    <div class="flex items-start space-x-4">
                      <div class="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon name="mail" :size="24" class="text-white" />
                      </div>
                      <div>
                        <h3 class="font-semibold text-text-primary mb-1">Email</h3>
                        <div class="space-y-1">
                          <a href="mailto:metastackdev@gmail.com" class="block text-text-secondary hover:text-primary-500 transition-colors">
                            metastackdev@gmail.com
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div class="flex items-start space-x-4">
                      <div class="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon name="location" :size="24" class="text-white" />
                      </div>
                      <div>
                        <h3 class="font-semibold text-text-primary mb-1">Address</h3>
                        <p class="text-text-secondary">
                          Cape Town<br>
                          South Africa
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </HIGCard>

              <!-- Social Links -->
              <HIGCard>
                <div class="p-6">
                  <h2 class="text-2xl font-bold text-text-primary mb-6">Follow the Creators</h2>
                  
                  <div class="space-y-4">
                    <div>
                      <a href="https://www.linkedin.com/in/the-dev-ricardo/" target="_blank" rel="noopener noreferrer" class="font-semibold text-text-primary">
                        Ricardo Moses
                      </a>
                      <div class="text-sm text-text-secondary">Co-Founder and Full-Stack Developer</div>
                    </div>
                    <div>
                      <a href="https://www.linkedin.com/in/jesse-spence-83606b210/" target="_blank" rel="noopener noreferrer" class="font-semibold text-text-primary">
                        Jesse Spence
                      </a>
                      <div class="text-sm text-text-secondary">Co-Founder and SEO Specialist</div>
                    </div>
                    <div>
                      <a href="https://www.linkedin.com/in/abdus-samad-charles-75036b210/" target="_blank" rel="noopener noreferrer" class="font-semibold text-text-primary">
                        Abdus-Samad Charles
                      </a>
                      <div class="text-sm text-text-secondary">Co-Founder and SEO Specialist</div>
                    </div>
                  </div>
                </div>
              </HIGCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import HIGCard from '../components/hig/HIGCard.vue'
import HIGButton from '../components/hig/HIGButton.vue'
import HIGInput from '../components/hig/HIGInput.vue'
import FullScreenTextarea from '../components/FullScreenTextarea.vue'
import Icon from '../components/Icon.vue'

const store = useStore()

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  subject: '',
  message: ''
})

const errors = ref<Record<string, string>>({})
const loading = ref(false)

const isFormValid = computed(() => {
  return form.value.firstName &&
         form.value.lastName &&
         form.value.email &&
         form.value.subject &&
         form.value.message &&
         !Object.keys(errors.value).length
})

const validateField = (field: string) => {
  switch (field) {
    case 'firstName':
      if (!form.value.firstName) {
        errors.value.firstName = 'First name is required'
      } else {
        delete errors.value.firstName
      }
      break
    case 'lastName':
      if (!form.value.lastName) {
        errors.value.lastName = 'Last name is required'
      } else {
        delete errors.value.lastName
      }
      break
    case 'email':
      if (!form.value.email) {
        errors.value.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
        errors.value.email = 'Please enter a valid email'
      } else {
        delete errors.value.email
      }
      break
    case 'subject':
      if (!form.value.subject) {
        errors.value.subject = 'Subject is required'
      } else {
        delete errors.value.subject
      }
      break
    case 'message':
      if (!form.value.message) {
        errors.value.message = 'Message is required'
      } else if (form.value.message.length < 10) {
        errors.value.message = 'Message must be at least 10 characters'
      } else {
        delete errors.value.message
      }
      break
  }
}

const handleSubmit = async () => {
  // Validate all fields
  validateField('firstName')
  validateField('lastName')
  validateField('email')
  validateField('subject')
  validateField('message')
  
  if (!isFormValid.value) return

  loading.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    store.dispatch('addNotification', {
      type: 'success',
      message: 'Thank you! Your message has been sent successfully.'
    })
    
    // Reset form
    form.value = {
      firstName: '',
      lastName: '',
      email: '',
      subject: '',
      message: ''
    }
  } catch (error) {
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Failed to send message. Please try again.'
    })
  } finally {
    loading.value = false
  }
}
</script>
