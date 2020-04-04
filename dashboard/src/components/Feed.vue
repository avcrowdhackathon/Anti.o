<template>
  <div>
    <v-list class="overflow-y-auto" :max-height="viewport.height - 36" three-line>
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
  </div>
</template>

<script>
import ArticleTile from "./Article.vue";
import { mapActions, mapGetters } from "vuex";
import viewPortMixin from '../mixins/viewport'

export default {
  name: "Feed",
  components: {
    ArticleTile
  },
  mixins: [viewPortMixin],
  data: () => ({}),
  methods: {
    ...mapActions(["fetchArticles"])
  },
  computed: {
    ...mapGetters(["getArticles"]),
  }
};
</script>

<style>
</style>