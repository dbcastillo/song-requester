// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import RequestForm from '../components/RequestForm.vue'
import DJDashboard from '../components/DJDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'RequestForm',
    component: RequestForm
  },
  {
    path: '/dj',
    name: 'DJDashboard',
    component: DJDashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router