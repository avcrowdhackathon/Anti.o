<template>
  <v-card :href="link" target="_blank" class="mx-auto" max-width="344" outlined>
    <v-list-item three-line>
      <v-list-item-content>
        <div class="overline mb-4">{{source}}</div>
        <v-list-item-title class="headline mb-1">{{title}}</v-list-item-title>
        <v-list-item-subtitle>{{description}}</v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-avatar
        tile
        size="80"
        color="grey"
      ><v-img :src="image"></v-img></v-list-item-avatar>
    </v-list-item>
  </v-card>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: 'Article',
  props: {
    image: String,
    title: String,
    description: String,
    link: String,
    source: String,
  },
  data: () => ({
  }),
  methods: {
    ...mapActions(['register']),
    handleLogin() {
      this.register({
        email: this.email
      });
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser', 'getAreas'])
  }
};
</script>

<style>
</style>