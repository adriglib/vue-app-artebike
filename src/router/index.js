import Vue from 'vue'
import Router from 'vue-router'
import Profiel from '../components/Profiel.vue'
import Home from '@/components/Home'
import Reserveren from '@/components/Reserveren'
import Login from '@/components/Login'
import Registreren from '@/components/Registreren'
import Navigatie from '@/components/Navigatie'
import WijzigReservatie from '@/components/WijzigReservatie'

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: 'home',
      component: Home,
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('currentUser') == null) {
          next('/login')
        } else {
          next()
        }
      }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/registreren',
      name: 'Registreren',
      component: Registreren
    },
    {
      path: '/reserveren',
      name: 'Reserveren',
      component: Reserveren,
      props: {
        currentRoute: 'reserveren'
      },
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('currentUser') == null) {
          next('/login')
        } else
          next()
      }
    },
    {
      path: '/profiel',
      name: 'Profiel',
      component: Profiel,
      props: {
        currentRoute: 'profiel'
      },
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('currentUser') == null) {
          next('/login')
        } else
          next()
      }
    },
    {
      path: '/navigatie',
      // name: 'Profiel',
      component: Navigatie,
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('currentUser') == null) {
          next('/login')
        } else
          next()
      }
    },
    {
      path: '/wijzigreservatie/:reservatieId',
      name: 'wijzigreservatie',
      component: WijzigReservatie,
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('currentUser') == null) {
          next('/login')
        } else
          next()
      }
    }
  ]
})
