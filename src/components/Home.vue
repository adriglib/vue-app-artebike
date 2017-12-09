<template>
  <div class="contentcontainer">
    <div class="map">
      <div class="row col s12" id="mapid" style="height: 40vh">

      </div>
    </div>
    <!-- Page Content goes here -->
    <div class="content" >
      <div class="center-align row">
        <div class="info-block">
          Het dichtsbijzijnde laadstation is:
          <div>
            <h3 class="orange">{{nearestLocation}}</h3>
          </div>
        </div>
      </div>
      <div class="center-align row">
        <div class="info-block">
          Beschikbare fietsen:
          <h2 class="orange">{{ availableBikes }}</h2>
        </div>
      </div>
      <div class="center-align row">
        <router-link to="/reserveren" class="col s6 offset-s3 btn waves-effect waves-light" type="submit" name="action">
          Reserveer
        </router-link>

        <div class="grey-text col s12 small-description">
          <router-link to="/reserveren">Reserveren in een ander station.</router-link>
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
        locationsArray: [],
        fietsenArray: [],
        availableBikes: '0',
        locations: [],
        available: [],
        nearestLocation: '',
        loaded: false,
      }
    },
    created () {
      axios
        .get('http://cms.localhost/api/locations')
        .then(({data:locations}) => {
          this.locationsArray = locations
          //console.log(this.locationsArray)
          this.loaded = true
          this.mounted()
        })
        .catch(({message: error}) => {
          console.info(error)
        })
    },
    methods: {

      mounted () {
        let self = this;

        let mymap = L.map('mapid').setView([51.061836, 3.712511], 12.45)

        L.tileLayer('https://api.mapbox.com/styles/v1/adriglib/cj9ire1o635ak2qpar3gow3sy/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWRyaWdsaWIiLCJhIjoiY2l3bHVxYm1wMDAwMjJ0bnE2MWp3azhmdiJ9.E3Udm-vhUj4CEWJuCC_big', {
          maxZoom: 18,
          id: 'mapbox.streets',
          accessToken: 'pk.eyJ1IjoiYWRyaWdsaWIiLCJhIjoiY2l3bHVxYm1wMDAwMjJ0bnE2MWp3azhmdiJ9.E3Udm-vhUj4CEWJuCC_big'
        }).addTo(mymap)
        mymap.attributionControl.setPrefix('')

        for ( let i = 0; i < this.locationsArray.length; i++ ) {
          addMarkers(this.locationsArray[i].field_latitude, this.locationsArray[i].field_longitude)
        }

        function addMarkers(latitude, longitude){
          L.marker([latitude,longitude]).addTo(mymap)
        }

        let currentLocation = {}
        mymap.locate({setView: true, maxZoom: 16})

        //console.log(this.locationsArray)
        let distanceArray = []

        function onLocationFound(e) {
          let radius = e.accuracy
          L.circle(e.latlng, radius).addTo(mymap).bindPopup("You are here").openPopup()
          currentLocation =  e.latlng

          for ( let i = 0; i < self.locationsArray.length; i++ ) {
            distanceArray.push(calculateDistanceBetweenTwoCoordinates(currentLocation.lat, currentLocation.lng, self.locationsArray[i].field_latitude, self.locationsArray[i].field_longitude))
          }

          let index = 0;
          let value = distanceArray[0];
          //console.log(distanceArray)
          for (let i = 1; i < distanceArray.length; i++) {
            if (distanceArray[i] < value) {
              value = distanceArray[i];
              index = i;
            }
          }

          self.nearestLocation = self.locationsArray[index].name
          self.filterAvailable(self.nearestLocation);
        }
        mymap.on('locationfound', onLocationFound)

        function onLocationError(e) {
          alert(e.message)
        }
        mymap.on('locationerror', onLocationError)

        Number.prototype.toRad = function () {
          return this * Math.PI/180;
        };

        function calculateDistanceBetweenTwoCoordinates(lat1, lng1, lat2, lng2){
          var R = 6371; // km
          var lat1 = parseFloat(lat1);
          var lng1 = parseFloat(lng1);
          var lat2 = parseFloat(lat2);
          var lng2 = parseFloat(lng2);

          var dLat = (lat2-lat1).toRad();
          var dLon = (lng2-lng1).toRad();
          var lat1 = lat1.toRad();
          var lat2 = lat2.toRad();

          var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          var d = R * c
          return d;//in km
        };
      },
      filterAvailable(dichtstelocatie) {
        self = this
        axios
          .get('http://cms.localhost/api/fietsen')
          .then(({data:fietsen}) => {
            this.fietsenArray = fietsen
            //console.log('Alle fietsen', this.fietsenArray)
            this.available = this.fietsenArray.filter(function( obj ) {
              return (obj.name_1 == self.nearestLocation && obj.field_beschikbaarheid == 'True');
            });
            //console.log('availale', this.available)
            this.availableBikes = this.available.length
          })
          .catch(({message: error}) => {
            console.info(error)
          });
      }
    }
  }
</script>
