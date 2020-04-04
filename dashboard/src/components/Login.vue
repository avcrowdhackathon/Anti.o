<template>
  <v-card id="login">
    <v-form>
      <v-text-field label="Email" prepend-icon="mdi-account-circle" v-model="email" required />
      <v-select
        v-model="region"
        :items="getAreas.regions.map(i => i.name)"
        :rules="[v => !!v || 'Item is required']"
        label="Περφέρεια"
        prepend-icon="mdi-home"
        required
      ></v-select>
      <v-select
        v-model="municipality"
        :items="getAreas.municipalities.filter(m => m.regionId === selectedRegionId).map(m => m.name)"
        :rules="[v => !!v || 'Item is required']"
        :disabled="region ? false : true"
        label="Δήμος"
        prepend-icon="mdi-home"
        required
      ></v-select>
      <v-select
        v-model="county"
        :items="getAreas.counties.filter(c => c.municipalityId === selectedMunicipalityId && c.regionId === selectedRegionId).map(c => c.name)"
        :rules="[v => !!v || 'Item is required']"
        :disabled="municipality ? false : true"
        label="Νομός"
        prepend-icon="mdi-home"
        required
      ></v-select>
      <v-checkbox
        v-model="checkbox"
        :rules="[v => !!v || 'You must agree to continue!']"
        label="I would like to receive corona virus updates!"
        required
      ></v-checkbox>
    </v-form>
    <v-divider></v-divider>
    <v-card-actions>
      <v-btn color="info" @click.stop="handleLogin">Agree</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "Login",

  data: () => ({
    email: "",
    showPassword: false,
    region: "",
    municipality: "",
    county: ""
  }),
  methods: {
    ...mapActions(["register", "fetchArticles", "fetchAreas"]),
    handleLogin() {
      this.register({
        email: this.email,
        area: this.area
      });
      this.fetchArticles(this.area);
    }
  },
  computed: {
    ...mapGetters(["isAuthenticated", "currentUser", "getAreas"]),
    selectedRegionId() {
      if (this.region !== '') {
        return this.getAreas.regions.find(r => r.name === this.region).id
      }
      return null;
    },
    selectedMunicipalityId() {
      if (this.municipality !== '') {
        return this.getAreas.municipalities.find(r => r.name === this.municipality).id
      }
      return null;
    }
  },
  mounted() {
    this.fetchAreas();
  }
};
</script>

<style>
</style>
