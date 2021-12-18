import { createHelpers } from 'vuex-map-fields'
import { db } from '@/firebase'
import { reject, resolve } from 'core-js/fn/promise'

const { getTeamFields, updateTeamFields } = createHelpers({
  getterType: 'getTeamFields',
  mutationType: 'updateTeamFields',
})

export default {
  state: {
    loadingTeams: false,
    teamList: [],
    loadingSchedule: false,
    scheduleList: [],
  },
  getters: {
    getTeamFields,
  },
  mutations: {
    updateTeamFields,
  },
  actions: {
    getUserTeams(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('users').doc(payload).collection('teams').get().then(teams => {
          resolve(teams)
        }).catch(err => {
          reject(err)
        })
      })
    },
    getUserSchedules(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('users').doc(payload).collection('schedule').get().then(schedule => {
          resolve(schedule)
        }).catch(err => {
          reject(err)
        })
      })
    },
    getTeamDetail(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams').doc(payload).get().then(data => {
          resolve(data)
        }).catch(err => {
          reject(err)
        })
      })
    },
    createTeam(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams').add(payload).then(result => {
          resolve(result)
        }).catch(err => {
          reject(err)
        })
      })
    },
    deleteTeam(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams').doc(payload).delete().then(result => {
          resolve(result)
        }).catch(err => {
          reject(err)
        })
      })
    },
    joinTeam(state, payload) {
      return new Promise((resolve, reject) => {
        // gak tau males
      })
    },
  },
}
