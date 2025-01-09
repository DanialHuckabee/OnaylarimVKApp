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

interface TargetFlow {
  uniqueId: string
  targetId: number
  subject: string
}

interface GetUserFlowsDto {
  flows: Flow[]
  targetFlowDtos: TargetFlow[]
}

const route = useRoute()
const router = useRouter()
const userId = computed(() => Number(route.params.userId))
const flowsData = ref<GetUserFlowsDto | null>(null)
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
    flowsData.value = null
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await fetch(getApiUrl(`/flow/${userId.value}`))
    flowsData.value = await response.json()
  } catch (err) {
    error.value = 'Failed to load flows'
    console.error('Error fetching flows:', err)
  } finally {
    loading.value = false
  }
})

// Check if flow has been migrated
const isFlowMigrated = (uniqueId: string) => {
  if (!flowsData.value?.targetFlowDtos) return false
  return flowsData.value.targetFlowDtos.some(target => target.uniqueId === uniqueId)
}

// Get migrated flow info
const getMigratedFlowInfo = (uniqueId: string) => {
  if (!flowsData.value?.targetFlowDtos) return null
  return flowsData.value.targetFlowDtos.find(target => target.uniqueId === uniqueId)
}
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

        <!-- Data State -->
        <div v-else-if="flowsData" class="space-y-6">
          <!-- Source Flows -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 px-6 pt-6">Kaynak Flow'lar</h3>
            <div class="mt-4 overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique ID</th>
                    <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doc Count</th>
                    <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page Count</th>
                    <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flow Start Date</th>
                    <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Migration Status</th>
                    <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-if="flowsData.flows.length === 0">
                    <td colspan="10" class="px-2 py-4 text-center text-sm text-gray-500">
                      No flows found for this user
                    </td>
                  </tr>
                  <tr v-for="flow in flowsData.flows" :key="flow.id" class="hover:bg-gray-50">
                    <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{{ flow.id }}</td>
                    <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{{ flow.uniqueId }}</td>
                    <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{{ flow.subject || '-' }}</td>
                    <td class="px-2 py-4 whitespace-nowrap">
                      <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusInfo(flow.status).color]">
                        {{ getStatusInfo(flow.status).text }}
                      </span>
                    </td>
                    <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{{ flow.documentCount }}</td>
                    <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{{ flow.pageCount }}</td>
                    <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(flow.flowStartDate) }}</td>
                    <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{{ flow.departmentName || '-' }}</td>
                    <td class="px-2 py-4 whitespace-nowrap">
                      <div v-if="isFlowMigrated(flow.uniqueId)" class="text-sm">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Aktarıldı
                        </span>
                        <span class="text-xs text-gray-500 mt-1 block">
                          ID: {{ getMigratedFlowInfo(flow.uniqueId)?.targetId }}
                        </span>
                        <span class="text-xs text-gray-500 mt-1 block">
                          ID: {{ getMigratedFlowInfo(flow.uniqueId)?.uniqueId }}
                        </span>
                        <span class="text-xs text-gray-500 mt-1 block">
                          ID: {{ getMigratedFlowInfo(flow.uniqueId)?.subject }}
                        </span>
                      </div>
                      <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Aktarılmadı
                      </span>
                    </td>
                    <td class="px-2 py-4 whitespace-nowrap text-sm">
                      <button 
                        @click="handleSelectFlow(flow)"
                        :disabled="isFlowMigrated(flow.uniqueId)"
                        class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Seç
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Target Flows -->
          <div v-if="flowsData.targetFlowDtos.length > 0" class="border-t pt-6">
            <h3 class="text-lg font-medium text-gray-900 px-6">Hedef Flow'lar</h3>
            <div class="mt-4 overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique ID</th>
                    <th scope="col" class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="flow in flowsData.targetFlowDtos" :key="flow.targetId" class="hover:bg-gray-50">
                    <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{{ flow.targetId }}</td>
                    <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{{ flow.uniqueId }}</td>
                    <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{{ flow.subject || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- No Data State -->
        <div v-else class="p-6 text-center text-gray-500">
          No flow data available
        </div>
      </div>
    </div>
  </PageLayout>
</template> 