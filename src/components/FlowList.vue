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
const selectedFlows = ref<Flow[]>([])

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
    params: { flowIds: flow.id.toString() },
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

// Compute if bulk transfer is possible (2 or more selected flows with same department)
const canBulkTransfer = computed(() => {
  if (selectedFlows.value.length < 2) return false
  
  // Get the department ID of the first selected flow
  const firstDeptId = selectedFlows.value[0].departmentId
  
  // Check if all selected flows have the same department ID
  return selectedFlows.value.every(flow => 
    flow.departmentId === firstDeptId && !isFlowMigrated(flow.uniqueId)
  )
})

// Handle checkbox selection
const toggleFlowSelection = (flow: Flow) => {
  const index = selectedFlows.value.findIndex(f => f.id === flow.id)
  if (index === -1) {
    selectedFlows.value.push(flow)
  } else {
    selectedFlows.value.splice(index, 1)
  }
}

const handleBulkTransfer = () => {
  if (!canBulkTransfer.value) return
  
  // Get the first flow's department info since we know they're all the same
  const firstFlow = selectedFlows.value[0]
  
  router.push({ 
    name: 'departments', 
    params: { flowIds: selectedFlows.value.map(f => f.id.toString()).join(',') },
    query: { 
      departmentId: firstFlow.departmentId?.toString() || '',
      departmentName: firstFlow.departmentName || ''
    }
  })
}
</script>

<template>
  <PageLayout title="Akış Listesi">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-base font-semibold text-gray-900">Akış Listesi</h1>
          <p class="mt-2 text-sm text-gray-700">Kullanıcıya ait akış listesi ve aktarım durumları.</p>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            :disabled="!canBulkTransfer"
            @click="handleBulkTransfer"
            class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Toplu Aktar ({{ selectedFlows.length }})
          </button>
        </div>
      </div>

      <div v-if="!userId" class="mt-8 text-center text-gray-500">
        Select a user to view their flows
      </div>
      
      <div v-else>
        <!-- Loading State -->
        <div v-if="loading" class="mt-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="mt-8 text-center text-red-500">
          {{ error }}
        </div>

        <!-- Data State -->
        <div v-else-if="flowsData" class="space-y-8">
          <!-- Source Flows -->
          <div class="mt-8 flow-root">
            <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table class="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" class="relative whitespace-nowrap py-3.5 pl-4 pr-3 sm:pl-0">
                        <span class="sr-only">Select</span>
                      </th>
                      <th scope="col" class="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">ID / Unique ID</th>
                      <th scope="col" class="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900">Subject</th>
                      <th scope="col" class="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th scope="col" class="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900">Flow Start Date</th>
                      <th scope="col" class="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900">Department</th>
                      <th scope="col" class="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900">Migration Status</th>
                      <th scope="col" class="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-0">
                        <span class="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-if="flowsData.flows.length === 0">
                      <td colspan="8" class="px-2 py-4 text-center text-sm text-gray-500">
                        No flows found for this user
                      </td>
                    </tr>
                    <tr v-for="flow in flowsData.flows" :key="flow.id" class="hover:bg-gray-50">
                      <td class="relative whitespace-nowrap py-2 pl-4 pr-3 sm:pl-0">
                        <input
                          type="checkbox"
                          :checked="selectedFlows.some(f => f.id === flow.id)"
                          :disabled="isFlowMigrated(flow.uniqueId)"
                          @change="toggleFlowSelection(flow)"
                          class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50"
                        >
                      </td>
                      <td class="whitespace-nowrap py-2 pl-4 pr-3 sm:pl-0">
                        <div class="text-sm text-gray-900">ID: {{ flow.id }}</div>
                        <div class="text-sm text-gray-500">{{ flow.uniqueId }}</div>
                      </td>
                      <td class="px-2 py-2">
                        <div class="text-sm font-medium text-gray-900">{{ flow.subject || '-' }}</div>
                        <div class="text-xs text-gray-500 mt-1">
                          <span class="mr-3">Doküman: {{ flow.documentCount }}</span>
                          <span>Sayfa: {{ flow.pageCount }}</span>
                        </div>
                      </td>
                      <td class="whitespace-nowrap px-2 py-2">
                        <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusInfo(flow.status).color]">
                          {{ getStatusInfo(flow.status).text }}
                        </span>
                      </td>
                      <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-500">{{ formatDate(flow.flowStartDate) }}</td>
                      <td class="whitespace-nowrap px-2 py-2 text-sm text-gray-900">{{ flow.departmentName || '-' }}</td>
                      <td class="whitespace-nowrap px-2 py-2">
                        <div v-if="isFlowMigrated(flow.uniqueId)" class="text-sm">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Aktarıldı
                          </span>
                          <span class="text-xs text-gray-500 mt-1 block">
                            ID: {{ getMigratedFlowInfo(flow.uniqueId)?.targetId }}
                          </span>
                        </div>
                        <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Aktarılmadı
                        </span>
                      </td>
                      <td class="relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <button 
                          @click="handleSelectFlow(flow)"
                          :disabled="isFlowMigrated(flow.uniqueId)"
                          class="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
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

         
        </div>

        <!-- No Data State -->
        <div v-else class="mt-8 text-center text-gray-500">
          No flow data available
        </div>
      </div>
    </div>
  </PageLayout>
</template> 