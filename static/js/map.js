let mymap = L.map('mapid').setView([51.061836, 3.712511], 12.45);

L.tileLayer('https://api.mapbox.com/styles/v1/adriglib/cj9ire1o635ak2qpar3gow3sy/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWRyaWdsaWIiLCJhIjoiY2l3bHVxYm1wMDAwMjJ0bnE2MWp3azhmdiJ9.E3Udm-vhUj4CEWJuCC_big', {
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiYWRyaWdsaWIiLCJhIjoiY2l3bHVxYm1wMDAwMjJ0bnE2MWp3azhmdiJ9.E3Udm-vhUj4CEWJuCC_big'
}).addTo(mymap);

let mariakerke = L.marker([51.087144, 3.6702904]).addTo(mymap);
let gentSintPieters = L.marker([51.0361237, 3.7087479]).addTo(mymap);
let korenmarkt = L.marker([51.054633,3.7197544]).addTo(mymap);
