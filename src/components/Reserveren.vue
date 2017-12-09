<template>
  <div class="contentcontainer">
    <!-- Page Content goes here -->
    <div class="content" >
      <div class="row bikes">
        <div  class="col s6 center-align" v-for="fietstype in fietsenTypesArray" @click="selectType(fietstype)" :class="fietstype.name[0].value">
          <h5>{{ fietstype.name[0].value }}</h5>
          <img class="col s12" :src="fietstype.field_image[0].url"/>
          <p class="small-description">{{ fietstype.field_beschrijving[0].value }}</p>
        </div>
      </div>
      <div class="row orange-bg">
        <div class="white-text col s11 offset-s1">
          <table class="selectStation">
            <thead>
            <tr>
              <th><h5>Station</h5></th>
              <th><h5>Beschikbaar</h5></th>
            </tr>
            </thead>

            <tbody>
            <tr class="white-text"  v-for="location in locationsArray">
              <td>
                <input class="radio-orange white-text" name="group1" type="radio" :id="location.name" />
                <label class="white-text" :for="location.name">{{ location.name}}</label>
              </td>
              <td v-if='pedelecSelected' class="center-align">{{ location.availablePedelecs }}</td>
              <td v-if='ebikeSelected' class="center-align">{{ location.availableEbikes }}</td>
              <td v-if="pedelecSelected == false && ebikeSelected == false" class="center-align">{{ location.availableBikes }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="row">
        <div class="col s10 offset-s1 profile-info">
                <span class="center-align"><h5 class="orange">Reservatie om: </h5>

                  <input v-model="selectedTime" placeholder="Kies tijd" type="text" class="timepicker col s4 offset-s4" @click="openTimepicker">

                </span>
        </div>
      </div>
      <div class="center-align row">
        <router-link to="profiel" class="col s6 offset-s3 btn waves-effect waves-light" type="submit" name="action">
          Bevestig
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    name: 'reserveren',
    data () {
      return {
        locationsArray: [],
        limitedLocationsArray: [],
        fietsenTypesArray: [],
        fietsenArray: [],
        availableArray: [],
        loaded: false,
        pedelecSelected: false,
        ebikeSelected: false,
        selectedTime: ''
      }
    },
    created () {
      axios
        .get('http://cms.localhost/api/locations')
        .then(({data:locations}) => {
          this.locationsArray = locations
          console.log('Alles wat je ontvangt van locations API', this.locationsArray)
          axios
            .get('http://cms.localhost/api/biketypes')
            .then(({data:fietsen}) => {
              this.fietsenTypesArray = fietsen
              axios
                .get('http://cms.localhost/api/fietsen?_format=json')
                .then(({data:fietsen}) => {
                  self = this
                  this.fietsenArray = fietsen

                  console.log('Alle fietsen', fietsen)

                  for ( let i = 0; i < this.locationsArray.length; i++ ) {
                    let availableBikes = this.fietsenArray.filter(function( obj ) {
                      return (obj.name_1 == self.locationsArray[i].name && obj.field_beschikbaarheid == 'True');
                    });
                    let availablePedelecs = this.fietsenArray.filter(function( obj ) {
                      return (obj.name_1 == self.locationsArray[i].name && obj.field_beschikbaarheid == 'True' && obj.field_fietssoort == '1');
                    });
                    let availableEbikes = this.fietsenArray.filter(function( obj ) {
                      return (obj.name_1 == self.locationsArray[i].name && obj.field_beschikbaarheid == 'True' && obj.field_fietssoort == '2');
                    });
                    this.$set( this.locationsArray[i], 'availableBikes', availableBikes.length.toString())
                    this.$set( this.locationsArray[i], 'availablePedelecs', availablePedelecs.length.toString())
                    this.$set( this.locationsArray[i], 'availableEbikes', availableEbikes.length.toString())
                  }
                  console.log( this.locationsArray)
                })
                .catch(({message: error}) => {
                  console.info(error)
                });
            })
            .catch(({message: error}) => {
              console.info(error)
            })
        })
        .catch(({message: error}) => {
          console.info(error)
        })
    },
    methods: {
      mounted () {

      },
      selectType(fietssoort) {
        let pedelec = document.querySelector('.Pedelec')
        let ebike = document.querySelector('.E-bike')

        if(fietssoort.id[0].value == '1'){
          this.ebikeSelected = false
          this.pedelecSelected = true
          ebike.classList.remove('touchFeedback')
          pedelec.classList.add('touchFeedback')
        }
        else {
          this.pedelecSelected = false
          this.ebikeSelected = true
          pedelec.classList.remove('touchFeedback')
          ebike.classList.add('touchFeedback')
        }
      },
      openTimepicker() {
        $('.timepicker').pickatime({
          default: 'now', // Set default time: 'now', '1:30AM', '16:30'
          fromnow: 0,       // set default time to * milliseconds from now (using with default = 'now')
          twelvehour: false, // Use AM/PM or 24-hour format
          donetext: 'OK', // text for done-button
          cleartext: 'Verwijder', // text for clear-button
          canceltext: 'Annuleer', // Text for cancel-button
          autoclose: false, // automatic close timepicker
          aftershow: function(){} //Function for after opening timepicker
        });
      }
//      available () {
//
//        for(let a = 0; a < this.fietsenArray.length ; a++){
//          let locationName = this.fietsenArray[a].name
//          //console.log(locationName)
//          for (let b = 0; b < this.namesOfLocations.length; b++){
//            //console.log(this.namesOfLocations[b])
//            if(locationName == this.namesOfLocations[b]){
//              this.availableArray.push(this.namesOfLocations[b])
//              var test = this.countInArray(this.namesOfLocations)
//            }
//          }
//        }
//        console.log(test)
//        console.log('tttttttttttest', this.availableArray)
//      },
//      countInArray(array, what) {
//        var count = 0;
//        for (var i = 0; i < array.length; i++) {
//          if (array[i] === what) {
//            count++;
//          }
//        }
//        return count;
//      }
    }
  }
</script>

