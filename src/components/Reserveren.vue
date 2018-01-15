<template>
  <div class="contentcontainer">
    <div class="content" >
      <div class="row bikes">
        <span class="center-align"><h5 class="orange">Selecteer een type fiets: </h5></span>
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
            <tr class=""  v-for="location in locationsArray">
              <td>
                <input class="radio-orange" v-model="pickedLocation" :value="location" name="group1" type="radio" :id="location.name" />
                <label class="" :for="location.name">{{ location.name }}</label>
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
          Bevestig
        </router-link>
      </div>
      <div class="col s10 offset-s1 profile-info row">
        <span class="center-align"><h6>{{ foutMelding }}</h6></span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "reserveren",
  data() {
    return {
      locationsArray: [],
      limitedLocationsArray: [],
      fietsenTypesArray: [],
      fietsenTypeID: "",
      fietsenArray: [],
      availableArray: [],
      loaded: false,
      pedelecSelected: false,
      ebikeSelected: false,
      selectedTime: "",
      selectedDate: "",
      pickedLocation: "",
      foutMelding: "",
      customDate: "",
      currentRoute: "",
      noLicense: "notSelected",
      inPast: false,
      smallDescription:
        "Je kan reserveren tussen 06:00u en 23:00u. Opgelet, een uur na het begin van de reservatie moet deze terugstaan in een laadstation naar keuze, als dit niet zo is zal dit gevolgen hebben. Surf naar onze website voor meer informatie."
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

    // First get the locations so they can be showed in list.
    axios
      .get("http://cms.localhost/api/locations")
      .then(({ data: locations }) => {
        this.locationsArray = locations;
        console.log(
          "Alles wat je ontvangt van locations API",
          this.locationsArray
        );
        // Then get the biketypes so they can be showed.
        axios
          .get("http://cms.localhost/api/biketypes")
          .then(({ data: fietsen }) => {
            this.fietsenTypesArray = fietsen;
            console.log(
              "Alles wat je ontvangt van biketypes API",
              this.fietsenTypesArray
            );
            // Then get the bikes so the availble number can be updated. (We need location and biketype info)
            axios
              .get("http://cms.localhost/api/fietsen?_format=json")
              .then(({ data: fietsen }) => {
                self = this;
                this.fietsenArray = fietsen;
                console.log("Alles wat je ontvangt van fietsen API", fietsen);
                // Only get bikes that are available.
                for (let i = 0; i < this.locationsArray.length; i++) {
                  // Get all bikes
                  let availableBikes = this.fietsenArray.filter(function(obj) {
                    return (
                      obj.name_1 == self.locationsArray[i].name &&
                      obj.field_beschikbaarheid == "True"
                    );
                  });
                  // Get pedelecs
                  let availablePedelecs = this.fietsenArray.filter(function(
                    obj
                  ) {
                    return (
                      obj.name_1 == self.locationsArray[i].name &&
                      obj.field_beschikbaarheid == "True" &&
                      obj.field_fietssoort == "1"
                    );
                  });
                  // Get ebikes
                  let availableEbikes = this.fietsenArray.filter(function(obj) {
                    return (
                      obj.name_1 == self.locationsArray[i].name &&
                      obj.field_beschikbaarheid == "True" &&
                      obj.field_fietssoort == "2"
                    );
                  });
                  // Write available bikes in array, then get lenght --> number of available.
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
  methods: {
    // Select a biketype
    selectType(fietssoort) {
      let self = this;
      let pedelec = document.querySelector(".Pedelec");
      let ebike = document.querySelector(".E-bike");

      this.fietsenTypeID = fietssoort.id[0].value;

      if (fietssoort.id[0].value == "1") {
        this.ebikeSelected = false;
        this.pedelecSelected = true;
        // Check if user has a driver license
        let rijbewijsObject = JSON.parse(
          localStorage.getItem("hasDrivingLicense")
        );
        // If a driver license, you can select a pedelec.
        if (rijbewijsObject.rijbewijs == true) {
          // Add grey background when selected.
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
    // Update the available bikes according to the time, type and date.
    updateAvailibilityAccordingToTimeAndDate() {
      let self = this;
      let date = new Date();
      let day;
      // Get selected date.
      this.selectedDate = $("#selectedDate")
        .parent(["0"])
        .children()[1].value;
      // Get selected time.
      this.selectedTime = $(".timepicker").val();
      // If it is today, check the current time and selected time.
      // Can't be in the past.
      if (this.selectedDate == "Vandaag") {
        day = date.getDate();
        // Check if not in the past.
        let currentTime =
          date.getHours().toString() + date.getMinutes().toString();
        let selectedTime =
          this.selectedTime.split(":")[0].toString() +
          this.selectedTime.split(":")[1].toString();
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
      // Make sure a reservation is not before 6 o'clock and not after 11 o'clock.
      if (
        this.selectedTime.split(":")[0] < 6 ||
        this.selectedTime.split(":")[0] >= 23
      ) {
        this.customDate = "";
        this.foutMelding = "Je kan niet reserveren voor 6u of na 23u.";
        this.smallDescription =
          "Je kan reserveren tussen 06:00u en 23:00u. Opgelet, een uur na het begin van de reservatie moet deze terugstaan in een laadstation naar keuze, als dit niet zo is zal dit gevolgen hebben. Surf naar onze website voor meer informatie.";
      } else {
        // If this is not the case: set the date and time.
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
      // Add a zero before the date or month if it is 1 digit.
      function str_pad(n) {
        return String("0" + n).slice(-2);
      }
      // Check the availibility for every location.
      for (let i = 0; i < this.locationsArray.length; i++) {
        // Get available bikes.
        let availableBikes = this.fietsenArray.filter(function(obj) {
          // Check if it has info about a date where it is not available.
          if (obj.field_datum_bezet != false) {
            // The time it is not available.
            let timeObject = obj.field_datum_bezet
              .substr(-8, 5)
              .replace(":", "");
            // The time you selected.
            let timeInput = self.customDate.substr(-8, 5).replace(":", "");
            // The date it is not available.
            let dateObject = obj.field_datum_bezet.substr(0, 10);
            // The date you selected.
            let dateInput = self.customDate.substr(0, 10);

            // Only return bikes that are not an hour before or an hour after the reservation on the specific date.
            return (
              obj.name_1 == self.locationsArray[i].name &&
              obj.field_beschikbaarheid == "True" &&
              (!(
                parseInt(timeObject) + 100 > parseInt(timeInput) &&
                parseInt(timeObject) - 100 < parseInt(timeInput)
              ) ||
                dateObject != dateInput)
            );
          } else return obj.name_1 == self.locationsArray[i].name && obj.field_beschikbaarheid == "True";
        });
        // Filter for available pedelecs
        let availablePedelecs = this.fietsenArray.filter(function(obj) {
          if (obj.field_datum_bezet != false) {
            let timeObject = obj.field_datum_bezet
              .substr(-8, 5)
              .replace(":", "");
            let timeInput = self.customDate.substr(-8, 5).replace(":", "");
            let dateObject = obj.field_datum_bezet.substr(0, 10);
            let dateInput = self.customDate.substr(0, 10);
            // Only return pedelecs that are not an hour before or an hour after the reservation on the specific date.
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
        // Filter ebikes
        let availableEbikes = this.fietsenArray.filter(function(obj) {
          if (obj.field_datum_bezet != false) {
            let timeObject = obj.field_datum_bezet
              .substr(-8, 5)
              .replace(":", "");
            let timeInput = self.customDate.substr(-8, 5).replace(":", "");
            let dateObject = obj.field_datum_bezet.substr(0, 10);
            let dateInput = self.customDate.substr(0, 10);
            // Only return ebikes that are not an hour before or an hour after the reservation on the specific date.
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
        // Update the array --> update the number of available bikes.
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
    // Make a reservation.
    makeReservation() {
      let currentUser = JSON.parse(localStorage.getItem("currentUser"));
      let csrf = currentUser.csrf_token;
      let userID = currentUser.current_user.uid;
      let userName = currentUser.current_user.name;
      // Unhash the password.
      let password = atob(JSON.parse(localStorage.getItem("passwordInfo")));
      // Change a bike so we can change it's availibility.
      let IDFromSelectedBike = this.fietsenArray.filter(function(obj) {
        // Is has to be the right type, has to be available and on the right location.
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
      // Validation for input fields.
      // Right biketype?
      if (this.noLicense == false && this.noLicense != "notSelected") {
        // Picked a location?
        if (this.pickedLocation != "") {
          // Picked a valid time?
          if (this.selectedTime != "" && this.inPast == false) {
            axios
              .post(
                `http://cms.localhost/entity/reservatie`,
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
                  // Date and hour when it will not be available.
                  field_datum: [
                    {
                      value: self.customDate
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
                // Update a bike.
                axios
                  .patch(
                    `http://cms.localhost/artebike/fiets/` +
                      IDFromSelectedBike[0].id,
                    // Date and hour when it will not be available.
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

