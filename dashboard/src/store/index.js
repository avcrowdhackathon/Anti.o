import Vue from 'vue';
import Vuex from 'vuex';

import httpGetArticles from '../services/articles';
import getAreas from '../services/areas';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    authenticated: false,
    currentUser: {},
    users: ['test@test.com'],
    areas: {},
    articles: [],
    userArea: null
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
        commit('register', { user: state.users[0], area: authPayload.area });
        return;
      }
      commit('register', { user: state.users[0], area: authPayload.area });
      // register user
    },
    fetchArticles: async ({ commit }, areas) => {
      const searchString = areas.length > 0 ? `(${areas.join(' OR ')})` : null;
      const data = await httpGetArticles(searchString);

      commit('fetchArticles', data.articles);
    },
    fetchAreas: async ({ commit }) => {
      const areas = getAreas();
      commit('fetchAreas', areas);
    }
  },
  mutations: {
    register: (state, { user, area }) => {
      state.authenticated = true;
      state.currentUser = user;
      state.userArea = area;
    },
    fetchArticles: (state, articles) => {
      state.articles = articles;
    },
    fetchAreas: (state, areas) => {
      state.areas = areas;
    }
  },
  modules: {}
});
