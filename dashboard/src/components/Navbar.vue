<template>
  <v-app-bar absolute color="#21C1CE" dark short>
    <v-img class="logo" max-width="150" height="55" contain src="../assets/logo.png"></v-img>
    <v-spacer></v-spacer>
    <div v-if="+viewport.width > 500" class="heading-chip">
      <span class="heading-text">COVID-19 NEWS</span>
    </div>
    <v-spacer></v-spacer>
  </v-app-bar>
</template>

<script>
import viewPortMixin from '../mixins/viewport';
export default {
  name: "Navbar",
  mixins: [viewPortMixin],
  computed: {},
};
</script>

<style>
.logo {
  left: 0;
  float: left;
}

.heading-chip {
  background-color: #134D5F;
  overflow:hidden;
  -webkit-border-radius: 6px 6px 6px 6px;
  -moz-border-radius: 6px 6px 6px 6px;
  border-radius: 6px 6px 6px 6px;
}

.heading-text {
  padding: 0 10px 0 10px;
  top: 50%;
  font-size: 17px;
  font-weight: 600;
  font-family: monospace;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}

</style>