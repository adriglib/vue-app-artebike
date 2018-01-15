<template>
  <div id="app">
    <Navbar></Navbar>
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import Navbar from "./components/Navbar.vue";
import router from "vue-router";

export default {
  name: "app",

  components: {
    Navbar
  },

  methods: {},
  mounted() {
    $(".button-collapse").sideNav({
      menuWidth: 300,
      closeOnClick: true,
      draggable: true
    });

    $(".collapsible").collapsible();

    $(".timepicker").pickatime({
      default: "now", // Set default time: 'now', '1:30AM', '16:30'
      fromnow: 0, // set default time to * milliseconds from now (using with default = 'now')
      twelvehour: false, // Use AM/PM or 24-hour format
      donetext: "OK", // text for done-button
      cleartext: "Verwijder", // text for clear-button
      canceltext: "Annuleer", // Text for cancel-button
      autoclose: false, // automatic close timepicker
      aftershow: function() {} //Function for after opening timepicker
    });

    $(document).ready(function() {
      $("select").material_select();
    });
  }
};
</script>

