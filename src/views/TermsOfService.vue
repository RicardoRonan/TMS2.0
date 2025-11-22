<template>
  <div class="min-h-screen bg-bg-primary">
    <!-- Hero Section -->
    <section class="py-20 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Terms of Service
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
              <h2 class="text-2xl font-bold text-text-primary mb-4">Agreement to Terms</h2>
              <p class="text-lg leading-relaxed">
                By accessing or using MetaStack, you agree to be bound by these Terms of Service and all 
                applicable laws and regulations. If you do not agree with any of these terms, you are 
                prohibited from using or accessing this site.
              </p>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">Use License</h2>
              <p class="text-lg leading-relaxed mb-4">
                Permission is granted to temporarily access the materials on MetaStack for personal, 
                non-commercial transitory viewing only. This is the grant of a license, not a transfer 
                of title, and under this license you may not:
              </p>
              <ul class="list-disc list-inside space-y-2 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">User Accounts</h2>
              <p class="text-lg leading-relaxed">
                When you create an account with us, you must provide information that is accurate, 
                complete, and current at all times. You are responsible for safeguarding the password 
                and for all activities that occur under your account.
              </p>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">Prohibited Uses</h2>
              <p class="text-lg leading-relaxed mb-4">
                You may not use our service:
              </p>
              <ul class="list-disc list-inside space-y-2 ml-4">
                <li>In any way that violates any applicable law or regulation</li>
                <li>To transmit any material that is defamatory, offensive, or otherwise objectionable</li>
                <li>To engage in any automated use of the system</li>
                <li>To interfere with or disrupt the service or servers</li>
              </ul>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">Content</h2>
              <p class="text-lg leading-relaxed">
                Our service allows you to post, link, store, share and otherwise make available certain 
                information, text, and other content. You are responsible for the content that you post 
                to the service, including its legality, reliability, and appropriateness.
              </p>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">Termination</h2>
              <p class="text-lg leading-relaxed">
                We may terminate or suspend your account and bar access to the service immediately, 
                without prior notice or liability, for any reason whatsoever, including without limitation 
                if you breach the Terms.
              </p>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">Contact Us</h2>
              <p class="text-lg leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at 
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



















