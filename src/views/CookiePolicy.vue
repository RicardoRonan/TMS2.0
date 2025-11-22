<template>
  <div class="min-h-screen bg-bg-primary">
    <!-- Hero Section -->
    <section class="py-20 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Cookie Policy
          </h1>
          <p class="text-xl text-text-secondary">
            Last updated: {{ currentDate }}
          </p>
        </div>
      </div>
    </section>

    <!-- Content Section -->
    <section class="py-20">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto prose prose-invert">
          <div class="space-y-8 text-text-secondary">
            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">What Are Cookies</h2>
              <p class="text-lg leading-relaxed">
                Cookies are small text files that are placed on your computer or mobile device when you 
                visit a website. They are widely used to make websites work more efficiently and provide 
                information to the owners of the site.
              </p>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">How We Use Cookies</h2>
              <p class="text-lg leading-relaxed mb-4">
                We use cookies for a variety of reasons, including:
              </p>
              <ul class="list-disc list-inside space-y-2 ml-4">
                <li>To enable certain functions of the service</li>
                <li>To provide analytics and improve our service</li>
                <li>To store your preferences and personalize your experience</li>
                <li>To authenticate users and prevent fraudulent use</li>
              </ul>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">Types of Cookies We Use</h2>
              <div class="space-y-4">
                <div>
                  <h3 class="text-xl font-semibold text-text-primary mb-2">Essential Cookies</h3>
                  <p class="text-lg leading-relaxed">
                    These cookies are necessary for the website to function properly. They enable core 
                    functionality such as security, network management, and accessibility.
                  </p>
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-text-primary mb-2">Analytics Cookies</h3>
                  <p class="text-lg leading-relaxed">
                    These cookies help us understand how visitors interact with our website by collecting 
                    and reporting information anonymously.
                  </p>
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-text-primary mb-2">Functional Cookies</h3>
                  <p class="text-lg leading-relaxed">
                    These cookies allow the website to remember choices you make and provide enhanced, 
                    more personal features.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">Managing Cookies</h2>
              <p class="text-lg leading-relaxed">
                You can control and manage cookies in various ways. Please keep in mind that removing 
                or blocking cookies can impact your user experience and parts of our website may no longer 
                be fully accessible. Most browsers allow you to refuse to accept cookies and to delete 
                cookies. The methods for doing so vary from browser to browser.
              </p>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">Third-Party Cookies</h2>
              <p class="text-lg leading-relaxed">
                In addition to our own cookies, we may also use various third-party cookies to report 
                usage statistics of the service and deliver advertisements on and through the service.
              </p>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">Contact Us</h2>
              <p class="text-lg leading-relaxed">
                If you have any questions about our use of cookies, please contact us at 
                <router-link to="/contact" class="text-primary-500 hover:text-primary-600">our contact page</router-link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})
</script>

<style scoped>
.prose ul {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>



















