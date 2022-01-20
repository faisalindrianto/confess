/* eslint-disable */
import firebase from 'firebase/app'
import { db } from '@/firebase'

const meets = db.collection('meets')
const server = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
}
const peer = new RTCPeerConnection(server)

export default {
  state: {
    loadingCreate: false,
    loadingJoin: false,
    meetingCode: '',
    isInitiator: true,
    media: {
      microphone: true,
      camera: true,
      screen: false,
    },
    meetingParticipants: [],
    stream: {
      localStream: null,
      remoteStream: null,
    },
  },
  getters: {},
  mutations: {
    setLoadingCreate(state, data) {
      state.loadingCreate = data
    },
    setLoadingJoin(state, data) {
      state.loadingJoin = data
    },
    setLocalStream(state, data) {
      state.stream.localStream = data
    },
  },
  actions: {
    generateRandomId() {
      const food = [
        'klepon', 'ondeonde', 'lemper', 'dadargulung', 'nagasari', 'kuecucur',
        'cenil', 'lupis', 'bikang', 'serabi', 'wajik', 'putuayu', 'lumpia', 'getuk',
        'lapislegit', 'kuemangkok', 'kuelumpur', 'semarmendem', 'jentikmanis', 'putrimandi',
        'klanting', 'aremarem', 'pastel', 'bolukukus', 'donat', 'combro', 'risol', 'kuetalam',
        'kuesus', 'keraktelor',
      ]
      const id = Math.floor(Math.random() * 9999)

      return `${food[Math.floor(Math.random() * food.length)]}-${id}`
    },
    createMeting(state) {
      return new Promise((resolve, reject) => {
        state.dispatch('generateRandomId').then(code => {
          const userName = localStorage.getItem('userName')
  
          state.isInitiator = true
          state.commit('setLoadingCreate', true)
          meets.doc(code).set({
            initialized_by: userName,
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
          }, { merge: true }).then(() => {
            state.commit('setLoadingCreate', false)
            resolve(code)
          }).catch(() => {
            state.commit('setLoadingCreate', false)
            reject()
          })
        })
      })
    },
    join(state) {
      return new Promise(resolve => {
        state.commit('setLoadingCreate', true)
        setTimeout(() => {
          state.commit('setLoadingCreate', false)
          resolve()
        }, 3000)
      })
    },
    setMeetingName(state, payload) {
      return new Promise((resolve, reject) => {
        meets.doc(payload.code).collection('participants').doc(payload.uid).update({
          name: payload.name,
        })
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
