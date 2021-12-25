import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/app/Home.vue'),
    meta: {
      layout: 'blank',
      pageTitle: 'Home',
    },
  },
  {
    path: '/teams',
    name: 'teams',
    component: () => import('@/views/teams/Dashboard.vue'),
    meta: {
      layout: 'blank',
      pageTitle: 'Confess Teams',
    },
  },
  {
    path: '/teams/:id',
    name: 'teams-detail',
    component: () => import('@/views/teams/Details.vue'),
    meta: {
      layout: 'blank',
      pageTitle: 'Confess Teams',
    },
    props: true,
  },
  {
    path: '/con/:id',
    name: 'con',
    component: () => import('@/views/app/Conference.vue'),
    meta: {
      layout: 'blank',
      pageTitle: 'Conference',
    },
    props: true,
  },
  {
    path: '*',
    redirect: 'error-404',
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior() {
    return { x: 0, y: 0 }
  },
})

router.beforeEach((to, from, next) => {
  window.document.title = to.meta && to.meta.pageTitle ? `${to.meta.pageTitle} - Confess - Conference Information System` : 'Confess - Conference Information System'
  store.commit('app/setNextRoute', to)
  next()
})

export default router
