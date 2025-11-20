<template>
  <div class="min-h-screen bg-bg-primary">
    <!-- Hero Section -->
    <section class="py-20 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            DMCA Policy
          </h1>
          <p class="text-xl text-text-secondary">
            Digital Millennium Copyright Act
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
              <h2 class="text-2xl font-bold text-text-primary mb-4">Copyright Infringement Notification</h2>
              <p class="text-lg leading-relaxed">
                MetaStack respects the intellectual property rights of others and expects its users to do 
                the same. In accordance with the Digital Millennium Copyright Act (DMCA), we will respond 
                to clear notices of alleged copyright infringement.
              </p>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">Filing a DMCA Notice</h2>
              <p class="text-lg leading-relaxed mb-4">
                If you believe that content available on MetaStack infringes your copyright, please provide 
                the following information in writing to our designated copyright agent:
              </p>
              <ul class="list-disc list-inside space-y-2 ml-4">
                <li>A physical or electronic signature of the copyright owner or authorized agent</li>
                <li>Identification of the copyrighted work claimed to have been infringed</li>
                <li>Identification of the material that is claimed to be infringing and information 
                    sufficient to locate the material</li>
                <li>Your contact information, including address, telephone number, and email address</li>
                <li>A statement that you have a good faith belief that use of the material is not authorized</li>
                <li>A statement that the information in the notification is accurate and that you are 
                    authorized to act on behalf of the copyright owner</li>
              </ul>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">Counter-Notification</h2>
              <p class="text-lg leading-relaxed">
                If you believe that your content was removed in error, you may file a counter-notification. 
                The counter-notification must include your contact information, identification of the 
                removed content, a statement under penalty of perjury that the content was removed by 
                mistake, and your consent to the jurisdiction of the federal court.
              </p>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">Repeat Infringers</h2>
              <p class="text-lg leading-relaxed">
                It is our policy to terminate, in appropriate circumstances, the accounts of users who 
                are repeat infringers of intellectual property rights.
              </p>
            </div>

            <div>
              <h2 class="text-2xl font-bold text-text-primary mb-4">Contact Information</h2>
              <p class="text-lg leading-relaxed">
                For copyright-related inquiries, please contact us at 
                <router-link to="/contact" class="text-primary-500 hover:text-primary-600">our contact page</router-link> 
                with the subject line "DMCA Notice".
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.prose ul {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>
















