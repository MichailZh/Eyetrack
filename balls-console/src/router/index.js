import Vue from 'vue'
import VueRouter from 'vue-router'
import Homepage from '../views/Homepage'
import Callibration from '../views/Callibration'
import Donate from '../views/Donate'
import InvalidURL from '../views/InvalidURL'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', name: 'home', component: Homepage, params: 'noice' },
  { path: '/callibration', name: 'callibration', component: Callibration },
  { path: '/donate', name: 'donation', component: Donate },
  { path: '*', name: 'invalid-url', component: InvalidURL }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
