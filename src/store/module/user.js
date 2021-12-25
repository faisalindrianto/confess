import { createHelpers } from 'vuex-map-fields'
import firebase from 'firebase/app'
import { db, auth } from '@/firebase'

const { getUserField, updateUserField } = createHelpers({
  getterType: 'getUserField',
  mutationType: 'updateUserField',
})

export default {
  state: {
    // user data information
    loadingUserData: false,
    loadingSignUp: false,
    userData: {},

    // auth information
    isAuthenticated: false,
    loadingGoogleAuth: false,
    googleAuthInformation: {},

    // notifications stuff
    loadingNotifications: false,
    notifications: [],
  },
  getters: {
    getUserField,
  },
  mutations: {
    updateUserField,
  },
  actions: {
    initApp(state) {
      const user = JSON.parse(localStorage.getItem('userData'))

      if (user) {
        state.commit('updateUserField', { path: 'userData', value: user })
        state.commit('updateUserField', { path: 'isAuthenticated', value: true })

        state.dispatch('getNotifications', user.uid).then(data => {
          if (!data.empty) {
            state.commit('updateUserField', { path: 'notifications', value: data.docs.map(el => el.data()) })
          }
        })
      }
    },
    signInWithGoogle(state) {
      return new Promise((resolve, reject) => {
        state.commit('updateUserField', { path: 'loadingGoogleAuth', value: true })
        const googleProvider = new firebase.auth.GoogleAuthProvider()
        auth.signInWithPopup(googleProvider).then(data => {
          state.commit('updateUserField', { path: 'loadingGoogleAuth', value: false })
          state.commit('updateUserField', { path: 'isAuthenticated', value: true })
          state.commit('updateUserField', { path: 'googleAuthInformation', value: data })
          resolve(data)
        }).catch(err => {
          state.commit('updateUserField', { path: 'loadingGoogleAuth', value: false })
          reject(err)
        })
      })
    },
    signIn(state, payload) {
      return new Promise((resolve, reject) => {
        state.commit('updateUserField', { path: 'loadingUserData', value: true })
        db.collection('users').doc(payload).get()
          .then(data => {
            const userData = {
              ...data.data(),
              uid: payload,
            }
            localStorage.setItem('userData', JSON.stringify(userData))
            state.commit('updateUserField', { path: 'userData', value: userData })
            state.commit('updateUserField', { path: 'loadingUserData', value: false })
            db.collection('users').doc(payload).update({
              last_login: firebase.firestore.FieldValue.serverTimestamp(),
            })
            resolve(data)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    signUp(state, payload) {
      return new Promise((resolve, reject) => {
        state.commit('updateUserField', { path: 'loadingSignUp', value: true })
        db.collection('users').add(payload).then(data => {
          state.commit('updateUserField', { path: 'loadingSignUp', value: false })
          resolve(data)
        }).catch(err => {
          state.commit('updateUserField', { path: 'loadingSignUp', value: false })
          reject(err)
        })
      })
    },
    getUserData(state, payload) {
      return new Promise((resolve, reject) => {
        db.collection('users').doc(payload).get().then(data => {
          resolve(data)
        })
          .catch(err => {
            reject(err)
          })
      })
    },
    getNotifications(state, payload) {
      return new Promise((resolve, reject) => {
        state.commit('updateUserField', { path: 'loadingNotifications', value: true })
        db.collection('users').doc(payload).collection('notifications').get()
          .then(data => {
            state.commit('updateUserField', { path: 'loadingNotifications', value: false })
            resolve(data)
          })
          .catch(err => {
            state.commit('updateUserField', { path: 'loadingNotifications', value: false })
            reject(err)
          })
      })
    },
    logout(state) {
      return new Promise((resolve, reject) => {
        auth.signOut().then(() => {
          state.commit('updateUserField', { path: 'isAuthenticated', value: false })
          state.commit('updateUserField', { path: 'googleAuthInformation', value: {} })
          localStorage.removeItem('userData')
          resolve()
        }).catch(err => {
          reject(err)
        })
      })
    },
  },
}
