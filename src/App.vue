<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { getApiUrl, setEnvironment, getCurrentEnvironment } from './utils/api'
import { type UserPair } from './types/OrganizationUsersCompareDto'

const users = ref<UserPair[]>([])
const selectedEnvironment = ref(getCurrentEnvironment())

// Watch for environment changes and refetch data
watchEffect(() => {
  if (selectedEnvironment.value !== getCurrentEnvironment()) {
    setEnvironment(selectedEnvironment.value)
    fetchUsers()
  }
})

// Fetch users from the API
const fetchUsers = async () => {
  users.value=[];
  try {
    const response = await fetch(getApiUrl('/User'))
    users.value = await response.json()
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

fetchUsers()
</script>

<template>
  <div class="container mx-auto p-6">
    <!-- Environment Selector -->
    <div class="mb-6">
      <div class="flex justify-center space-x-4">
        <button
          @click="selectedEnvironment = 'bulutova'"
          :class="[
            'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2',
            selectedEnvironment === 'bulutova'
              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
          ]"
        >
          Bulutova
        </button>
        <button
          @click="selectedEnvironment = 'comnet'"
          :class="[
            'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2',
            selectedEnvironment === 'comnet'
              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
          ]"
        >
          Comnet
        </button>
      </div>
    </div>

    <router-view :users="users"></router-view>
  </div>
</template>

