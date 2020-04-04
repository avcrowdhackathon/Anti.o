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

export default {
  name: "Feed",
  components: {
    ArticleTile
  },
  data: () => ({}),
  methods: {
    ...mapActions(["fetchArticles"])
  },
  computed: {
    ...mapGetters(["getArticles"]),
    viewport() {
      const div = document.createElement("div");

      div.style.cssText = "position: fixed;top: 0;left: 0;bottom: 0;right: 0;";
      document.documentElement.insertBefore(
        div,
        document.documentElement.firstChild
      );

      const dims = { width: div.offsetWidth, height: div.offsetHeight };
      document.documentElement.removeChild(div);

      return dims;
    }
  }
};
</script>

<style>
</style>