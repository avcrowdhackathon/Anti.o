<template>
  <v-list three-line>
    <template v-for="(a, index) in getArticles">
      <article-Tile
        :key="index"
        :image="a.urlToImage"
        :title="a.title"
        :description="a.description"
        :link="a.url"
        :source="a.source.name"
      />
    </template>
  </v-list>
</template>

<script>
import ArticleTile from './Article.vue'
import {mapActions, mapGetters} from 'vuex'

export default {
  name: "Feed",
  components: {
    ArticleTile
  },
  data: () => ({
  }),
  methods: {
    ...mapActions(['fetchArticles'])
  },
  computed: {
    ...mapGetters(['getArticles'])
  },
};
</script>

<style>
</style>