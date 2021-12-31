import { createHelpers } from 'vuex-map-fields'
import firebase from 'firebase/app'
import { db } from '@/firebase'

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
    setUserTeams(state, data) {
      state.teamList = data
    },
  },
  actions: {
    getUserTeams(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('users').doc(payload).collection('teams').get()
          .then(async teams => {
            const list = []
            if (!teams.empty) {
              await Promise.all(teams.docs.map(async el => {
                await state.dispatch('getTeamDetail', el.id).then(async result => {
                  if (result.exists) {
                    await state.dispatch('getMemberList', el.id).then(members => {
                      list.push({
                        id: el.id,
                        ...result.data(),
                        members,
                      })
                    })
                  }
                })
              }))
            }
            console.log(list)
            resolve(list)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    getUserSchedules(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('users').doc(payload).collection('schedule').get()
          .then(schedule => {
            resolve(schedule)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    getTeamDetail(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams').doc(payload).get().then(async data => {
          resolve(data)
        })
          .catch(err => {
            reject(err)
          })
      })
    },
    createTeam(state, payload) {
      return new Promise((resolve, reject) => {
        let id = ''
        const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
        for (let i = 0; i < 6; i += 1) {
          id += char.charAt(Math.floor(Math.random() * char.length))
        }

        db.collection('teams').doc(id).set(payload, { merge: true }).then(async () => {
          await state.dispatch('joinTeam', {
            user_id: payload.host,
            team_id: id,
          })
          resolve({ id })
        })
          .catch(err => {
            reject(err)
          })
      })
    },
    updateTeam(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams').doc(payload.team_id).update(payload.data).then(result => {
          resolve(result)
        })
          .catch(err => {
            reject(err)
          })
      })
    },
    deleteTeam(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams').doc(payload).delete().then(result => {
          resolve(result)
        })
          .catch(err => {
            reject(err)
          })
      })
    },
    joinTeam(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams').doc(payload.team_id).collection('members').doc(payload.user_id)
          .set({
            uid: payload.user_id,
            joined_at: firebase.firestore.FieldValue.serverTimestamp(),
          }, { merge: true })
          .then(() => {
            db.collection('users').doc(payload.user_id).collection('teams').doc(payload.team_id)
              .set({
                uid: payload.team_id,
                joined_at: firebase.firestore.FieldValue.serverTimestamp(),
              })
              .then(status => {
                resolve(status)
              })
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    leaveTeam(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams')
          .doc(payload.team_id)
          .collection('members')
          .doc(payload.user_id)
          .delete()
          .then(() => {
            db.collection('users')
              .doc(payload.user_id)
              .collection('teams')
              .doc(payload.team_id)
              .delete()
              .then(result => {
                resolve(result)
              })
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    getMemberList(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams').doc(payload).collection('members').get()
          .then(async members => {
            const list = []
            if (!members.empty) {
              await Promise.all(members.docs.map(async el => {
                await state.dispatch('getUserData', el.id).then(result => {
                  if (result.exists) {
                    list.push({
                      uid: el.id,
                      ...result.data(),
                    })
                  }
                })
              }))
            }
            resolve(list)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    getConferenceList(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams').doc(payload.team_id).collection('conferences').get()
          .then(result => {
            resolve(result)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    createConference(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams')
          .doc(payload.team_id)
          .collection('conferences')
          .doc(payload.con_id)
          .set(payload.data, { merge: true })
          .then(result => {
            resolve(result)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    getDocumentList(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams').doc(payload.team_id).collection('documents').get()
          .then(result => {
            resolve(result)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    getDocumentDetail(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams').doc(payload.team_id).collection('documents').doc(payload.doc_id)
          .get()
          .then(result => {
            resolve(result)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    uploadDocument(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams').doc(payload.team_id).collection('documents').add(payload.data)
          .then(result => {
            resolve(result)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    deleteDocument(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams').doc(payload.team_id).collection('documents').doc(payload.doc_id)
          .delete()
          .then(result => {
            resolve(result)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
  },
}
