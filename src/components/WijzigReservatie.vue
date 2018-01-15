<template>
  <div class="contentcontainer">
    <div class="content" >
      <div class="row">
        <div class="info-block col s10 offset-s1">
          <h3 class="orange center-align">Reservatie wijzigen</h3>
          <div>
            Huidige reservatie:
            <p>Een {{ reservatie.field_fietstype }} gereserveerd aan laadstation {{ reservatie.field_laadstation }}
              om {{ reservatie.field_uur }} op {{ reservatie.field_date }}</p>
          </div>
          <hr>
        </div>
      </div>
      <div class="row">
        <div class="profile-info">
          <span class="center-align"><h5 class="orange">Wijzig je reservatie: </h5></span>
          <div class="row bikes">
            <div  class="col s6 center-align" v-for="fietstype in fietsenTypesArray" @click="selectType(fietstype)" :class="fietstype.name[0].value">
              <h5>{{ fietstype.name[0].value }}</h5>
              <img class="col s12" :src="fietstype.field_image[0].url"/>
              <p class="small-description">{{ fietstype.field_beschrijving[0].value }}</p>
            </div>
            <p v-if="noLicense == true" class="col s10 offset-s1 small-description center-align">Je hebt een rijbewijs nodig om met een pedelec te rijden. Heb je een rijbewijs? Stuur een mailtje via de website om dit te bevestigen, we contacteren je dan met verdere instrcuties.</p>
          </div>
          <div class="row orange-bg">
            <div class="white-text col s10 offset-s1 profile-info row">
              <span class="center-align"><h5 class="">Reservatie om: </h5></span>

              <div @click="updateAvailibilityAccordingToTimeAndDate" class="input-field">
                <select id="selectedDate">
                  <option value="" disabled>Choose your option</option>
                  <option  value="vandaag">Vandaag</option>
                  <option  value="morgen">Morgen</option>
                </select>
              </div>

              <div @click="updateAvailibilityAccordingToTimeAndDate">
                <input id="selectedTime" v-model="selectedTime" :value="selectedTime" placeholder="Kies een tijdstip" type="text" class="timepicker col s12">
              </div>
              <p  v-on:click="updateAvailibilityAccordingToTimeAndDate" class="small-description">{{ smallDescription }}</p>
            </div>
          </div>
          <div class="row">
            <div class="col s11 offset-s1">
              <table class="selectStation">
                <thead>
                <tr>
                  <th><h5>Station</h5></th>
                  <th><h5>Beschikbaar</h5></th>
                </tr>
                </thead>

                <tbody>
                <tr  v-for="location in locationsArray">
                  <td>
                    <input class="radio-orange" v-model="pickedLocation" :value="location" name="group1" type="radio" :id="location.name" />
                    <label  :for="location.name">{{ location.name}}</label>
                  </td>
                  <td v-if='pedelecSelected' class="center-align">{{ location.availablePedelecs }}</td>
                  <td v-if='ebikeSelected' class="center-align">{{ location.availableEbikes }}</td>
                  <td v-if="pedelecSelected == false && ebikeSelected == false" class="center-align">{{ location.availableBikes }}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div><br>
          <div class="center-align row" @click="makeReservation">
            <router-link to="" class="col s6 offset-s3 btn waves-effect waves-light" type="submit" name="action">
              Update reservatie
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "profiel",
  data() {
    return {
      userID: "",
      fullName: "Loading...",
      email: "",
      rijbewijs: "",
      rawReservatiesArray: [],
      reservatie: [],
      reservatieArray: [],
      locationsArray: [],
      fietsenTypesArray: [],
      noReservations: false,
      abonnementDatum: "",
      id: "",
      noLicense: "",
      selectedTime: "",
      selectedDate: "",
      smallDescription: "",
      pickedLocation: "",
      pedelecSelected: "",
      ebikeSelected: ""
    };
  },
  created() {
    // Initialize timepicker.
    $(document).ready(function() {
      $("select").material_select();
      $(".timepicker").pickatime({
        default: "now", // Set default time: 'now', '1:30AM', '16:30'
        fromnow: 0, // set default time to * milliseconds from now (using with default = 'now')
        twelvehour: false, // Use AM/PM or 24-hour format
        donetext: "OK", // text for done-button
        cleartext: "Verwijder", // text for clear-button
        canceltext: "Annuleer", // Text for cancel-button
        autoclose: false, // automatic close timepicker,
        afterShow: function() {}
      });
    });

    this.checkIfOnline();
    // Get the ID from the url so the right reservation is being edited.
    this.id = this.$route.params.reservatieId;
  },
  mounted() {
    // Make sure a user is online and get user info for authentication.
    this.checkIfOnline();
  },
  methods: {
    checkIfOnline() {
      self = this;
      let currentUser = JSON.parse(localStorage.getItem("currentUser"));
      let userName = currentUser.current_user.name;
      // Unhash password.
      let password = atob(JSON.parse(localStorage.getItem("passwordInfo")));
      this.email = currentUser.current_user.name;

      let userID = currentUser.current_user.uid;
      let csrf = currentUser.csrf_token;
      let url = "http://cms.localhost/user/" + userID + "?_format=json";

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
      // First get the locations so they can be showed in list.
      axios
        .get("http://cms.localhost/api/locations")
        .then(({ data: locations }) => {
          this.locationsArray = locations;
          console.log("locations API", this.locationsArray);
          // Then get the biketypes so they can be showed.
          axios
            .get("http://cms.localhost/api/biketypes")
            .then(({ data: fietsen }) => {
              this.fietsenTypesArray = fietsen;
              console.log("fietsenTypes API", this.fietsenTypesArray);
              // Then get the reservations so the correct reservation can be updated. (We need location and biketype info)
              axios
                .get("http://cms.localhost/api/reservaties")
                .then(({ data: reservaties }) => {
                  self = this;
                  this.rawReservatiesArray = reservaties;
                  let reservationOfCurrentUser = this.rawReservatiesArray.filter(
                    function(obj) {
                      return obj.field_user == self.email && obj.id == self.id;
                    }
                  );
                  // Get the relevant reservation (will be show on top).
                  this.reservatie = reservationOfCurrentUser[0];
                  // Get it's biketype.
                  let fietstype = this.reservatie.field_fietstype;
                  let fietstypeObject = this.fietsenTypesArray.find(function(
                    obj
                  ) {
                    return obj.id[0].value == fietstype;
                  });
                  // Get it's location.
                  let laadstation = this.reservatie.field_laadstation;
                  let laadstationObject = this.locationsArray.find(function(
                    obj
                  ) {
                    return obj.id == laadstation;
                  });
                  // Get it's date and time.
                  let datumInfo = this.reservatie.field_datum.split(" ");
                  let correcteUur = datumInfo[0].split(":")[0] - 1;
                  let correcteMinuut = datumInfo[0].split(":")[1];
                  let uurEnMinuut = correcteUur + ":" + correcteMinuut;
                  // Set the type, location, date and time so it can be readable.
                  this.$set(
                    this.reservatie,
                    "field_fietstype",
                    fietstypeObject.name[0].value
                  );
                  this.$set(
                    this.reservatie,
                    "field_laadstation",
                    laadstationObject.name
                  );
                  this.$set(this.reservatie, "field_uur", uurEnMinuut);
                  this.$set(this.reservatie, "field_date", datumInfo[1]);
                  this.$set(
                    this.reservatie,
                    "field_latitude",
                    laadstationObject.field_latitude
                  );
                  this.$set(
                    this.reservatie,
                    "field_longitude",
                    laadstationObject.field_longitude
                  );

                  console.log(this.reservatie);
                })
                .catch(({ message: error }) => {
                  console.info(error);
                });
              // Then get the available bikes.
              axios
                .get("http://cms.localhost/api/fietsen?_format=json")
                .then(({ data: fietsen }) => {
                  self = this;
                  this.fietsenArray = fietsen;
                  // For each location checking the available bikes.
                  for (let i = 0; i < this.locationsArray.length; i++) {
                    let availableBikes = this.fietsenArray.filter(function(
                      obj
                    ) {
                      return (
                        obj.name_1 == self.locationsArray[i].name &&
                        obj.field_beschikbaarheid == "True"
                      );
                    });
                    // Available pedelecs.
                    let availablePedelecs = this.fietsenArray.filter(function(
                      obj
                    ) {
                      return (
                        obj.name_1 == self.locationsArray[i].name &&
                        obj.field_beschikbaarheid == "True" &&
                        obj.field_fietssoort == "1"
                      );
                    });
                    // Availbe Ebikes.
                    let availableEbikes = this.fietsenArray.filter(function(
                      obj
                    ) {
                      return (
                        obj.name_1 == self.locationsArray[i].name &&
                        obj.field_beschikbaarheid == "True" &&
                        obj.field_fietssoort == "2"
                      );
                    });
                    this.$set(
                      this.locationsArray[i],
                      "availableBikes",
                      availableBikes.length.toString()
                    );
                    this.$set(
                      this.locationsArray[i],
                      "availablePedelecs",
                      availablePedelecs.length.toString()
                    );
                    this.$set(
                      this.locationsArray[i],
                      "availableEbikes",
                      availableEbikes.length.toString()
                    );
                  }
                  console.log(this.locationsArray);
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
    },
    // Method to select a biketype.
    selectType(fietssoort) {
      let self = this;
      let pedelec = document.querySelector(".Pedelec");
      let ebike = document.querySelector(".E-bike");

      this.fietsenTypeID = fietssoort.id[0].value;
      // Make sure the user has a drivers license.
      // Without a license the user can't use a pedelec.
      if (fietssoort.id[0].value == "1") {
        this.ebikeSelected = false;
        this.pedelecSelected = true;
        let rijbewijsObject = JSON.parse(
          localStorage.getItem("hasDrivingLicense")
        );

        if (rijbewijsObject.rijbewijs == true) {
          ebike.classList.remove("touchFeedback");
          pedelec.classList.add("touchFeedback");
          self.noLicense = false;
        } else {
          self.noLicense = true;
        }
      } else {
        this.pedelecSelected = false;
        this.ebikeSelected = true;
        pedelec.classList.remove("touchFeedback");
        ebike.classList.add("touchFeedback");
        self.noLicense = false;
      }
    },
    // Update the availibility.
    updateAvailibilityAccordingToTimeAndDate() {
      let self = this;
      let date = new Date();
      let day;

      this.selectedDate = $("#selectedDate")
        .parent(["0"])
        .children()[1].value;
      this.selectedTime = $(".timepicker").val();
      if (this.selectedDate == "Vandaag") {
        day = date.getDate();
        // Check if not in past.
        let currentTime =
          date.getHours().toString() + date.getMinutes().toString();
        let selectedTime =
          this.selectedTime.split(":")[0].toString() +
          this.selectedTime.split(":")[1].toString();
        console.log(parseInt(selectedTime), parseInt(currentTime));
        if (parseInt(selectedTime) <= parseInt(currentTime)) {
          self.smallDescription =
            "Je kan niet in het verleden een reservering maken";
          self.inPast = true;
        } else {
          self.smallDescription =
            "Een uur na de reservatie moet je fiets terugstaan in een laadstation naar keuze.";
          self.inPast = false;
        }
      } else if (this.selectedDate == "Morgen") {
        day = date.getDate() + 1;
      }
      // Not before 6 a.m. and not after 11 p.m.
      if (
        this.selectedTime.split(":")[0] < 6 ||
        this.selectedTime.split(":")[0] >= 23
      ) {
        this.customDate = "";
        this.foutMelding = "Je kan niet reserveren voor 6u of na 23u.";
        this.smallDescription =
          "Je kan reserveren tussen 06:00u en 23:00u. Opgelet, een uur na het begin van de reservatie moet deze terugstaan in een laadstation naar keuze, als dit niet zo is zal dit gevolgen hebben. Surf naar onze website voor meer informatie.";
      } else {
        this.customDate =
          date.getFullYear() +
          "-" +
          str_pad(date.getMonth() + 1) +
          "-" +
          str_pad(day) +
          "T" +
          $(".timepicker").val() +
          ":00";
      }
      function str_pad(n) {
        return String("0" + n).slice(-2);
      }

      for (let i = 0; i < this.locationsArray.length; i++) {
        let availableBikes = this.fietsenArray.filter(function(obj) {
          if (obj.field_datum_bezet != false) {
            let timeObject = obj.field_datum_bezet
              .substr(-8, 5)
              .replace(":", "");
            let timeInput = self.customDate.substr(-8, 5).replace(":", "");
            let dateObject = obj.field_datum_bezet.substr(0, 10);
            let dateInput = self.customDate.substr(0, 10);

            return (
              obj.name_1 == self.locationsArray[i].name &&
              obj.field_beschikbaarheid == "True" &&
              (!(
                parseInt(timeObject) + 100 > parseInt(timeInput) &&
                parseInt(timeObject) - 100 < parseInt(timeInput)
              ) ||
                dateObject != dateInput)
            );
          } else return obj.name_1 == self.locationsArray[i].name && obj.field_beschikbaarheid == "True" && obj.field_fietssoort == "2";
        });
        let availablePedelecs = this.fietsenArray.filter(function(obj) {
          if (obj.field_datum_bezet != false) {
            let timeObject = obj.field_datum_bezet
              .substr(-8, 5)
              .replace(":", "");
            let timeInput = self.customDate.substr(-8, 5).replace(":", "");
            let dateObject = obj.field_datum_bezet.substr(0, 10);
            let dateInput = self.customDate.substr(0, 10);

            return (
              obj.name_1 == self.locationsArray[i].name &&
              obj.field_beschikbaarheid == "True" &&
              obj.field_fietssoort == "1" &&
              (!(
                parseInt(timeObject) + 100 > parseInt(timeInput) &&
                parseInt(timeObject) - 100 < parseInt(timeInput)
              ) ||
                dateObject != dateInput)
            );
          } else return obj.name_1 == self.locationsArray[i].name && obj.field_beschikbaarheid == "True" && obj.field_fietssoort == "1";
        });
        let availableEbikes = this.fietsenArray.filter(function(obj) {
          if (obj.field_datum_bezet != false) {
            let timeObject = obj.field_datum_bezet
              .substr(-8, 5)
              .replace(":", "");
            let timeInput = self.customDate.substr(-8, 5).replace(":", "");
            let dateObject = obj.field_datum_bezet.substr(0, 10);
            let dateInput = self.customDate.substr(0, 10);

            return (
              obj.name_1 == self.locationsArray[i].name &&
              obj.field_beschikbaarheid == "True" &&
              obj.field_fietssoort == "2" &&
              (!(
                parseInt(timeObject) + 100 > parseInt(timeInput) &&
                parseInt(timeObject) - 100 < parseInt(timeInput)
              ) ||
                dateObject != dateInput)
            );
          } else return obj.name_1 == self.locationsArray[i].name && obj.field_beschikbaarheid == "True" && obj.field_fietssoort == "2";
        });
        this.$set(
          this.locationsArray[i],
          "availableBikes",
          availableBikes.length.toString()
        );
        this.$set(
          this.locationsArray[i],
          "availablePedelecs",
          availablePedelecs.length.toString()
        );
        this.$set(
          this.locationsArray[i],
          "availableEbikes",
          availableEbikes.length.toString()
        );
      }
      console.log(this.locationsArray);
    },
    makeReservation() {
      let currentUser = JSON.parse(localStorage.getItem("currentUser"));
      let csrf = currentUser.csrf_token;
      let userID = currentUser.current_user.uid;
      let userName = currentUser.current_user.name;
      let password = atob(JSON.parse(localStorage.getItem("passwordInfo")));

      let IDFromSelectedBike = this.fietsenArray.filter(function(obj) {
        return (
          obj.field_fietssoort == self.fietsenTypeID &&
          obj.field_beschikbaarheid == "True" &&
          obj.name_1 == self.pickedLocation.name
        );
      });

      let config = {
        headers: {
          "X-CSRF-Token": csrf,
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        // Normaal gezien kan je hier ook met userName en password authenticaten maar Drupal zegt dat hij geen
        // toegang heeft, er is bij de user roles permission GEEN optie om Create Reservations toe te laten,
        // dit is er wel voor andere entities?! Denk dat het aan drupal ligt? Gaat wel als je als admin bent ingelogd.
        auth: {
          username: "cms-user",
          password: "secret"
        }
      };
      self = this;
      // Edit the reservation!
      if (this.noLicense == false && this.noLicense != "notSelected") {
        if (this.pickedLocation != "") {
          if (this.selectedTime != "" && this.inPast == false) {
            axios
              .patch(
                `http://cms.localhost/artebike/reservatie/` + self.id,
                {
                  field_fietstype: [
                    {
                      target_id: self.fietsenTypeID,
                      target_type: "fietstype",
                      url:
                        "http://cms.localhost/api/biketypes/" +
                        self.fietsenTypeID
                    }
                  ],
                  field_laadstation: [
                    {
                      target_id: self.pickedLocation.id,
                      target_type: "laadstation",
                      url:
                        "http://cms.localhost/api/locations/" +
                        self.pickedLocation.id
                    }
                  ],
                  field_datum: [
                    {
                      value: self.customDate
                    }
                  ],
                  field_user: [
                    {
                      target_id: userID,
                      target_type: "user",
                      url: "http://cms.localhost/user/" + userID,
                      name: userName
                    }
                  ]
                },
                config
              )
              .then(function(response) {
                self.$router.push("/profiel");
                // Also edit the bike.
                axios
                  .patch(
                    `http://cms.localhost/artebike/fiets/` +
                      IDFromSelectedBike[0].id,
                    {
                      field_datum_bezet: {
                        value: self.customDate
                      }
                    },
                    config
                  )
                  .then(function(response) {})
                  .catch(({ message: error }) => {
                    console.info(error);
                  });
              })
              .catch(({ message: error }) => {
                if (this.foutMelding == "")
                  this.foutMelding =
                    "Er is iets misgegaan, heb je al de velden ingevuld?";
                console.info(error);
              });
          } else self.foutMelding = "Je moet een geldige tijd selecteren!";
        } else
          self.foutMelding =
            "Je moet een laadstation selecteren waar je een fiets kan ophalen!";
      } else {
        self.foutMelding = "Je moet een geldig fietstype selecteren!";
      }
    }
  }
};
</script>
