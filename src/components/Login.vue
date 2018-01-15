<template>
  <div class="contentcontainer valign-wrapper">
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
import axios from "axios";
import router from "vue-router";
// Import a bus component to pass methodes over other components.
// We use this to edit the Menu navigation.
import { bus } from "../main";

export default {
  name: "hello",
  data() {
    return {
      login: {
        email: "",
        password: ""
      },
      currentRoute: "",
      errors: [],
      hasPayed: false
    };
  },
  methods: {
    // Sign in the user.
    loginUser() {
      let self = this;

      let config = {
        headers: {
          "Content-Type": "application/json"
        }
      };

      axios
        .post(
          `http://cms.localhost/user/login?_format=json`,
          {
            name: this.login.email + "@student.arteveldehs.be",
            pass: this.login.password
          },
          config
        )
        .then(function(response) {
          // User succesfully signed in.
          // Set user info in localStorage for use in other components.
          localStorage.setItem("currentUser", JSON.stringify(response.data));
          // Hash the password and place in localStorage.
          localStorage.setItem(
            "passwordInfo",
            JSON.stringify(btoa(self.login.password))
          );
          let currentUser = JSON.parse(localStorage.getItem("currentUser"));
          let csrf = currentUser.csrf_token;
          let userID = currentUser.current_user.uid;
          let url = "http://cms.localhost/user/" + userID + "?_format=json";
          let config = {
            headers: {
              "X-CSRF-Token": csrf,
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            auth: {
              username: self.login.email + "@student.arteveldehs.be",
              password: self.login.password
            }
          };

          axios
            .get(url, config)
            .then(({ data: users }) => {
              // Get user data, check if he has a drivers licence and a subscription.
              localStorage.setItem(
                "hasDrivingLicense",
                JSON.stringify({ rijbewijs: users.field_rijbewijs[0].value })
              );
              self.checkIfPayed(users.field_begin_abonnement[0].value);
            })
            .catch(({ message: error }) => {
              // Write the errors in the console when you can't get the userinfo.
              console.info(error);
            });
          // Let the Menu change because user is signed in.
          bus.$emit("userLogin", true);
          // Go to home.
          self.$router.push("/");
        });
    },
    // Method to check if the user has a subscription.
    checkIfPayed(abonnementDatum) {
      if (abonnementDatum == null) {
        this.hasPayed = false;
      } else {
        // User has subscription info, check if it is active right now.
        let date = new Date();
        let beginSubscription = abonnementDatum;
        let rawEndSubscription = new Date(beginSubscription);
        let rawEndSubscriptionYear = parseInt(
          rawEndSubscription.getFullYear() + 1
        );
        let rawEndSubscriptionMonth = parseInt(
          rawEndSubscription.getMonth() + 1
        );
        let rawEndSubscriptionDay = rawEndSubscription.getDate();
        let endSubscription =
          rawEndSubscriptionYear +
          "-" +
          rawEndSubscriptionMonth +
          "-" +
          rawEndSubscriptionDay;
        let currentDay =
          date.getFullYear() +
          "-" +
          parseInt(date.getMonth() + 1) +
          "-" +
          date.getDate();
        // Check if subscription is active.
        if (this.dateCheck(beginSubscription, endSubscription, currentDay))
          this.hasPayed = true;
        else this.hasPayed = false;
        // Write in localStorage if he has or doesn't have a subscription.
        localStorage.setItem("hasSubscription", this.hasPayed);
        return this.hasPayed;
      }
    },
    // Method to check if the currentday is between the start and end of subscription.
    dateCheck(from, to, check) {
      let fDate, lDate, cDate;
      fDate = Date.parse(from);
      lDate = Date.parse(to);
      cDate = Date.parse(check);

      if (cDate <= lDate && cDate >= fDate) {
        return true;
      }
      return false;
    }
  }
};
</script>
