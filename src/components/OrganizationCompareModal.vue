<script setup lang="ts">
import { Dialog, DialogPanel } from '@headlessui/vue'
import { computed } from 'vue'
import { type OrganizationUsersCompareDto } from '../types/OrganizationUsersCompareDto'

const props = defineProps<{
  isOpen: boolean
  data: OrganizationUsersCompareDto | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'proceed'): void
}>()

const canProceed = computed(() => {
  if (!props.data) return false
  return props.data.unmatchedSourceUsers.length === 0
})
</script>

<template>
  <Dialog as="div" @close="emit('close')" :open="isOpen" class="relative z-50">
    <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
    
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-3xl rounded bg-white p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Organizasyon Karşılaştırması</h3>
        
        <div v-if="data" class="space-y-6">
          <!-- Organizations -->
          <div class="grid grid-cols-2 gap-6">
            <!-- Source Organization -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">Kaynak Organizasyon</h4>
              <div class="space-y-1">
                <p class="text-sm text-gray-600">İsim: {{ data.sourceOrganization.displayName }}</p>
                <p class="text-sm text-gray-600">Yasal İsim: {{ data.sourceOrganization.legalName }}</p>
                <p class="text-sm text-gray-600">ID: {{ data.sourceOrganization.id }}</p>
              </div>
            </div>

            <!-- Target Organization -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-700 mb-2">Hedef Organizasyon</h4>
              <div class="space-y-1">
                <p class="text-sm text-gray-600">İsim: {{ data.targetOrganization.displayName }}</p>
                <p class="text-sm text-gray-600">Yasal İsim: {{ data.targetOrganization.legalName }}</p>
                <p class="text-sm text-gray-600">ID: {{ data.targetOrganization.id }}</p>
              </div>
            </div>
          </div>

          

          <!-- User Lists -->
          <div class="mt-6">
            <h4 class="font-medium text-gray-700 mb-4">Kullanıcı Karşılaştırması</h4>
            <div class="border rounded-lg overflow-hidden">
              <!-- Table Headers -->
              <div class="grid grid-cols-2 gap-4 bg-gray-50 p-2 border-b">
                <div class="font-medium text-gray-700">Kaynak</div>
                <div class="font-medium text-gray-700">Hedef</div>
              </div>

              <!-- Table Content -->
              <div class="divide-y">
                <!-- Matched Users -->
                <div v-for="user in data.matchedUsers" :key="user.id" 
                     class="grid grid-cols-2 gap-4 p-2 bg-green-50">
                  <div class="text-sm font-medium text-gray-900"><span class="text-gray-400 font-normal">{{ user.id }}</span> {{ user.displayName }} <span class="text-gray-400 font-normal">{{ user.email }}</span></div>
                  <div class="text-sm font-medium text-gray-900"><span class="text-gray-400 font-normal">{{ user.id }}</span> {{ user.displayName }} <span class="text-gray-400 font-normal">{{ user.email }}</span></div>
                </div>

                <!-- Unmatched Source Users -->
                <div v-for="sourceUser in data.unmatchedSourceUsers" 
                     :key="'source-' + sourceUser.id"
                     class="grid grid-cols-2 gap-4 p-2 bg-red-50">
                  <div class="text-sm font-medium text-gray-900"><span class="text-gray-400 font-normal">{{ sourceUser.id }}</span> {{ sourceUser.displayName }} <span class="text-gray-400 font-normal">{{ sourceUser.email }}</span></div>
                  <div class="text-sm text-gray-500">Yok</div>
                </div>

                <!-- Unmatched Target Users -->
                <div v-for="targetUser in data.unmatchedTargetUsers" 
                     :key="'target-' + targetUser.id"
                     class="grid grid-cols-2 gap-4 p-2 bg-yellow-50">
                  <div class="text-sm text-gray-500">Yok</div>
                  <div class="text-sm font-medium text-gray-900"><span class="text-gray-400 font-normal">{{ targetUser.id }}</span> {{ targetUser.displayName }} <span class="text-gray-400 font-normal">{{ targetUser.email }}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button
            @click="emit('close')"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            İptal
          </button>
          <button
            @click="emit('proceed')"
            :disabled="!canProceed"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Devam Et
          </button>
        </div>

        <!-- Add warning message when cannot proceed -->
        <div v-if="data && !canProceed" class="mt-4">
          <p class="text-sm text-red-600">
            Aktarıma devam edilemiyor: Kaynak organizasyondaki tüm kullanıcıların hedef organizasyonda eşleşmesi gerekiyor.
          </p>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>