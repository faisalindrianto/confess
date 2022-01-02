import { createHelpers } from 'vuex-map-fields'
import firebase from 'firebase/app'
import { db, storage } from '@/firebase'

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
    setUserSchedules(state, data) {
      state.scheduleList = data
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
                    await state.dispatch('getMemberList', el.id).then(async members => {
                      await db.collection('teams').doc(el.id).collection('conferences').orderBy('created_at', 'desc')
                        .limit(1)
                        .get()
                        .then(latest => {
                          list.push({
                            id: el.id,
                            ...result.data(),
                            members,
                            latest_schedule: latest.empty ? null : latest.docs[0].data(),
                          })
                        })
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
    getUserSchedules(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('users').doc(payload).collection('schedule').get()
          .then(async schedule => {
            const list = []
            if (!schedule.empty) {
              await Promise.all(schedule.docs.map(async el => {
                await state.dispatch('getConferenceDetail', {
                  team_id: el.data().team_id,
                  conf_id: el.id,
                }).then(result => {
                  list.push(result)
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
        const query = db.collection('teams').doc(payload.team_id).collection('conferences')
        query.orderBy('created_at', 'desc').get()
          .then(async cons => {
            const list = []
            if (!cons.empty) {
              await Promise.all(cons.docs.map(async el => {
                await query.doc(el.id).collection('participants').get().then(async members => {
                  const participants = []
                  await Promise.all(members.docs.map(async member => {
                    state.dispatch('getUserData', member.id).then(data => {
                      participants.push({
                        uid: member.id,
                        ...data.data(),
                      })
                    })
                  }))
                  list.push({
                    id: el.id,
                    ...el.data(),
                    participants,
                  })
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
    createConference(state, payload) {
      return new Promise((resolve, reject) => {
        let id = ''
        const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
        for (let i = 0; i < 6; i += 1) {
          id += char.charAt(Math.floor(Math.random() * char.length))
        }

        db.collection('teams')
          .doc(payload.team_id)
          .collection('conferences')
          .doc(id)
          .set(payload.data, { merge: true })
          .then(async () => {
            await state.dispatch('joinConference', {
              team_id: payload.team_id,
              user_id: payload.data.created_by,
              conf_id: id,
            })
            resolve({ id })
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    getConferenceDetail(state, payload) {
      return new Promise((resolve, reject) => {
        const query = db.collection('teams').doc(payload.team_id).collection('conferences')
        query.doc(payload.conf_id).get()
          .then(async con => {
            if (con.exists) {
              await query.doc(payload.conf_id)
                .collection('participants')
                .get()
                .then(async members => {
                  const participants = []
                  await Promise.all(members.docs.map(async member => {
                    state.dispatch('getUserData', member.id).then(data => {
                      participants.push({
                        uid: member.id,
                        ...data.data(),
                      })
                    })
                  }))
                  resolve({
                    id: payload.conf_id,
                    ...con.data(),
                    participants,
                  })
                })
            } else {
              reject()
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    joinConference(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams')
          .doc(payload.team_id)
          .collection('conferences')
          .doc(payload.conf_id)
          .collection('participants')
          .doc(payload.user_id)
          .set({
            uid: payload.user_id,
            joined_at: firebase.firestore.FieldValue.serverTimestamp(),
          }, { merge: true })
          .then(() => {
            db.collection('users').doc(payload.user_id).collection('schedule').doc(payload.conf_id)
              .set({
                id: payload.conf_id,
                created_at: firebase.firestore.FieldValue.serverTimestamp(),
                team_id: payload.team_id,
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
    leaveConference(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams')
          .doc(payload.team_id)
          .collection('conferences')
          .doc(payload.conf_id)
          .collection('participants')
          .doc(payload.user_id)
          .delete()
          .then(() => {
            db.collection('users').doc(payload.user_id).collection('schedule').doc(payload.conf_id)
              .delete()
              .then(status => {
                resolve(status)
              })
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    updateConference(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams').doc(payload.team_id).collection('conferences').doc(payload.conf_id)
          .update(payload.data)
          .then(result => {
            resolve(result)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    deleteConference(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams').doc(payload.teamId).collection('conferences').doc(payload.confId)
          .delete()
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
        const metadata = {
          contentType: payload.file.type,
        }
        const upload = storage.ref().child(`docs/${payload.team_id}/${payload.conf_id}/${payload.file.name}`)
        upload.put(payload.file, metadata).then(async () => {
          const url = await upload.getDownloadURL()
          db.collection('teams').doc(payload.team_id).collection('documents').add({
            conf_id: payload.conf_id,
            type: payload.file.type,
            name: payload.file.name,
            size: payload.file.size,
            uploaded_at: firebase.firestore.FieldValue.serverTimestamp(),
            url,
          })
            .then(result => {
              resolve({
                ...result,
                url,
              })
            })
        }).catch(err => {
          reject(err)
        })
      })
    },
    deleteDocument(state, payload) {
      return new Promise((resolve, reject) => {
        storage.refFromURL(payload.url).delete().then(() => {
          db.collection('teams').doc(payload.team_id).collection('documents').doc(payload.doc_id)
            .delete()
            .then(result => {
              resolve(result)
            })
            .catch(err => {
              reject(err)
            })
        })
      })
    },
    sendChat(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('teams')
          .doc(payload.team_id)
          .collection('conferences')
          .doc(payload.conf_id)
          .collection('chats')
          .add(payload.data)
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
