import { ref } from 'vue'

const selectedEnvironment = ref<'bulutova' | 'comnet'>('bulutova')

export const setEnvironment = (env: 'bulutova' | 'comnet') => {
  selectedEnvironment.value = env
}

export const getApiUrl = (path: string) => {
  const baseUrl = selectedEnvironment.value === 'bulutova' 
    ? import.meta.env.VITE_API_BASE_URL 
    : import.meta.env.VITE_API_BASE_URL2

  return `${baseUrl}${path}`
}

export const getCurrentEnvironment = () => selectedEnvironment.value 