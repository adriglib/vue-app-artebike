import Vue from 'vue'
import Router from 'vue-router'
import Profiel from '../components/Profiel.vue'
import Home from '@/components/Home'
import Reserveren from '@/components/Reserveren'
import Login from '@/components/Login'
import Registreren from '@/components/Registreren'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      // name: 'home',
      component: Home
    },
    {
      path: '/login',
      // name: 'Login',
      component: Login
    },
    {
      path: '/registreren',
      // name: 'Registreren',
      component: Registreren
    },
    {
      path: '/reserveren',
     // name: 'Reserveren',
      component: Reserveren
    },
    {
      path: '/profiel',
     // name: 'Profiel',
      component: Profiel
    }
  ]
})
