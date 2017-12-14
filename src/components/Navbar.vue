<template>
  <header>
    <nav class="navbar grey lighten-5 z-depth-4 nav-extended">
      <ul id="slide-out" class="side-nav">
        <li>
          <div class="user-view">
            <div class="background orange-bg">
              <!--<img src="img/background-sidebar.jpg">-->
            </div>
            <router-link to="/"><img class="" src="static/img/logo_white.png"></router-link>
            <router-link to="/login"><span class="white-text name">{{ fullName }}</span><span>{{ email }}</span></router-link>
          </div>
        </li>
        <li><router-link to="/profiel" class="waves-effect"><i class="material-icons">person</i>Profiel</router-link></li>
        <li><router-link to="/" class="waves-effect"><i class="material-icons">room</i>Reserveren</router-link></li>
        <li><router-link to="/reserveren" class="waves-effect"><i class="material-icons">battery_charging_full</i>Laadstations</router-link></li>
        <li><router-link to="/profiel" class="waves-effect"><i class="material-icons">directions_bike</i>Reservaties</router-link></li>
        <div class="divider"></div>
        <li @click="logout()"><router-link to="" class="waves-effect"><i class="material-icons">exit_to_app</i>Logout</router-link></li>

        <div class="divider"></div>
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

  export default {
    name: 'profiel',
    data () {
      return {
        userID: '',
        fullName: 'Loading...',
        email: '',
      }
    },
    created () {
      //this.checkIfOnline()
    },
    mounted () {
      this.checkIfOnline()
    },
    methods: {
      logout() {
        localStorage.removeItem('currentUser')
      },
      checkIfOnline () {
        self = this
        if(localStorage.getItem('currentUser') == null){
          self.fullName = 'NIET INGELOGD'
          self.$router.push('/login')
        }
        else {
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
