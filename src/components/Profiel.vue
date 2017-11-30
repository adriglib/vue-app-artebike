<template>
  <div class="contentcontainer">
    <!-- Page Content goes here -->
    <div class="content" >
      <div class="row">
        <div class="info-block">
          <img src="img/profile-picture.jpg" class="col s4 circle">
          <h3 class="orange col s8">Cato Waeterloos</h3>
        </div>
      </div>
      <div class="row">
        <div class="info-block">
          <ul class="col s10 offset-s1 profile-info">
            <li>catowaet@student.arteveldehs.be</li>
            <li>Studentennummer: 89851</li>
            <li>Heeft een e-bike vergunning</li>
          </ul>
        </div>
      </div>
      <div class="row">
        <div class="col s10 offset-s1 profile-info">
          <h3 class="orange">Reservaties</h3>
          <ul class="">
            <li>E-bike reservatie om 15:30 aan Campus Mariakerke</li>
          </ul>
          <div class="map">
            <div class="row col s12" id="mapid" style="height: 40vh">

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'profiel',

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
    }
  }
</script>
