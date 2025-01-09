<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue'
import PageLayout from './PageLayout.vue'
import Migrate from './Migrate.vue'

const props = defineProps<{
  flowIds: string[]
}>()

const route = useRoute()
const selectedIndex = ref(0)

const getQueryParams = () => {
  return {
    sourceDepartmentId: route.query.sourceDepartmentId?.toString(),
    targetDepartmentId: route.query.targetDepartmentId?.toString()
  }
}
</script>

<template>
  <PageLayout title="Flow Aktarımı">
    <div class="bg-white rounded-lg shadow">
      <TabGroup as="div" v-model="selectedIndex">
        <div class="border-b border-gray-200">
          <TabList class="flex -mb-px">
            <Tab v-for="flowId in flowIds" :key="flowId" v-slot="{ selected }" as="div" class="flex-1">
              <button
                type="button"
                :class="[
                  'w-full relative py-4 px-6 text-sm font-medium focus:outline-none',
                  selected
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                Flow ID: {{ flowId }}
                <span
                  :class="[
                    'absolute -bottom-px left-0 w-full h-0.5',
                    selected ? 'bg-indigo-600' : 'bg-transparent'
                  ]"
                />
              </button>
            </Tab>
          </TabList>
        </div>

        <TabPanels>
          <TabPanel
          :unmount="false"
            v-for="flowId in flowIds"
            :key="flowId"
            class="p-6"
            as="div"
          >
            <KeepAlive>
              <Migrate 
                :key="flowId"
                :flowIds="[flowId]" 
                :source-department-id="getQueryParams().sourceDepartmentId"
                :target-department-id="getQueryParams().targetDepartmentId"
              />
            </KeepAlive>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  </PageLayout>
</template> 