<template>
  <div class="contentcontainer" style="overflow: hidden;">
    <div class="map">
      <div class="row col s12" id="mapid" style="height: 100vh;">

      </div>
    </div>
    <div class="content" >
      <div class="center-align row">
        <div class="info-block">

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
      locations: [],
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
        // When the locations are loaded, draw the map and the routing.
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
      // When location is found draw routing.
      function onLocationFound(e) {
        let radius = e.accuracy;
        L.circle(e.latlng, radius)
          .addTo(mymap)
          .bindPopup("You are here")
          .openPopup();
        currentLocation = e.latlng;

        let destinationInfo = JSON.parse(
          localStorage.getItem("wantedLocation")
        );
        // Draw routing.
        L.Routing
          .control({
            waypoints: [
              L.latLng(currentLocation.lat, currentLocation.lng),
              L.latLng(
                destinationInfo.field_latitude,
                destinationInfo.field_longitude
              )
            ],
            routeWhileDragging: true
          })
          .addTo(mymap);
      }
      mymap.on("locationfound", onLocationFound);
      // Give an alert when we can't find the current location.
      function onLocationError(e) {
        alert(e.message);
      }
      mymap.on("locationerror", onLocationError);
    }
  }
};
</script>
