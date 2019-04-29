import Vue from 'vue';
import Vuex from 'vuex';
import router from './router';

import { defaultClient as apolloClient } from './main';

import {
  GET_CURRENT_USER,
  GET_COURSES,
  INFINITE_SCROLL_COURSES,
  GET_USER_COURSES,
  SEARCH_COURSES,
  ADD_COURSE,
  UPDATE_USER_COURSE,
  DELETE_USER_COURSE,
  SIGNIN_USER,
  SIGNUP_USER
} from './queries';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    courses: [],
    userCourses: [],
    searchResults: [],
    user: null,
    loading: false,
    error: null,
    authError: null
  },
  mutations: {
    setCourses: (state, payload) => {
      state.courses = payload;
    },
    setSearchResults: (state, payload) => {
      if (payload !== null) {
        state.searchResults = payload;
      }
    },
    setUser: (state, payload) => {
      state.user = payload;
    },
    setUserCourses: (state, payload) => {
      state.userCourses = payload;
    },
    setLoading: (state, payload) => {
      state.loading = payload;
    },
    setError: (state, payload) => {
      state.error = payload;
    },
    setAuthError: (state, payload) => {
      state.authError = payload;
    },
    clearUser: state => (state.user = null),
    clearSearchResults: state => (state.searchResults = []),
    clearError: state => (state.error = null)
  },
  actions: {
    getCurrentUser: ({ commit }) => {
      commit('setLoading', true);
      apolloClient
        .query({
          query: GET_CURRENT_USER
        })
        .then(({ data }) => {
          commit('setLoading', false);
          commit('setUser', data.getCurrentUser);
          console.log(data.getCurrentUser);
        })
        .catch(err => {
          commit('setLoading', false);
          console.error(err);
        });
    },
    getCourses: ({ commit }) => {
      commit('setLoading', true);
      apolloClient
        .query({
          query: GET_COURSES
        })
        .then(({ data }) => {
          commit('setCourses', data.getCourses);
          commit('setLoading', false);
        })
        .catch(err => {
          commit('setLoading', false);
          console.error(err);
        });
    },
    getUserCourses: ({ commit }, payload) => {
      apolloClient
        .query({
          query: GET_USER_COURSES,
          variables: payload
        })
        .then(({ data }) => {
          commit('setUserCourses', data.getUserCourses);
        })
        .catch(err => {
          console.error(err);
        });
    },
    searchCourses: ({ commit }, payload) => {
      apolloClient
        .query({
          query: SEARCH_COURSES,
          variables: payload
        })
        .then(({ data }) => {
          commit('setSearchResults', data.searchCourses);
        })
        .catch(err => console.error(err));
    },
    addCourse: ({ commit }, payload) => {
      apolloClient
        .mutate({
          mutation: ADD_COURSE,
          variables: payload,
          update: (cache, { data: { addCourse } }) => {
            // First read the query you want to update
            const data = cache.readQuery({ query: GET_COURSES });
            // Create updated data
            data.getCourses.unshift(addCourse);
            // Write updated data back to query
            console.log(data);
            cache.writeQuery({
              query: GET_COURSES,
              data
            });
          },
          // optimistic response ensures data is added immediately as we specified for the update function
          optimisticResponse: {
            __typename: 'Mutation',
            addCourse: {
              __typename: 'Course',
              _id: -1,
              ...payload
            }
          },
          // Rerun specified queries after performing the mutation in order to get fresh data
          refetchQueries: [
            {
              query: INFINITE_SCROLL_COURSES,
              variables: {
                pageNum: 1,
                pageSize: 2
              }
            }
          ]
        })
        .then(({ data }) => {
          console.log(data.addCourse);
        })
        .catch(err => {
          console.error(err);
        });
    },
    updateUserCourse: ({ state, commit }, payload) => {
      apolloClient
        .mutate({
          mutation: UPDATE_USER_COURSE,
          variables: payload
        })
        .then(({ data }) => {
          const index = state.userCourses.findIndex(
            course => course._id === data.updateUserCourse._id
          );
          const userCourses = [
            ...state.userCourses.slice(0, index),
            data.updateUserCourse,
            ...state.userCourses.slice(index + 1)
          ];
          commit('setUserCourses', userCourses);
        })
        .catch(err => {
          console.error(err);
        });
    },
    deleteUserCourse: ({ state, commit }, payload) => {
      apolloClient
        .mutate({
          mutation: DELETE_USER_COURSE,
          variables: payload
        })
        .then(({ data }) => {
          const index = state.userCourses.findIndex(
            course => course._id === data.deleteUserCourse._id
          );
          const userCourses = [
            ...state.userCourses.slice(0, index),
            ...state.userCourses.slice(index + 1)
          ];
          commit('setUserCourses', userCourses);
        })
        .catch(err => {
          console.error(err);
        });
    },
    signinUser: ({ commit }, payload) => {
      commit('clearError');
      commit('setLoading', true);
      apolloClient
        .mutate({
          mutation: SIGNIN_USER,
          variables: payload
        })
        .then(({ data }) => {
          commit('setLoading', false);
          localStorage.setItem('token', data.signinUser.token);
          // to make sure created method is run in main.js (we run getCurrentUser), reload the page
          router.go();
        })
        .catch(err => {
          commit('setLoading', false);
          commit('setError', err);
          console.error(err);
        });
    },
    signupUser: ({ commit }, payload) => {
      commit('clearError');
      commit('setLoading', true);
      apolloClient
        .mutate({
          mutation: SIGNUP_USER,
          variables: payload
        })
        .then(({ data }) => {
          commit('setLoading', false);
          localStorage.setItem('token', data.signupUser.token);
          // to make sure created method is run in main.js (we run getCurrentUser), reload the page
          router.go();
        })
        .catch(err => {
          commit('setLoading', false);
          commit('setError', err);
          console.error(err);
        });
    },
    signoutUser: async ({ commit }) => {
      // clear user in state
      commit('clearUser');
      // remove token in localStorage
      localStorage.setItem('token', '');
      // end session
      await apolloClient.resetStore();
      // redirect home - kick users out of private pages (i.e. profile)
      router.push('/');
    }
  },
  getters: {
    courses: state => state.courses,
    userCourses: state => state.userCourses,
    searchResults: state => state.searchResults,
    user: state => state.user,
    userFavorites: state => state.user && state.user.favorites,
    loading: state => state.loading,
    error: state => state.error,
    authError: state => state.authError
  }
});
