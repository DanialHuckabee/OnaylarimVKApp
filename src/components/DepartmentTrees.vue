<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageLayout from './PageLayout.vue'
import { getApiUrl } from '../utils/api'

interface Department {
  id: number
  displayName: string
  childDepartments: Department[]
}

interface DepartmentTrees {
  sourceDepartments: Department[]
  targetDepartments: Department[]
}

const props = defineProps<{
  flowId: number
}>()

const route = useRoute()
const router = useRouter()
const trees = ref<DepartmentTrees | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const selectedTargetDepartmentId = ref<number | null>(null)

const sourceDepartmentId = computed(() => {
  const id = route.query.departmentId
  return id ? Number(id) : null
})

const sourceDepartmentName = computed(() => {
  return route.query.departmentName as string || null
})

// Fetch department trees when flowId changes
watchEffect(async () => {
  if (!props.flowId) {
    trees.value = null
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await fetch(getApiUrl(`/organization/${props.flowId}`))
    
    trees.value = await response.json()
    console.log(trees.value)
  } catch (err) {
    error.value = 'Failed to load department trees'
    console.error('Error fetching department trees:', err)
  } finally {
    loading.value = false
  }
})

const handleNext = () => {
  router.push({ 
    name: 'migrate', 
    params: { 
      flowId: props.flowId.toString()
    },
    query: {
      sourceDepartmentId: sourceDepartmentId.value?.toString() || '',
      targetDepartmentId: selectedTargetDepartmentId.value?.toString() || ''
    }
  })
}

const isSourceDepartment = (department: Department): boolean => {
  if (!sourceDepartmentId.value) return false
  if (department.id === sourceDepartmentId.value) return true
  
  for (const child of department.childDepartments) {
    if (isSourceDepartment(child)) return true
  }
  
  return false
}

const handleTargetDepartmentSelect = (departmentId: number) => {
  selectedTargetDepartmentId.value = departmentId
}
</script>

<template>
  <PageLayout title="Departman Ağacı">
    <div class="bg-white rounded-lg shadow">
      <!-- Loading State -->
      <div v-if="loading" class="p-6 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-6 text-center text-red-500">
        {{ error }}
      </div>

      <!-- Trees Display -->
      <div v-else-if="trees" class="space-y-6 p-6">
        <div class="grid grid-cols-2 gap-6">
          <!-- Source Departments -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Source Departments</h3>
            <div v-if="!sourceDepartmentId" class="text-sm text-gray-500 mb-4">
              Seçilen flow'un department'i bulunmamaktadır.
            </div>
            <div v-else class="border rounded-lg p-4">
              <div v-for="department in trees.sourceDepartments" :key="department.id" class="department-tree">
                <div class="flex items-center py-2">
                  <span 
                    class="text-sm font-medium"
                    :class="{ 'text-blue-600': isSourceDepartment(department), 'text-gray-900': !isSourceDepartment(department) }"
                  >
                  {{ department.id }}  {{ department.displayName }}
                  </span>
                </div>
                <div v-if="department.childDepartments.length > 0" class="pl-4 border-l border-gray-200">
                  <div v-for="child in department.childDepartments" :key="child.id" class="department-tree">
                    <div class="flex items-center py-2">
                      <span 
                        class="text-sm"
                        :class="{ 'text-blue-600': isSourceDepartment(child), 'text-gray-900': !isSourceDepartment(child) }"
                      >
                      {{ child.id }}   {{ child.displayName }}
                      </span>
                    </div>
                    <div v-if="child.childDepartments.length > 0" class="pl-4 border-l border-gray-200">
                      <div v-for="grandChild in child.childDepartments" :key="grandChild.id" class="department-tree">
                        <div class="flex items-center py-2">
                          <span 
                            class="text-sm"
                            :class="{ 'text-blue-600': isSourceDepartment(grandChild), 'text-gray-900': !isSourceDepartment(grandChild) }"
                          >
                            {{ grandChild.displayName }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Target Departments -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Target Departments</h3>
            <div v-if="!sourceDepartmentId" class="text-sm text-gray-500 mb-4">
              Seçilen flow'un department'i olmadığı için hedef department seçimine gerek yoktur.
            </div>
            <div v-else class="border rounded-lg p-4">
              <div v-for="department in trees.targetDepartments" :key="department.id" class="department-tree">
                <div class="flex items-center py-2">
                  <button 
                    class="text-sm font-medium text-left w-full px-2 py-1 rounded hover:bg-gray-100"
                    :class="{ 'bg-blue-50 text-blue-600': selectedTargetDepartmentId === department.id }"
                    @click="handleTargetDepartmentSelect(department.id)"
                  >
                 {{ department.id }} {{ department.displayName }}
                  </button>
                </div>
                <div v-if="department.childDepartments.length > 0" class="pl-4 border-l border-gray-200">
                  <div v-for="child in department.childDepartments" :key="child.id" class="department-tree">
                    <div class="flex items-center py-2">
                      <button 
                        class="text-sm text-left w-full px-2 py-1 rounded hover:bg-gray-100"
                        :class="{ 'bg-blue-50 text-blue-600': selectedTargetDepartmentId === child.id }"
                        @click="handleTargetDepartmentSelect(child.id)"
                      >
                       {{ child.id }} {{ child.displayName }}
                      </button>
                    </div>
                    <div v-if="child.childDepartments.length > 0" class="pl-4 border-l border-gray-200">
                      <div v-for="grandChild in child.childDepartments" :key="grandChild.id" class="department-tree">
                        <div class="flex items-center py-2">
                          <button 
                            class="text-sm text-left w-full px-2 py-1 rounded hover:bg-gray-100"
                            :class="{ 'bg-blue-50 text-blue-600': selectedTargetDepartmentId === grandChild.id }"
                            @click="handleTargetDepartmentSelect(grandChild.id)"
                          >
                            {{ grandChild.displayName }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Next Button -->
        <div class="flex justify-end mt-6">
          <button
            @click="handleNext"
            :disabled="Boolean(sourceDepartmentId && !selectedTargetDepartmentId)"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            İleri
          </button>
        </div>
      </div>

      <!-- No Data State -->
      <div v-else class="p-6 text-center text-gray-500">
        No department data available
      </div>
    </div>
  </PageLayout>
</template>

<style scoped>
.department-tree {
  position: relative;
}
</style> 