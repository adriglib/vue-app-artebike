<template>
  <header>
    <nav class="navbar grey lighten-5 z-depth-4 nav-extended">
      <ul id="slide-out" class="side-nav">
        <li>
          <div class="user-view">
            <div class="background orange-bg">
              <!--<img src="img/background-sidebar.jpg">-->
            </div>
            <!--<router-link to="/"><img class="" src="static/img/logo_white.png"></router-link>-->
            <router-link v-if="loggedIn == false" to="/login" style="padding-bottom: 20px;"><span class="white-text name">{{ fullName }}</span></router-link>
            <router-link v-if="loggedIn" to="/profiel" style="padding-bottom: 20px;"><span class="white-text name">{{ fullName }}</span><span>{{ email }}</span></router-link>
          </div>
        </li>
        <li v-if="loggedIn"><router-link to="/profiel" class="waves-effect"><i class="material-icons">person</i>Profiel</router-link></li>
        <li v-if="loggedIn"><router-link to="/" class="waves-effect"><i class="material-icons">room</i>Dichtbij</router-link></li>
        <li v-if="loggedIn"><router-link to="/reserveren" class="waves-effect"><i class="material-icons">battery_charging_full</i>Reserveer</router-link></li>
        <div v-if="loggedIn" class="divider"></div>
        <li v-if="loggedIn" @click="logout()"><router-link to="" class="waves-effect"><i class="material-icons">exit_to_app</i>Logout</router-link></li>
        <div v-if="loggedIn" class="divider"></div>
        <li v-if="loggedIn == false"><router-link to="/login" class="waves-effect"><i class="material-icons">input</i>Login</router-link></li>
        <li v-if="loggedIn == false"><router-link to="/registreren" class="waves-effect"><i class="material-icons">add</i>Registreren</router-link></li>
        <li><router-link to="" class="waves-effect"><i class="material-icons">info</i>Voorwaarden</router-link></li>
        <li><router-link to="" class="waves-effect"><i class="material-icons">help</i>Hulp</router-link></li>
      </ul>
      <div class="row col s12">
        <ul class="col s12 menu-items">
          <li class="col s4">
            <router-link to="" class="center-align grey-text text-lighten-1 button-collapse" data-activates="slide-out">
              <i class="material-icons">menu</i>
              <span class="grey-text text-darken-3">Menu</span>
            </router-link>
          </li>
          <li class="col s4">
            <router-link to="/" class="center-align grey-text text-lighten-1">
              <i class="material-icons">battery_charging_full</i>
              <span class="grey-text text-darken-3">Reserveer</span>
            </router-link>
          </li>
          <li class="col s4 active">
            <router-link to="/profiel" class="center-align grey-text text-lighten-1">
              <i class="material-icons">person</i>
              <span class="grey-text text-darken-3">Profiel</span>
            </router-link>
          </li>
        </ul>
        <!--<a href="#" data-activates="slide-out" class="button-collapse grey-text text-lighten-1"><i class="material-icons">menu</i></a>-->
        <!--<a href="#" class="grey-text text-lighten-1"><i class="material-icons">menu</i></a>-->
        <!--<a href="#" class="grey-text text-lighten-1"><i class="material-icons">person_outline</i></a>-->
      </div>
    </nav>
  </header>
</template>

<script>
  import axios from 'axios'
  import { bus } from '../main';

  export default {
    name: 'profiel',
    data () {
      return {
        userID: '',
        fullName: 'Je bent afgemeld...',
        email: '',
        loggedIn: false
      }
    },
    created () {
      bus.$on('userLogin', () => {
        this.checkIfOnline()
      })
      bus.$on('userLogout', () => {
        this.logout()
      })
    },
    mounted () {
      this.checkIfOnline()
    },
    methods: {
      logout() {
        //alert('testlogout')
        this.fullName = 'Je bent afgemeld...'
        this.loggedIn = false
        localStorage.removeItem('currentUser')
        $router.push('Login')
      },
      checkIfOnline () {
       //alert('alertifonline')
        self = this
        if(localStorage.getItem('currentUser') == null){
          self.fullName = 'Je bent afgemeld...'
        }
        else {
          this.loggedIn = true
          let currentUser = JSON.parse(localStorage.getItem('currentUser'))
          this.email = currentUser.current_user.name
          let userID = currentUser.current_user.uid
          let csrf = currentUser.csrf_token
          let url =  'http://cms.localhost/user/' + userID +'?_format=json'

          let config = {
            headers: {
              'X-CSRF-Token': csrf,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            auth: {
              username: 'cms-user',
              password: 'secret'
            },
          };

          axios.get(url, config)
            .then(({data:users}) => {
              console.log(users)
              this.fullName = users.field_name[0].value + ' ' + users.field_surname[0].value
            })
            .catch(({message: error}) => {
              console.info(error)
            })
        }
      },
    }
  }
</script>
