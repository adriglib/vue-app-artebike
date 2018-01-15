<template>
  <div class="contentcontainer">
    <div class="map">
      <div class="row col s12" id="mapid" style="height: 40vh">
      </div>
    </div>
    <div class="content" >
      <div class="center-align row">
        <div class="info-block">
          Het dichtsbijzijnde laadstation is:
          <div>
            <h3 class="orange">{{ nearestLocation }}</h3>
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
import axios from "axios";

export default {
  name: "hello",
  data() {
    return {
      locationsArray: [],
      fietsenArray: [],
      availableBikes: "...",
      locations: [],
      available: [],
      nearestLocation: "Loading...",
      loaded: false
    };
  },

  created() {
    // Get all locations when the page is loaded.
    axios
      .get("http://cms.localhost/api/locations")
      .then(({ data: locations }) => {
        this.locationsArray = locations;
        this.loaded = true;
        // When the locations are loaded, draw the map and calculate distance.
        this.drawMap();
      })
      .catch(({ message: error }) => {
        // Write the errors in the console when you can't get the locations.
        console.info(error);
      });
  },
  methods: {
    drawMap() {
      let self = this;
      // Initialize Map.
      let mymap = L.map("mapid").setView([51.061836, 3.712511], 12.45);

      // Use a Mapbox custom layout for the map.
      L.tileLayer(
        "https://api.mapbox.com/styles/v1/adriglib/cj9ire1o635ak2qpar3gow3sy/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWRyaWdsaWIiLCJhIjoiY2l3bHVxYm1wMDAwMjJ0bnE2MWp3azhmdiJ9.E3Udm-vhUj4CEWJuCC_big",
        {
          maxZoom: 18,
          id: "mapbox.streets",
          accessToken:
            "pk.eyJ1IjoiYWRyaWdsaWIiLCJhIjoiY2l3bHVxYm1wMDAwMjJ0bnE2MWp3azhmdiJ9.E3Udm-vhUj4CEWJuCC_big"
        }
      ).addTo(mymap);
      mymap.attributionControl.setPrefix("");

      // Add the markers from the locations.
      for (let i = 0; i < this.locationsArray.length; i++) {
        addMarkers(
          this.locationsArray[i].field_latitude,
          this.locationsArray[i].field_longitude
        );
      }
      // AddMarkers function.
      function addMarkers(latitude, longitude) {
        L.marker([latitude, longitude]).addTo(mymap);
      }
      // Get the current location and center map on this point.
      let currentLocation = {};
      mymap.locate({ setView: true, maxZoom: 16 });

      let distanceArray = [];
      // When location is found, calculate distance.
      function onLocationFound(e) {
        let radius = e.accuracy;
        L.circle(e.latlng, radius)
          .addTo(mymap)
          .bindPopup("You are here")
          .openPopup();
        currentLocation = e.latlng;
        // Push all distances to an array, smallest will be selected.
        for (let i = 0; i < self.locationsArray.length; i++) {
          distanceArray.push(
            calculateDistanceBetweenTwoCoordinates(
              currentLocation.lat,
              currentLocation.lng,
              self.locationsArray[i].field_latitude,
              self.locationsArray[i].field_longitude
            )
          );
        }

        let index = 0;
        let value = distanceArray[0];
        // Get smallest distance.
        for (let i = 1; i < distanceArray.length; i++) {
          if (distanceArray[i] < value) {
            value = distanceArray[i];
            index = i;
          }
        }
        // Because they have the same index, we can take the name from the closest location.
        self.nearestLocation = self.locationsArray[index].name;
        self.filterAvailable(self.nearestLocation);
      }
      mymap.on("locationfound", onLocationFound);
      // Give an alert when we can't find the current location.
      function onLocationError(e) {
        alert(e.message);
      }
      mymap.on("locationerror", onLocationError);
      // Function necessary to calculate distance.
      Number.prototype.toRad = function() {
        return this * Math.PI / 180;
      };
      // Calculate distance.
      function calculateDistanceBetweenTwoCoordinates(lat1, lng1, lat2, lng2) {
        var R = 6371; // km
        var lat1 = parseFloat(lat1);
        var lng1 = parseFloat(lng1);
        var lat2 = parseFloat(lat2);
        var lng2 = parseFloat(lng2);

        var dLat = (lat2 - lat1).toRad();
        var dLon = (lng2 - lng1).toRad();
        var lat1 = lat1.toRad();
        var lat2 = lat2.toRad();

        var a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.sin(dLon / 2) *
            Math.sin(dLon / 2) *
            Math.cos(lat1) *
            Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d; //in km
      }
    },
    // Get the amount of available bikes on the nearest location.
    filterAvailable(dichtstelocatie) {
      self = this;
      axios
        .get("http://cms.localhost/api/fietsen")
        .then(({ data: fietsen }) => {
          this.fietsenArray = fietsen;
          // Only get bikes that are available.
          this.available = this.fietsenArray.filter(function(obj) {
            return (
              obj.name_1 == self.nearestLocation &&
              obj.field_beschikbaarheid == "True"
            );
          });
          this.availableBikes = this.available.length;
        })
        .catch(({ message: error }) => {
          // Write the errors in the console when you can't get the bikes.
          console.info(error);
        });
    }
  }
};
</script>
