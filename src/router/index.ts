import { createRouter, createWebHistory } from 'vue-router'
import UserList from '../components/UserList.vue'
import FlowList from '../components/FlowList.vue'
import DepartmentTrees from '../components/DepartmentTrees.vue'
import MigrateTabs from '../components/MigrateTabs.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'users',
      component: UserList,
      props: true
    },
    {
      path: '/flows/:userId',
      name: 'flows',
      component: FlowList,
      props: true
    },
    {
      path: '/departments/:flowIds',
      name: 'departments',
      component: DepartmentTrees,
      props: route => ({ 
        flowIds: Array.isArray(route.params.flowIds) 
          ? route.params.flowIds[0].split(',') 
          : route.params.flowIds.split(',')
      })
    },
    {
      path: '/migrate/:flowIds',
      name: 'migrate',
      component: MigrateTabs,
      props: route => ({ 
        flowIds: Array.isArray(route.params.flowIds) 
          ? route.params.flowIds[0].split(',') 
          : route.params.flowIds.split(',')
      })
    }
  ]
})

export default router 