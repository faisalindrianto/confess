import appConfigStoreModule from '@core/@app-config/appConfigStoreModule'
import Vue from 'vue'
import Vuex from 'vuex'
import app from './app'
import user from './module/user'
import team from './module/team'
import webrtc from './module/webrtc'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    appConfig: appConfigStoreModule,
    app,
    user,
    team,
    webrtc,
  },
})
