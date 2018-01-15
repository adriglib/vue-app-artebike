<template>
  <div class="contentcontainer">
    <div class="content" >
      <div class="row">
        <div class="info-block">
          <h3 class="orange col s10 offset-s1 center-align">{{ fullName }}</h3>
        </div>
        <div @click="logout"><router-link to="login" class="col s6 offset-s3 btn waves-effect waves-light" type="submit" name="action">
          Afmelden
        </router-link></div>
      </div>
      <div class="row">
        <div class="info-block">
          <ul class="col s10 offset-s1 profile-info">
            <li>{{ email }}</li>
            <li v-if="rijbewijs">Heeft een rijbewijs</li>
            <li v-else>Heeft geen rijbewijs</li>
            <li v-if="abonnementDatum">Aanvang abonnement:<br> {{ abonnementDatum }}, een fiets reserveren kan na activatie, dit gebeurt automatisch de dag na aanvang van het abonnement. </li>
          </ul>
        </div>
      </div>
      <div class="row">
        <div class="col s10 offset-s1 profile-info">
          <div v-if="hasPayed">
            <h3 class="orange">Reservaties</h3>
              <p v-if="noReservations">U heeft geen reservaties.</p>

              <ul v-for="reservation in reservatiesArray" >
                <li style="padding-bottom: 20px">
                Een {{ reservation.field_fietstype }} gereserveerd aan laadstation {{ reservation.field_laadstation }}
                om {{ reservation.field_uur }} op {{ reservation.field_date }}
                </li>
                <span class="extra-button-div" @click="addWantedLocationToLocalStorage(reservation)"><router-link to="navigatie" class="col s3 btn waves-effect waves-light extra-button" type="submit" name="action">
                  <i class="material-icons">navigation</i>
                </router-link></span>
                <span @click="deleteReservation(reservation)" class="extra-button-div"><a href="#" class="col s3 offset-l btn waves-effect waves-light extra-button" type="submit" name="action">
                  <i class="material-icons">check</i>
                </a></span>
                <span class="extra-button-div"><router-link class="col s3 offset-l btn waves-effect waves-light extra-button" :to="{ name: 'wijzigreservatie', params: {reservatieId: reservation.id } }" type="submit" name="action">
                  <i class="material-icons">edit</i>
                </router-link></span>
                <br>
              </ul>
          </div>
          <div v-else>
            <h3 class="orange">Uw abonnement is niet geactiveerd en u kan dus niet reserveren of gebruik maken van de dienst.</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
// Import a bus component to pass methodes over other components.
// We use this to edit the Menu navigation.
import { bus } from "../main";

export default {
  name: "profiel",
  data() {
    return {
      userID: "",
      fullName: "Loading...",
      email: "",
      rijbewijs: "",
      rawReservatiesArray: [],
      reservatiesArray: [],
      locationsArray: [],
      fietsenTypesArray: [],
      noReservations: false,
      abonnementDatum: "",
      hasPayed: false
    };
  },
  created() {
    this.checkIfOnline();
  },
  mounted() {
    this.checkIfPayed();
    this.checkIfOnline();
  },
  methods: {
    // Get localStorage info (created on login) if the user has a subscription.
    checkIfPayed() {
      let moreUserInfo = JSON.parse(localStorage.getItem("hasSubscription"));
      if (moreUserInfo == null || moreUserInfo == false) {
        this.hasPayed = false;
      } else {
        this.hasPayed = true;
      }
    },
    // Add the location you want to navigate to in localStorage.
    // Could use navigation props (used this when editing reservation)
    // but writing and getting from localStorage goes faster.
    addWantedLocationToLocalStorage(info) {
      localStorage.setItem("wantedLocation", JSON.stringify(info));
    },
    // Signs out the user, let menu know and remove localStorage.
    logout() {
      bus.$emit("userLogout");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("passwordInfo");
      localStorage.removeItem("hasDrivingLicense");
      localStorage.removeItem("hasSubscription");
    },
    // Delete reservation.
    deleteReservation(info) {
      let currentUser = JSON.parse(localStorage.getItem("currentUser"));
      let password = atob(JSON.parse(localStorage.getItem("passwordInfo")));
      let csrf = currentUser.csrf_token;
      let userName = currentUser.current_user.name;
      let config = {
        headers: {
          "X-CSRF-Token": csrf,
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        // Authorization by current user.
        auth: {
          username: userName,
          password: password
        }
      };
      axios
        .delete("http://cms.localhost/artebike/reservatie/" + info.id, config)
        .then(() => {
          // Reservation succesfully removes.
          this.reservatiesArray = this.reservatiesArray.filter(function(obj) {
            obj.id != info.id;
          });
          // Check if there are other reservations, otherwise show 'No reservations'.
          if (this.reservatiesArray.length == 0) {
            this.noReservations = true;
          } else {
            this.noReservations = false;
          }
        })
        .catch(({ message: error }) => {
          console.info(error);
        });
    },
    // Check if user is signed in en get user info.
    checkIfOnline() {
      self = this;
      let currentUser = JSON.parse(localStorage.getItem("currentUser"));
      this.email = currentUser.current_user.name;
      let userName = currentUser.current_user.name;
      let password = atob(JSON.parse(localStorage.getItem("passwordInfo")));
      let userID = currentUser.current_user.uid;
      let csrf = currentUser.csrf_token;
      let url = "http://cms.localhost/user/" + userID + "?_format=json";

      let config = {
        headers: {
          "X-CSRF-Token": csrf,
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        // Current user authenticates itself.
        auth: {
          username: userName,
          password: password
        }
      };
      // Get all user info.
      axios
        .get(url, config)
        .then(({ data: users }) => {
          // Get info: name, drivers license and subscription date.
          this.fullName =
            users.field_name[0].value + " " + users.field_surname[0].value;
          this.rijbewijs = users.field_rijbewijs[0].value;
          let rawAbonnementDatum = users.field_begin_abonnement[0].value;
          let rawAbonnementDatumArray = users.field_begin_abonnement[0].value.split(
            "-"
          );

          let monthInDutch;
          // Translate the raw date in readable format.
          switch (rawAbonnementDatumArray[1]) {
            case "01":
              monthInDutch = "januari";
              break;
            case "02":
              monthInDutch = "februari";
              break;
            case "03":
              monthInDutch = "maart";
              break;
            case "04":
              monthInDutch = "april";
              break;
            case "05":
              monthInDutch = "mei";
              break;
            case "06":
              monthInDutch = "juni";
              break;
            case "07":
              monthInDutch = "juli";
              break;
            case "08":
              monthInDutch = "augustus";
              break;
            case "09":
              monthInDutch = "september";
              break;
            case "10":
              monthInDutch = "oktober";
              break;
            case "11":
              monthInDutch = "november";
              break;
            case "12":
              monthInDutch = "december";
              break;
          }
          this.abonnementDatum =
            rawAbonnementDatumArray[2] +
            " " +
            monthInDutch +
            " " +
            rawAbonnementDatumArray[0];
        })
        .catch(({ message: error }) => {
          console.info(error);
        });
      // First get the location, the biketypes and then reservations.
      // We need locations and biketypes to make a readable sentence and assign a name to an id.
      axios
        .get("http://cms.localhost/api/locations")
        .then(({ data: locations }) => {
          this.locationsArray = locations;
          //console.log('locations API', this.locationsArray)
          axios
            .get("http://cms.localhost/api/biketypes")
            .then(({ data: fietsen }) => {
              this.fietsenTypesArray = fietsen;
              //console.log('fietsenTypes API', this.fietsenTypesArray)
              axios
                .get("http://cms.localhost/api/reservaties")
                .then(({ data: reservaties }) => {
                  self = this;
                  this.rawReservatiesArray = reservaties;
                  // console.log('reservations API', this.rawReservatiesArray)
                  let reservationOfCurrentUser = this.rawReservatiesArray.filter(
                    function(obj) {
                      return obj.field_user == self.email;
                    }
                  );
                  // Get all reservations of the current user.
                  // Past reservations are not included because Rest export filter in Drupal.
                  this.reservatiesArray = reservationOfCurrentUser;

                  // Get the biketype, location and date for every reservation.
                  for (let i = 0; i < reservationOfCurrentUser.length; i++) {
                    let fietstype = reservationOfCurrentUser[i].field_fietstype;
                    let fietstypeObject = this.fietsenTypesArray.find(function(
                      obj
                    ) {
                      return obj.id[0].value == fietstype;
                    });

                    let laadstation =
                      reservationOfCurrentUser[i].field_laadstation;
                    let laadstationObject = this.locationsArray.find(function(
                      obj
                    ) {
                      return obj.id == laadstation;
                    });
                    // Format the date.
                    let datumInfo = reservationOfCurrentUser[
                      i
                    ].field_datum.split(" ");
                    let correcteUur = datumInfo[0].split(":")[0] - 1;
                    let correcteMinuut = datumInfo[0].split(":")[1];
                    let uurEnMinuut = correcteUur + ":" + correcteMinuut;
                    // Update the info in the array from id's and raw dates to readable data.
                    // Also set coordinates so we can pass it to navigation.
                    this.$set(
                      this.reservatiesArray[i],
                      "field_fietstype",
                      fietstypeObject.name[0].value
                    );
                    this.$set(
                      this.reservatiesArray[i],
                      "field_laadstation",
                      laadstationObject.name
                    );
                    this.$set(
                      this.reservatiesArray[i],
                      "field_uur",
                      uurEnMinuut
                    );
                    this.$set(
                      this.reservatiesArray[i],
                      "field_date",
                      datumInfo[1]
                    );
                    this.$set(
                      this.reservatiesArray[i],
                      "field_latitude",
                      laadstationObject.field_latitude
                    );
                    this.$set(
                      this.reservatiesArray[i],
                      "field_longitude",
                      laadstationObject.field_longitude
                    );
                  }
                  // If there are no reservations show 'No reservations'.
                  if (this.reservatiesArray.length == 0) {
                    this.noReservations = true;
                  } else {
                    this.noReservations = false;
                  }
                })
                .catch(({ message: error }) => {
                  console.info(error);
                });
            })
            .catch(({ message: error }) => {
              console.info(error);
            });
        })
        .catch(({ message: error }) => {
          console.info(error);
        });
    }
  }
};
</script>
