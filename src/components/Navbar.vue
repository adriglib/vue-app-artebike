<template>
  <header>
    <nav class="navbar grey lighten-5 z-depth-4 nav-extended">
      <ul id="slide-out" class="side-nav">
        <li>
          <div class="user-view">
            <div class="background orange-bg">
              <!--<img src="img/background-sidebar.jpg">-->
            </div>
            <router-link to="/login"><img class="circle" src="static/img/profile-picture.jpg"></router-link>
            <a href="#!name"><span class="white-text name">Cato Waeterloos</span></a>
            <a href="#!email"><span class="white-text email">catowaet@student.arteveldehs.be</span></a>
          </div>
        </li>
        <li><router-link to="/profiel" class="waves-effect"><i class="material-icons">person</i>Profiel</router-link></li>
        <li><router-link to="/" class="waves-effect"><i class="material-icons">room</i>Reserveren</router-link></li>
        <li><router-link to="" class="waves-effect"><i class="material-icons">battery_charging_full</i>Laadstations</router-link></li>
        <li><router-link to="" class="waves-effect"><i class="material-icons">directions_bike</i>Onze fietsen</router-link></li>
        <div class="divider"></div>
        <li><router-link to="" class="waves-effect"><i class="material-icons">info</i>Voorwaarden</router-link></li>
        <li><router-link to="" class="waves-effect"><i class="material-icons">help</i>Hulp</router-link></li>
      </ul>
      <div class="row col s12">
        <ul class="col s12 menu-items">
          <li class="col s4">
            <router-link to="" class="center-align grey-text text-lighten-1 button-collapse" data-activates="slide-out">
              <i class="material-icons">menu</i>
              <span class="grey-text text-darken-3">Menu</span>
            </router-link>
          </li>
          <li class="col s4">
            <router-link to="/" class="center-align grey-text text-lighten-1">
              <i class="material-icons">battery_charging_full</i>
              <span class="grey-text text-darken-3">Reserveer</span>
            </router-link>
          </li>
          <li class="col s4 active">
            <router-link to="/profiel" class="center-align grey-text text-lighten-1">
              <i class="material-icons">person</i>
              <span class="grey-text text-darken-3">Profiel</span>
            </router-link>
          </li>
        </ul>
        <!--<a href="#" data-activates="slide-out" class="button-collapse grey-text text-lighten-1"><i class="material-icons">menu</i></a>-->
        <!--<a href="#" class="grey-text text-lighten-1"><i class="material-icons">menu</i></a>-->
        <!--<a href="#" class="grey-text text-lighten-1"><i class="material-icons">person_outline</i></a>-->
      </div>
    </nav>
  </header>
</template>
