import Vue from 'vue';
import Vuex from 'vuex';

import httpGetArticles from '../http-helpers/articles.js'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    authenticated: false,
    currentUser: {},
    users: ["test@test.com"],
    areas: ["Χαλανδρι", "Μαρούσι", "Αθήνα", "Κοζάνη"],
    articles: [],
    userArea: null,
  },
  getters: {
    isAuthenticated: (state) => state.authenticated,
    getCurrentUser: (state) => state.currentUser,
    getAreas: (state) => state.areas,
    getArticles: (state) => state.articles,
    getArea: (state) => state.userArea
  },
  actions: {
    register: ({ commit, state }, authPayload) => {
      const user = state.users.find((u) => u === authPayload.email);
      if (user) {
        // user exists, get his locations and render accordingly
        commit('register', {user: state.users[0], area: authPayload.area})
        return;
      }
      commit('register', {user: state.users[0], area: authPayload.area})
      return;
      //register user
    },
    fetchArticles: async ({ commit }, area) => {
      const articles = await (await httpGetArticles(area)).data.articles;
      commit('fetchArticles', articles)
    },
  },
  mutations: {
    register: (state, { user, area }) => {
      state.authenticated = true;
      state.currentUser = user;
      state.userArea = area;
    },
    fetchArticles: (state, articles) => {
      state.articles = articles
    }
  },
  modules: {},
});
