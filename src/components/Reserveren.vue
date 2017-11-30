<template>
  <div class="contentcontainer">
    <!-- Page Content goes here -->
    <div class="content" >
      <div class="row bikes">
        <input name="group1" type="radio" :id="fiets" />
        <div class=" col s6 center-align" v-for="fiets in fietsenArray">
          <h5>{{ fiets.title[0].value }}</h5>
          <p class="small-description">{{ fiets.field_aantal_fietsen[0].value }} beschikbaar</p>
          <img class="col s12" :src="fiets.field_foto[0].url"/>
          <p class="small-description">{{ fiets.field_informatie[0].value }}</p>
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
                <input class="radio-orange white-text" name="group1" type="radio" :id="location.title[0].value" />
                <label class="white-text" :for="location.title[0].value">{{ location.title[0].value }}</label>
              </td>
              <td class="center-align">4</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="row">
        <div class="col s10 offset-s1 profile-info">
                <span class="center-align"><h5 class="orange">Reservatie om: </h5>
                    <p>  <input type="text" class="timepicker col s4 offset-s4"></p>
                </span>
        </div>
      </div>
      <div class="center-align row">
        <a href="profiel.html" class="col s6 offset-s3 btn waves-effect waves-light" type="submit" name="action">
          Bevestig
        </a>
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
        fietsenArray: [],
        loaded: false,
      }
    },
    created () {
      axios
        .get('http://cms.localhost/api/locations')
        .then(({data:locations}) => {
          this.locationsArray = locations
        })
        .catch(({message: error}) => {
          console.info(error)
        }),
        axios
          .get('http://cms.localhost/api/fietsen')
        .then(({data:fietsen}) => {
          this.fietsenArray = fietsen
        })
        .catch(({message: error}) => {
          console.info(error)
        })
    },
    methods: {
      mounted () {
        for ( let i = 0; i < this.locationsArray.length; i++ ) {
          console.log(this.locationsArray[i].field_latitude[0].value, this.locationsArray[i].field_longitude[0].value)
        }

      },
    }
  }
</script>

