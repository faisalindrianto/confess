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
    signInWithGoogle(state) {
      return new Promise((resolve, reject) => {
        state.commit('updateUserField', { path: 'loadingGoogleAuth', value: true })
        const googleProvider = new firebase.auth.GoogleAuthProvider()
        auth.signInWithPopup(googleProvider).then(data => {
          state.commit('updateUserField', { path: 'loadingGoogleAuth', value: false })
          console.log('success from vuex', data)
          resolve(data)
        }).catch(err => {
          state.commit('updateUserField', { path: 'loadingGoogleAuth', value: false })
          console.log('failed from vuex', err)
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
        db.collection('users').doc(payload).collection('notifications').get()
          .then(data => {
            resolve(data)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
  },
}
