<template>
  <div class="contentcontainer valign-wrapper">
    <!-- Page Content goes here -->
    <div class="content align-center" >
      <div class="info-block center-align row">
        <h1>Login</h1><br>
        <div class="row">
          <form class="col s12">
            <div class="row">
              <div class="input-field col s12">
                <input id="email" type="text" class="col s3 validate" v-model="login.email"><span class="col s9 grey-text input-suffix">@student.arteveldehs.be</span>
                <label for="email">Email</label>
              </div>
            </div>
            <div class="row">
              <div class="input-field col s12">
                <input id="password" type="password" class="validate" v-model="login.password">
                <label for="password">Wachtwoord</label>
              </div>
            </div>
          </form>
        </div>
      </div><br>
      <p v-if="errors"></p>
      <div class="center-align row">
        <a class="col s6 offset-s3 btn waves-effect waves-light" @click="loginUser" name="action">
          Login
        </a>

        <div class="grey-text col s12 small-description">
          <router-link to="/registreren">Nog geen account? Registreer hier.</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import router from 'vue-router'
  import { bus } from '../main';

  export default {
    name: 'hello',
    data () {
      return {
        login: {
          email: 'nickboon',
          password: 'test'
        },
        currentRoute: '',
        errors: []
      }
    },
//    created () {
//      axios
//        .get('http://cms.localhost/api/locations')
//        .then(({data:locations}) => {
//          this.locationsArray = locations
//          this.loaded = true
//          this.mounted()
//        })
//        .catch(({message: error}) => {
//          console.info(error)
//        })
//    },
    methods: {
      loginUser () {
        self = this
        let config = {
          headers: {
            'Content-Type': 'application/json'
          },
        };

        axios.post(`http://cms.localhost/user/login?_format=json`,
          {
            "name": this.login.email + '@student.arteveldehs.be',
            "pass": this.login.password
          }, config)
          .then(function (response) {
            localStorage.setItem( 'currentUser', JSON.stringify(response.data) );
            bus.$emit('userLogin', true)
            self.$router.push('/reserveren')
          },
        )
      },
    }
  }
</script>
