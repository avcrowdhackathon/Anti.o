
<template>
  <v-app app>
    <navbar />
    <v-content class="wrapper">
      
      <div id="menu">
        <login v-if="!isAuthenticated" class="login-form" />
        <feed v-else />
      </div>
      <div id="map">
        <iframe
          src="https://lab.imedd.org/covid19/"
          style="border:0px #ffffff none;"
          name="imedd-covid"
          scrolling="no"
          frameborder="1"
          marginheight="0px"
          marginwidth="0px"
          allowfullscreen
          width="100%"
          height="100%"
        ></iframe>
      </div>
    </v-content>
    <v-footer app>
      <v-btn
        v-if="scrolledToBottom"
        @click.stop="backToTop"
        absolute
        dark
        fab
        top
        right
        color="#21C1CE"
      >
        <v-icon>mdi-chevron-up</v-icon>
      </v-btn>

      <span>&copy; Anti.o 2020</span>
    </v-footer>
  </v-app>
</template>
<script>
import { mapGetters } from "vuex";
import Login from "./components/Login.vue";
import Feed from "./components/Feed.vue";
import Navbar from "./components/Navbar.vue";


export default {
  components: {
    Login,
    Feed,
    Navbar
  },
  props: {
    source: String
  },
  data: () => ({
    scrolledToBottom: false
  }),
  methods: {
    scroll() {
      window.onscroll = () => {
        const menu = document.getElementById("menu");
        if (document.documentElement.scrollTop > 0.8 * menu.offsetHeight) {
          this.scrolledToBottom = true;
        } else {
          this.scrolledToBottom = false;
        }
      };
    },
    backToTop() {
      window.scroll({
        top: 0,
        left: 0,
        behavior: "smooth"
      });
    }
  },
  mounted() {
    this.scroll();
  },
  computed: {
    ...mapGetters(["isAuthenticated"])
  }
};
</script>


<style scoped>
.wrapper {
  margin-top: 55px;
}

.wrapper div {
  min-height: 200px;
}
.login-form {
  position: relative;
  top: 10%;
  transform: translateY(-10%);
}
#menu {
  float: left;
  width: 300px;
  border-right: 2px solid #000;
  height: 100%;
}
#map {
  height: 100%;
  overflow: hidden;
}

@media screen and (max-width: 600px) {
  #menu {
    float: none;
    margin-right: 0;
    width: auto;
    border: 0;
    border-bottom: 2px solid #000;
  }
}
</style>