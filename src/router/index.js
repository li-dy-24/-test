import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'campus',
    component: () => import('@/views/CampusViewer.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
