import { createRouter, createWebHistory } from 'vue-router'
import UserList from '../components/UserList.vue'
import FlowList from '../components/FlowList.vue'
import DepartmentTrees from '../components/DepartmentTrees.vue'
import Migrate from '../components/Migrate.vue'

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
      path: '/departments/:flowId',
      name: 'departments',
      component: DepartmentTrees,
      props: true
    },
    {
      path: '/migrate/:flowId',
      name: 'migrate',
      component: Migrate,
      props: true
    }
  ]
})

export default router 