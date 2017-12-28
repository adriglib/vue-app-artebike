<template>
  <div class="contentcontainer">
    <!-- Page Content goes here -->
    <div class="content" >
      <div class="row">
        <div class="info-block">
          <!--<img src="img/profile-picture.jpg" class="col s4 circle">-->
          <h3 class="orange col s10 offset-s1 center-align">{{ fullName }}</h3>
        </div>
        <div @click="logout"><router-link to="login" class="col s6 offset-s3 btn waves-effect waves-light" type="submit" name="action">
          Logout
        </router-link></div>
      </div>
      <div class="row">
        <div class="info-block">
          <ul class="col s10 offset-s1 profile-info">
            <li>{{ email }}</li>
            <li v-if="rijbewijs">Heeft een rijbewijs</li>
            <li v-else>Heeft geen rijbewijs</li>
            <li v-if="abonnementDatum">Een jaar geldig vanaf:<br> {{ abonnementDatum }}</li>
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
                  <i class="material-icons">delete</i>
                </a></span>
                <span class="extra-button-div"><a href="#" class="col s3 offset-l btn waves-effect waves-light extra-button" type="submit" name="action">
                  <i class="material-icons">check</i>
                </a></span>
                <br>
              </ul>

            <!--<div class="map">-->
              <!--<div class="row col s12" id="mapid" style="height: 40vh">-->

              <!--</div>-->
            <!--</div>-->
          </div>
          <div v-else>
            <h3 class="orange">U heeft geen abonnement en kan dus niet reserveren of gebruik maken van de dienst.</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import { bus } from '../main';

  export default {
    name: 'profiel',
    data () {
      return {
        userID: '',
        fullName: 'Loading...',
        email: '',
        rijbewijs: '',
        rawReservatiesArray: [],
        reservatiesArray: [],
        locationsArray: [],
        fietsenTypesArray: [],
        noReservations: false,
        abonnementDatum: '',
        hasPayed: false
      }
    },
    created () {
     this.checkIfOnline()
    },
    mounted () {
      this.checkIfPayed()
      this.checkIfOnline()
//      let mymap = L.map('mapid').setView([51.061836, 3.712511], 12.45);
//
//      L.tileLayer('https://api.mapbox.com/styles/v1/adriglib/cj9ire1o635ak2qpar3gow3sy/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWRyaWdsaWIiLCJhIjoiY2l3bHVxYm1wMDAwMjJ0bnE2MWp3azhmdiJ9.E3Udm-vhUj4CEWJuCC_big', {
//        maxZoom: 18,
//        id: 'mapbox.streets',
//        accessToken: 'pk.eyJ1IjoiYWRyaWdsaWIiLCJhIjoiY2l3bHVxYm1wMDAwMjJ0bnE2MWp3azhmdiJ9.E3Udm-vhUj4CEWJuCC_big'
//      }).addTo(mymap);
//
//      let mariakerke = L.marker([51.087144, 3.6702904]).addTo(mymap);
//      let gentSintPieters = L.marker([51.0361237, 3.7087479]).addTo(mymap);
//      let korenmarkt = L.marker([51.054633,3.7197544]).addTo(mymap);
//    },
    },
    methods: {
      checkIfPayed() {
        let moreUserInfo = JSON.parse(localStorage.getItem('hasSubscription'))
        if(moreUserInfo == null || moreUserInfo == false){
          this.hasPayed = false
        }
        else {
            this.hasPayed = true
        }
      },

      dateCheck(from,to,check) {

      let fDate,lDate,cDate;
      fDate = Date.parse(from);
      lDate = Date.parse(to);
      cDate = Date.parse(check);

      if((cDate <= lDate && cDate >= fDate)) {
        return true;
      }
      return false;
    },
      addWantedLocationToLocalStorage (info) {
        localStorage.setItem('wantedLocation', JSON.stringify(info))
      },
      logout() {
        bus.$emit('userLogout')
        localStorage.removeItem('currentUser')
        localStorage.removeItem('hasDrivingLicense')
        localStorage.removeItem('hasSubscription')
      },
      deleteReservation(info) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'))
        let csrf = currentUser.csrf_token
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
        axios.delete('http://cms.localhost/artebike/reservatie/' + info.id, config).then(() => {
          console.log('succesvol reservaties verwijderd')
          this.reservatiesArray = this.reservatiesArray.filter(function (obj) {
            obj.id != info.id
          })
          if(this.reservatiesArray.length == 0){
            this.noReservations = true;
          }
          else {
            this.noReservations = false;
          }
        })
          .catch(({message: error}) => {
            console.info(error)
          })
      },
      checkIfOnline () {
        self = this
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
              this.rijbewijs = users.field_rijbewijs[0].value
              this.abonnementDatum = users.field_begin_abonnement[0].value
            })
            .catch(({message: error}) => {
              console.info(error)
            })

          axios
            .get('http://cms.localhost/api/locations')
            .then(({data:locations}) => {
              this.locationsArray = locations
              //console.log('locations API', this.locationsArray)
              axios
                .get('http://cms.localhost/api/biketypes')
                .then(({data:fietsen}) => {
                  this.fietsenTypesArray = fietsen
                  //console.log('fietsenTypes API', this.fietsenTypesArray)
                  axios.get('http://cms.localhost/api/reservaties')
                    .then(({data:reservaties}) => {
                      self = this
                      this.rawReservatiesArray = reservaties
                     // console.log('reservations API',this.rawReservatiesArray)
                      let reservationOfCurrentUser = this.rawReservatiesArray.filter(function( obj ) {
                        return (obj.field_user == self.email);
                      });

                      //console.log(reservationOfCurrentUser)
                      this.reservatiesArray = reservationOfCurrentUser

                      for ( let i = 0; i < reservationOfCurrentUser.length; i++ ) {

                        let fietstype = reservationOfCurrentUser[i].field_fietstype
                        let fietstypeObject = this.fietsenTypesArray.find(function (obj) { return obj.id[0].value == fietstype });

                        let laadstation = reservationOfCurrentUser[i].field_laadstation
                        let laadstationObject = this.locationsArray.find(function (obj) { return obj.id == laadstation });

                        let datumInfo = reservationOfCurrentUser[i].field_datum.split(" ")
                        let correcteUur = datumInfo[0].split(':')[0] - 1
                        let correcteMinuut = datumInfo[0].split(':')[1]
                        let uurEnMinuut = correcteUur + ':' + correcteMinuut

                        this.$set( this.reservatiesArray[i], 'field_fietstype', fietstypeObject.name[0].value)
                        this.$set( this.reservatiesArray[i], 'field_laadstation', laadstationObject.name)
                        this.$set( this.reservatiesArray[i], 'field_uur', uurEnMinuut)
                        this.$set( this.reservatiesArray[i], 'field_date', datumInfo[1])
                        this.$set( this.reservatiesArray[i], 'field_latitude', laadstationObject.field_latitude)
                        this.$set( this.reservatiesArray[i], 'field_longitude', laadstationObject.field_longitude)
                      }

                      if(this.reservatiesArray.length == 0){
                        this.noReservations = true;
                      }
                      else {
                        this.noReservations = false;
                      }
                      console.log(this.reservatiesArray)
                    })
                    .catch(({message: error}) => {
                      console.info(error)
                    })
                })
                .catch(({message: error}) => {
                  console.info(error)
                });
            })
            .catch(({message: error}) => {
              console.info(error)
            });
      },
    }
  }
</script>
