// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

export const bus = new Vue();

require('../node_modules/leaflet-routing-machine/dist/leaflet-routing-machine.css');
require('../node_modules/leaflet-routing-machine/dist/leaflet-routing-machine.js')
require('../static/js/timepicker.js')
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
