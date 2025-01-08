<script setup lang="ts">
import { computed, ref } from 'vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'

import { useRouter } from 'vue-router'
import PageLayout from './PageLayout.vue'
import OrganizationCompareModal from './OrganizationCompareModal.vue'
import { getApiUrl } from '../utils/api'

interface User {
  email: string
  displayName: string | null
  id: number
  organizationId: number
  organizationDisplayName: string
}

interface UserPair {
  sourceUser: User
  targetUser: User
}

interface OrganizationUsersCompareDto {
  sourceUser: {
    id: number
    displayName: string
    organizationId: number
    organizationDisplayName: string
  }
  targetUser: {
    id: number
    displayName: string
    organizationId: number
    organizationDisplayName: string
  }
  isOrganizationDifferent: boolean
}

const props = defineProps<{
  users: UserPair[]
}>()

const emit = defineEmits<{
  (e: 'viewFlows', userId: number): void
}>()

const router = useRouter()
const loading = ref(false)
const showOrgCompareModal = ref(false)
const orgCompareData = ref<OrganizationUsersCompareDto | null>(null)
const selectedUserId = ref<number | null>(null)

const handleViewFlows = async (userId: number) => {
  selectedUserId.value = userId
  loading.value = true
  
  try {
    const response = await fetch(getApiUrl(`/organization/users/${userId}`))
    orgCompareData.value = await response.json()
    showOrgCompareModal.value = true
  } catch (err) {
    console.error('Error fetching organization comparison:', err)
    // Proceed with navigation even if org comparison fails
    proceedWithNavigation(userId)
  } finally {
    loading.value = false
  }
}

const proceedWithNavigation = (userId: number) => {
  showOrgCompareModal.value = false
  router.push({ name: 'flows', params: { userId: userId.toString() } })
}

// Group users by organization
const groupedUsers = computed(() => {
  const groups = new Map<number, { name: string, users: UserPair[] }>()
  
  props.users.forEach(userPair => {
    const orgId = userPair.sourceUser.organizationId
    let  orgName = userPair.sourceUser.organizationDisplayName  || userPair.targetUser.organizationDisplayName || 'No Organization Name'
    orgName +=  " || Source Org Id: " + userPair.sourceUser.organizationId + " - Target Org Id: " + userPair.targetUser.organizationId
    
    if (!groups.has(orgId)) {
      groups.set(orgId, { name: orgName, users: [] })
    }
    groups.get(orgId)?.users.push(userPair)
  })
  
  // Convert map to array and sort by organization name
  return Array.from(groups.entries())
    .sort(([, a], [, b]) => a.name.localeCompare(b.name))
})
</script>

<template>
  <PageLayout title="Kullanıcı Listesi">
    <div class="bg-white rounded-lg shadow">
      <!-- Groups -->
      <div class="divide-y divide-gray-200">
        <template v-for="[orgId, group] in groupedUsers" :key="orgId">
          <Disclosure v-slot="{ open }">
            <!-- Organization Header -->
            <DisclosureButton class="w-full">
              <div class="grid grid-cols-7 gap-4 px-6 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer">
                <div class="flex items-center col-span-7">
                  <div 
                    class="w-5 h-5 mr-2 transform transition-transform duration-200 bg-gray-300"
                    :class="{ 'rotate-90': open }"
                    aria-hidden="true"
                  />
                  <span class="font-medium">{{ group.name }} (User Count: {{ group.users.length }})</span>
                </div>
                
              </div>
            </DisclosureButton>

            <!-- User Rows -->
            <DisclosurePanel>
              <!-- Sub-headers -->
              <div class="grid grid-cols-7 gap-4 px-6 py-2 bg-gray-100 text-xs font-medium text-gray-500">
                <div></div>
                <div>Source ID</div>
                <div>Target ID</div>
                <div>Source Name</div>
                <div>Target Name</div>
                <div>Source Email</div>
                <div>Actions</div>
              </div>
              <!-- User data -->
              <div v-for="user in group.users" :key="user.sourceUser.id" 
                   class="grid grid-cols-7 gap-4 px-6 py-4 hover:bg-gray-50">
                <div></div>
                <div class="text-sm text-gray-500">{{ user.sourceUser.id }}</div>
                <div class="text-sm text-gray-500">{{ user.targetUser.id }}</div>
                <div class="text-sm text-gray-900"><span class="text-gray-900 whitespace-nowrap block">{{ user.sourceUser.displayName || '-' }}</span> <span class="text-gray-500 whitespace-nowrap block">Source Org: {{ user.sourceUser.organizationDisplayName || '-' }}</span> <span class="text-gray-500 whitespace-nowrap block">Source Org Id: {{ user.sourceUser.organizationId || '-' }}</span> </div>
                <div class="text-sm text-gray-900"><span class="text-gray-900 whitespace-nowrap block">{{ user.targetUser.displayName || '-' }}</span> <span class="text-gray-500 whitespace-nowrap block">Source Org: {{ user.targetUser.organizationDisplayName || '-' }}</span> <span class="text-gray-500 whitespace-nowrap block">Target Org Id: {{ user.targetUser.organizationId || '-' }}</span> </div>
                <div class="text-sm text-gray-900">{{ user.sourceUser.email }}</div>
                <div>
                  <button 
                    @click="handleViewFlows(user.sourceUser.id)"
                    class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Flows
                  </button>
                </div>
              </div>
            </DisclosurePanel>
          </Disclosure>
        </template>
      </div>
    </div>

    <OrganizationCompareModal
      :is-open="showOrgCompareModal"
      :data="orgCompareData"
      @close="showOrgCompareModal = false"
      @proceed="selectedUserId && proceedWithNavigation(selectedUserId)"
    />
  </PageLayout>
</template>

<style>
.transform {
  transition: transform 0.2s;
}
</style>