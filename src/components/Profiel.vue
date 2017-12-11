<template>
  <div class="contentcontainer">
    <!-- Page Content goes here -->
    <div class="content" >
      <div class="row">
        <div class="info-block">
          <!--<img src="img/profile-picture.jpg" class="col s4 circle">-->
          <h3 class="orange col s10 offset-s1 center-align">{{ fullName }}</h3>
        </div>
        <router-link to="login" class="col s6 offset-s3 btn waves-effect waves-light" type="submit" name="action">
          Logout
        </router-link>
      </div>
      <div class="row">
        <div class="info-block">
          <ul class="col s10 offset-s1 profile-info">
            <li>{{ email }}</li>
            <li v-if="rijbewijs">Heeft een rijbewijs</li>
            <li v-else>Heeft geen rijbewijs</li>
          </ul>
        </div>
      </div>
      <div class="row">
        <div class="col s10 offset-s1 profile-info">
          <div>
            <h3 class="orange">Reservaties</h3>

              <ul v-for="reservation in reservatiesArray" >
                <li>
                Een {{ reservation.field_fietstype }} gereserveerd aan laadstation {{ reservation.field_laadstation }}
                om {{ reservation.field_uur }} op {{ reservation.field_date }}
                </li>
                <br><hr>
              </ul>

            <div class="map">
              <div class="row col s12" id="mapid" style="height: 40vh">

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
        rijbewijs: '',
        rawReservatiesArray: [],
        reservatiesArray: [],
        locationsArray: [],
        fietsenTypesArray: [],
      }
    },
    created () {
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
                  console.log('reservations API',this.rawReservatiesArray)
                  let reservationOfCurrentUser = this.rawReservatiesArray.filter(function( obj ) {
                    return (obj.field_user == self.email);
                  });

                  console.log(reservationOfCurrentUser)
                  this.reservatiesArray = reservationOfCurrentUser

                  for ( let i = 0; i < reservationOfCurrentUser.length; i++ ) {

                    let fietstype = reservationOfCurrentUser[i].field_fietstype
                    let fietstypeObject = this.fietsenTypesArray.find(function (obj) { return obj.id[0].value == fietstype });

                    let laadstation = reservationOfCurrentUser[i].field_laadstation
                    let laadstationObject = this.locationsArray.find(function (obj) { return obj.id == laadstation });

                    let datumInfo = reservationOfCurrentUser[i].field_datum.split(" ")

                    this.$set( this.reservatiesArray[i], 'field_fietstype', fietstypeObject.name[0].value)
                    this.$set( this.reservatiesArray[i], 'field_laadstation', laadstationObject.name)
                    this.$set( this.reservatiesArray[i], 'field_uur', datumInfo[0])
                    this.$set( this.reservatiesArray[i], 'field_date', datumInfo[1])
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
    mounted () {

      let mymap = L.map('mapid').setView([51.061836, 3.712511], 12.45);

      L.tileLayer('https://api.mapbox.com/styles/v1/adriglib/cj9ire1o635ak2qpar3gow3sy/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWRyaWdsaWIiLCJhIjoiY2l3bHVxYm1wMDAwMjJ0bnE2MWp3azhmdiJ9.E3Udm-vhUj4CEWJuCC_big', {
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiYWRyaWdsaWIiLCJhIjoiY2l3bHVxYm1wMDAwMjJ0bnE2MWp3azhmdiJ9.E3Udm-vhUj4CEWJuCC_big'
      }).addTo(mymap);

      let mariakerke = L.marker([51.087144, 3.6702904]).addTo(mymap);
      let gentSintPieters = L.marker([51.0361237, 3.7087479]).addTo(mymap);
      let korenmarkt = L.marker([51.054633,3.7197544]).addTo(mymap);
    },
    methods: {
      checkIfLogedIn() {

      }
    }
  }
</script>
