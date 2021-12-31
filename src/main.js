import Toast from 'vue-toastification'
import VueClipboard from 'vue-clipboard2'
import 'vue-toastification/dist/index.css'
import '@/plugins/vue-composition-api'
import '@/styles/styles.scss'
import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'

Vue.use(Toast)
Vue.use(VueClipboard)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
}).$mount('#app')
