<template>
    <v-card id="login">
      <v-form>
        <v-text-field
          label="Email"
          prepend-icon="mdi-account-circle"
          v-model="email" 
          required
        />
        <v-select
          v-model="area"
          :items="getAreas"
          :rules="[v => !!v || 'Item is required']"
          label="Area"
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
    area: '',
  }),
  methods: {
    ...mapActions(["register", 'fetchArticles']),
    handleLogin() {
      this.register({
        email: this.email,
        area: this.area,
      });
      this.fetchArticles(this.area)
    },
  },
  computed: {
    ...mapGetters(["isAuthenticated", "currentUser", "getAreas"])
  }
};
</script>

<style>

</style>
