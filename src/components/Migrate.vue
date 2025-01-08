<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import PageLayout from './PageLayout.vue'
import { getApiUrl } from '../utils/api'

interface OldItemNewItemMap {
  table: string
  oldId: number
  newId: number
}

interface RecordCountComparison {
  tableName: string
  includeCount: number
  sqlCount: number
  isDifferent: boolean
}

interface MigrateDto {
  error: string | null
  oldItemNewItemMaps: OldItemNewItemMap[]
  logs: string[]
  deleteQueries: string[]
  recordCountComparisons: RecordCountComparison[]
}

const route = useRoute()
const loading = ref(false)
const result = ref<MigrateDto | null>(null)
const demoMode = ref(false)

const handleMigrate = async () => {
  const flowId = route.params.flowId
  const targetDepartmentId = route.query.targetDepartmentId || '-1'
  const demoModeValue = demoMode.value ? 1 : 0

  if (!flowId) {
    return
  }

  loading.value = true
  try {
    const response = await fetch(getApiUrl(`/migrate/${flowId}/${targetDepartmentId}/${demoModeValue}`))
    result.value = await response.json()
  } catch (err) {
    console.error('Migration failed:', err)
  } finally {
    loading.value = false
  }
}

const handleDownload = () => {
  if (!result.value || !result.value.oldItemNewItemMaps.length) return

  const oldFlowId = route.params.flowId
  const newFlowId = result.value.oldItemNewItemMaps.find(m => m.table === 'Flow')?.newId || 'X'
  const fileName = `Aktarim_${oldFlowId}_${newFlowId}.txt`

  let content = ''

  // Add mapping results
  if (result.value.oldItemNewItemMaps.length > 0) {
    content += '=== Aktarım Eşleştirmeleri ===\n\n'
    result.value.oldItemNewItemMaps.forEach(map => {
      content += `Tablo: ${map.table}\n`
      content += `Eski ID: ${map.oldId}\n`
      content += `Yeni ID: ${map.newId}\n\n`
    })
  }

  // Add logs
  if (result.value.logs.length > 0) {
    content += '=== İşlem Logları ===\n\n'
    result.value.logs.forEach(log => {
      content += `${log}\n`
    })
    content += '\n'
  }

  // Add delete queries
  if (result.value.deleteQueries.length > 0) {
    content += '=== Silme Sorguları ===\n\n'
    result.value.deleteQueries.forEach(query => {
      content += `${query}\n`
    })
  }

  // Add record count comparisons
  if (result.value.recordCountComparisons.length > 0) {
    content += '=== Kayıt Sayısı Karşılaştırmaları ===\n\n'
    result.value.recordCountComparisons.forEach(comparison => {
      content += `Tablo: ${comparison.tableName}\n`
      content += `Include Sayısı: ${comparison.includeCount}\n`
      content += `SQL Sayısı: ${comparison.sqlCount}\n`
      content += `Durum: ${comparison.isDifferent ? 'Farklı' : 'Aynı'}\n\n`
    })
  }

  // Create and download the file
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <PageLayout title="Flow Aktarımı">
    <div class="bg-white rounded-lg shadow p-6">
      <!-- Initial State -->
      <div v-if="!result" class="space-y-4">
        <p class="text-gray-600">
          Flow'u seçilen departmana aktarmak için aşağıdaki butona tıklayın.
        </p>
        
        <div class="flex items-center justify-center space-x-2 mb-4">
          <input
            type="checkbox"
            id="demoMode"
            v-model="demoMode"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          >
          <label for="demoMode" class="text-sm text-gray-600">
            Demo Modu (Gerçek aktarım yapmadan sonuçları görüntüle)
          </label>
        </div>

        <div class="flex justify-center">
          <button
            @click="handleMigrate"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Aktarılıyor...</span>
            <span v-else>Aktarımı Başlat</span>
          </button>
        </div>
      </div>

      <!-- Result State -->
      <div v-else class="space-y-6">
        <!-- Error Message -->
        <div v-if="result.error" class="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 class="text-lg font-medium text-red-800 mb-2">Hata</h3>
          <p class="text-red-700">{{ result.error }}</p>
        </div>

        <!-- Mapping Results -->
        <div v-if="result.oldItemNewItemMaps.length > 0" class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Aktarım Eşleştirmeleri</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tablo</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eski ID</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yeni ID</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(map, index) in result.oldItemNewItemMaps" :key="index" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ map.table }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ map.oldId }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ map.newId }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Logs -->
        <div v-if="result.logs.length > 0" class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">İşlem Logları</h3>
          <div class="bg-gray-50 rounded-md p-4 space-y-2">
            <div v-for="(log, index) in result.logs" :key="index" class="text-sm text-gray-600">
              {{ log }}
            </div>
          </div>
        </div>

        <!-- Delete Queries -->
        <div v-if="result.deleteQueries.length > 0" class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Silme Sorguları</h3>
          <div class="bg-gray-50 rounded-md p-4">
            <div class="space-y-2">
              <div v-for="(query, index) in result.deleteQueries" :key="index" 
                   class="overflow-x-auto whitespace-nowrap bg-white rounded border border-gray-200 p-2">
                <code class="text-sm text-gray-600">{{ query }}</code>
              </div>
            </div>
          </div>
        </div>

        <!-- Record Count Comparisons -->
        <div v-if="result.recordCountComparisons.length > 0" class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Kayıt Sayısı Karşılaştırmaları</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tablo</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Include Sayısı</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SQL Sayısı</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(comparison, index) in result.recordCountComparisons" 
                    :key="index" 
                    :class="{'hover:bg-gray-50': !comparison.isDifferent, 'bg-red-50 hover:bg-red-100': comparison.isDifferent}">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ comparison.tableName }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ comparison.includeCount }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ comparison.sqlCount }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        comparison.isDifferent 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      ]"
                    >
                      {{ comparison.isDifferent ? 'Farklı' : 'Aynı' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end mt-6 space-x-4">
          <button
            v-if="result.oldItemNewItemMaps.length > 0"
            @click="handleDownload"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Sonuçları İndir
          </button>
          <button
            @click="result = null"
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Yeni Aktarım
          </button>
        </div>
      </div>
    </div>
  </PageLayout>
</template> 