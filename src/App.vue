<template>
  <div id="app">
    <Navbar></Navbar>
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
  import Navbar from './components/Navbar.vue'

  export default {
    name: 'app',

    components: {
      Navbar
    },

    mounted () {
      $(".button-collapse").sideNav({
        menuWidth: 300,
        closeOnClick: true,
        draggable: true
      });

      $('.collapsible').collapsible();
    }
  }
</script>

