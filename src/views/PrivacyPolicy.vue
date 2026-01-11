<template>
  <div class="min-h-screen bg-bg-primary">
    <!-- Hero Section -->
    <section class="py-20 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Privacy Policy
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
              <h2 class="text-2xl font-bold text-text-primary mb-4">
                Introduction
              </h2>
              <p class="text-lg leading-relaxed">
                At MetaStack, we take your privacy seriously. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">
                Information We Collect
              </h2>
              <p class="text-lg leading-relaxed mb-4">
                We may collect information about you in a variety of ways. The information we may collect 
                on the Site includes:
              </p>
              <ul class="list-disc list-inside space-y-2 ml-4">
                <li>Personal data such as name, email address, and other contact information</li>
                <li>Account credentials and profile information</li>
                <li>Usage data and analytics information</li>
                <li>Device information and browser data</li>
              </ul>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">
                How We Use Your Information
              </h2>
              <p class="text-lg leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul class="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze trends and usage</li>
              </ul>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">
                Data Security
              </h2>
              <p class="text-lg leading-relaxed">
                We use administrative, technical, and physical security measures to help protect your 
                personal information. While we have taken reasonable steps to secure the personal information 
                you provide to us, please be aware that despite our efforts, no security measures are perfect 
                or impenetrable.
              </p>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">
                Your Rights
              </h2>
              <p class="text-lg leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul class="list-disc list-inside space-y-2 ml-4">
                <li>Access and receive a copy of your personal data</li>
                <li>Rectify inaccurate personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request restriction of processing your personal data</li>
              </ul>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">
                Contact Us
              </h2>
              <p class="text-lg leading-relaxed">
                If you have questions or concerns about this Privacy Policy, please contact us at 
                <router-link
                  to="/contact"
                  class="text-primary-500 hover:text-primary-600"
                >
                  our contact page
                </router-link>.
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



















