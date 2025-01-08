<script setup lang="ts">
import { ref } from 'vue'
import { getApiUrl } from './utils/api'

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

const users = ref<UserPair[]>([])

// Fetch users from the API
const fetchUsers = async () => {
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
    <router-view :users="users"></router-view>
  </div>
</template>

