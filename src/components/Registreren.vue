<template>
  <div class="contentcontainer valign-wrapper" > 
    <div class="content align-center">
      <div class="info-block center-align row">
        <h1>Registreren</h1>
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
            <div class=" row switch">
              <label>
                Ik heb geen rijbewijs
                <input v-model="rijbewijs" type="checkbox">
                <span class="lever"></span>
                Ik heb een rijbewijs A of B
              </label>
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
import axios from "axios";

export default {
  name: "hello",
  data() {
    return {
      allStudents: [],
      studentName: "",
      addStudentField: "",
      errors: [],
      successFeedback: "",
      name: "",
      surname: "",
      fullname: "",
      rijbewijs: false,
      email: "",
      password: "",
      passwordConfirm: ""
    };
  },
  methods: {
    // Adding a user.
    addUser() {
      let config = {
        headers: {
          "X-CSRF-Token": "BsGhinsLa2wzQv9tPzaPbmZb_qxPJAUasEK2XjipaOY",
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        // Authentication by administrator.
        auth: {
          username: "cms-user",
          password: "secret"
        }
      };
      // Validation before commiting post.
      if (
        this.password == this.passwordConfirm &&
        this.name != null &&
        this.surname != null &&
        this.email != null &&
        this.passwordConfirm != null
      ) {
        axios
          .post(
            `http://cms.localhost/entity/user`,
            {
              // Name is same as email.
              name: [
                {
                  value: this.email + "@student.arteveldehs.be"
                }
              ],
              mail: [
                {
                  value: this.email + "@student.arteveldehs.be"
                }
              ],
              field_name: [
                {
                  value: this.name
                }
              ],
              field_surname: [
                {
                  value: this.surname
                }
              ],
              field_rijbewijs: [
                {
                  value: this.rijbewijs
                }
              ],
              pass: [
                {
                  value: this.password
                }
              ],
              status: [
                {
                  value: "1"
                }
              ]
            },
            config
          )
          .catch(e => {
            // Visually show if the registration has failed.
            this.successFeedback =
              "Helaas, er is iets misgegaan of dit emailadres is reeds in gebruik.";
          })
          .then(
            // When it was succesfull visually show it and empty the fields.
            response => {},
            (this.successFeedback = "Succes!"),
            (this.name = ""),
            (this.surname = ""),
            (this.mail = ""),
            (this.password = ""),
            (this.passwordConfirm = "")
          );
      } else {
        this.successFeedback =
          "Je moet alle velden invullen en je wachtwoord bevestiging moet hetzelfde zijn ";
      }
    }
  }
};
</script>
