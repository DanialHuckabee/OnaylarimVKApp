<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageLayout from './PageLayout.vue'
import { getApiUrl } from '../utils/api'

interface Flow {
  id: number
  uniqueId: string
  subject: string | null
  status: number
  documentCount: number
  pageCount: number
  flowItemCount: number
  finishedFlowItemCount: number
  flowStartDate: string | null
  finishedDate: string | null
  createdDate: string
  flowType: number
  signatureType: number
  departmentName: string | null
  departmentId: number | null
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

const route = useRoute()
const router = useRouter()
const userId = computed(() => Number(route.params.userId))
const flows = ref<Flow[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Format date to local string
const formatDate = (date: string | null) => {
  if (!date) return 'Not set'
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get status text and color
const getStatusInfo = (status: number) => {
  const statusMap: Record<number, { text: string, color: string }> = {
    1: { text: 'Oluşturuldu', color: 'bg-gray-100 text-gray-800' },
    2: { text: 'Taslak', color: 'bg-yellow-100 text-yellow-800' },
    3: { text: 'Akışta', color: 'bg-blue-100 text-blue-800' },
    4: { text: 'e-İmzalı', color: 'bg-green-100 text-green-800' },
    5: { text: 'İptal', color: 'bg-red-100 text-red-800' },
    6: { text: 'Reddedildi', color: 'bg-red-100 text-red-800' }
  }
  return statusMap[status] || { text: 'Unknown', color: 'bg-gray-100 text-gray-800' }
}

const handleSelectFlow = (flow: Flow) => {
  router.push({ 
    name: 'departments', 
    params: { flowId: flow.id.toString() },
    query: { 
      departmentId: flow.departmentId?.toString() || '',
      departmentName: flow.departmentName || ''
    }
  })
}

// Update watchEffect to use API utility
watchEffect(async () => {
  if (!userId.value) {
    flows.value = []
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await fetch(getApiUrl(`/flow/${userId.value}`))
    flows.value = await response.json()
  } catch (err) {
    error.value = 'Failed to load flows'
    console.error('Error fetching flows:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <PageLayout title="Akış Listesi">
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="!userId" class="p-6 text-center text-gray-500">
        Select a user to view their flows
      </div>
      
      <div v-else>
        <!-- Loading State -->
        <div v-if="loading" class="p-6 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-6 text-center text-red-500">
          {{ error }}
        </div>

        <!-- Flows Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 table-fixed">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="w-14 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" class="w-20 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique ID</th>
                <th scope="col" class="w-40 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th scope="col" class="w-24 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="w-20 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Docs</th>
                <th scope="col" class="w-16 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pages</th>
                <th scope="col" class="w-20 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th scope="col" class="w-32 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th scope="col" class="w-32 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th scope="col" class="w-20 px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="flows.length === 0">
                <td colspan="10" class="px-2 py-4 text-center text-sm text-gray-500">
                  No flows found for this user
                </td>
              </tr>
              <tr v-for="flow in flows" :key="flow.id" class="hover:bg-gray-50">
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{{ flow.id }}</td>
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{{ flow.uniqueId }}</td>
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-900 truncate">{{ flow.subject || '-' }}</td>
                <td class="px-2 py-4 whitespace-nowrap">
                  <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', getStatusInfo(flow.status).color]">
                    {{ getStatusInfo(flow.status).text }}
                  </span>
                </td>
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{{ flow.documentCount }}</td>
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{{ flow.pageCount }}</td>
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{{ flow.flowItemCount }}</td>
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(flow.flowStartDate) }}</td>
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-900 truncate">{{ flow.departmentName || '-' }}</td>
                <td class="px-2 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="handleSelectFlow(flow)"
                    class="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md"
                  >
                    Seç
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </PageLayout>
</template> 