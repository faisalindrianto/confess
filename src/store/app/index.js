export default {
  namespaced: true,
  state: {
    shallContentShowOverlay: false,
    nextRoute: '',
  },
  getters: {},
  mutations: {
    TOGGLE_CONTENT_OVERLAY(state, value) {
      state.shallContentShowOverlay = value !== undefined ? value : !state.shallContentShowOverlay
    },
    setNextRoute(state, value) {
      state.nextRoute = value
    },
  },
  actions: {},
}
