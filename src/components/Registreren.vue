<template>
  <div class="contentcontainer valign-wrapper" >
    <!-- Page Content goes here -->
    <div class="content align-center">
      <div class="info-block center-align row">
        <div class="row">
          <form class="col s12">
            <div class="row">
              <div class="input-field col s6">
                <input id="first_name" type="text" class="validate" autocomplete="off" v-model="name">
                <label for="first_name">Voornaam</label>
              </div>
              <div class="input-field col s6">
                <input id="last_name" type="text" class="validate" autocomplete="off" v-model="surname">
                <label for="last_name">Achternaam</label>
              </div>
            </div>
            <div class="row">
              <div class="input-field col s12">
                <input id="email" type="text" class="col s3 validate" v-model="email"><span class="col s9 grey-text input-suffix">@student.arteveldehs.be</span>
                <label for="email">Email</label>
              </div>
            </div>
            <div class="row">
              <div class="input-field col s12" >
                <input id="password" type="password" class="validate" v-model="password">
                <label for="password">Wachtwoord</label>
              </div>
              <div class="input-field col s12" >
                <input id="password_confirm" type="password" class="validate" v-model="passwordConfirm">
                <label for="password_confirm">Bevestig Wachtwoord</label>
              </div>
            </div>
          </form>
        </div>
      </div><br>
      <div class="center-align row">
        <a class="col s6 offset-s3 btn waves-effect waves-light" @click="addUser" type="submit" name="action">
          Registreer
        </a>
        <p class="col s12">{{ successFeedback }}</p>
        <div class="grey-text col s12 small-description">
          <router-link to="/login">Al een account? Log in.</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    name: 'hello',
    data () {
      return {
        allStudents: [],
        studentName: '',
        addStudentField: '',
        errors: [],
        successFeedback: '',
        name: '',
        surname: '',
        fullname: '',
        email: '',
        password: '',
        passwordConfirm: ''
      }
    },
    created () {
//      axios
//        .get('http://cms.localhost/user',
//          {
//            auth: {
//              username: 'admin',
//              password: 'secret'
//            },
//            headers: {
//              'X-CSRF-Token': 'BsGhinsLa2wzQv9tPzaPbmZb_qxPJAUasEK2XjipaOY',
//              'Accept': 'application/json',
//              'Content-Type': 'application/json'
//            }
//          }
//        )
//        .then(({data:users}) => {
//          this.allStudents = users
//        })
//        .catch(({message: error}) => {
//          console.info(error)
//        })
    },
    methods: {
      addUser () {
        let config = {
          headers: {
            'X-CSRF-Token': 'BsGhinsLa2wzQv9tPzaPbmZb_qxPJAUasEK2XjipaOY',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          auth: {
            username: 'cms-user',
            password: 'secret'
          },
        };
        if(this.password == this.passwordConfirm && this.name != null && this.surname != null && this.email != null && this.passwordConfirm != null){
          axios.post(`http://cms.localhost/entity/user`,
            {
              'name': [
                {
                  'value': this.email + '@student.arteveldehs.be'
                }
              ],
              'mail': [
                {
                  'value': this.email + '@student.arteveldehs.be'
                }
              ],
              'field_name': [
                {
                  'value': this.name
                }
              ],
              'field_surname': [
                {
                  'value': this.surname
                }
              ],
              'pass': [
                {
                  'value': this.password
                }
              ],
              'status': [
                {
                  'value': '1'
                }
              ],
            }, config)
            .catch(e => {
            this.successFeedback = 'Helaas, er is iets misgegaan of dit emailadres is reeds in gebruik.'
            })
            .then(response => {},
              this.successFeedback = 'Succes!',
              this.name = '',
              this.surname = '',
              this.mail = '',
              this.password = '',
              this.passwordConfirm = ''
            )
        }
        else {
          this.successFeedback = 'Je moet alle velden invullen en je wachtwoord bevestiging moet hetzelfde zijn '
        }
      },
    }
  }
</script>
