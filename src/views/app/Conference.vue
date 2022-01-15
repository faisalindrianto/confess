<template>
  <div>
    <div class="d-flex justify-space-between py-4 px-8 w-100 align-center">
      <h6 class="text-h5 font-weight-bold primary--text">
        confess
      </h6>
      <v-chip
        class="primary--text font-weight-medium white"
        @click="copyCode"
      >
        <span class="mr-2">{{ id }}</span>
        <v-icon size="16px">
          {{ icons.mdiContentCopy }}
        </v-icon>
      </v-chip>
    </div>
    <v-card class="mx-8 main d-flex flex-column">
      <div class="d-flex video-top">
        <div class="w-100 d-flex flex-column align-center justify-center">
          <div
            class="video-list pa-4 overflow-auto"
          >
            <v-card
              v-for="i in 1"
              :key="i"
              :min-width="showSidebar ? '240px' : '500px'"
              max-width="500px"
              elevation="0"
              class="mr-2 mb-2 flex-grow-1 aspect916"
            >
              <video
                id="localStream"
                ref="webcamVideo"
                autoplay
                muted
                playsinline
              />
            </v-card>
            <v-card
              v-for="stream in remoteStream"
              :key="stream.peerId"
              :min-width="showSidebar ? '240px' : '500px'"
              max-width="500px"
              elevation="0"
              class="mr-2 mb-2 flex-grow-1 aspect916"
            >
              <video
                :id="`stream-${stream.peerId}`"
                ref="remoteVideo"
                autoplay
                playsinline
                muted
              />
            </v-card>
          </div>
        </div>
        <div
          v-if="showSidebar"
          class="sidebar"
        >
          <v-tabs-items
            v-model="currentTab"
            class="h-full"
          >
            <v-tab-item class="h-full">
              <div
                v-if="conferenceData.created_at"
                class="pa-4 d-flex flex-column"
              >
                <span class="text-h6 mb-2">Informasi</span>
                <span class="text-overline">alamat tautan</span>
                <v-btn
                  class="primary--text font-weight-medium white mb-4"
                  rounded
                  @click="copyLink"
                >
                  <span class="mr-2">Salin Alamat Tautan</span>
                  <v-icon size="16px">
                    {{ icons.mdiContentCopy }}
                  </v-icon>
                </v-btn>
                <div class="mb-2">
                  <span class="text-overline">peserta</span>
                  <v-card
                    v-for="i in 4"
                    :key="i"
                    outlined
                    class="pa-2 d-flex flex-column mb-2"
                  >
                    <span class="text-subtitle-2">Nama</span>
                  </v-card>
                </div>
                <span class="text-overline">dibuat oleh</span>
                <span class="text-body-2 black--text mb-4">{{ conferenceData.initialized_by }}</span>
                <span class="text-overline">waktu dibuat</span>
                <span class="text-body-2 black--text">{{ conferenceData.created_at.toDate() }}</span>
              </div>
            </v-tab-item>
            <v-tab-item class="h-full">
              <div class="pa-4 d-flex flex-column">
                <span class="text-h6 mb-2">Chat</span>
                <div
                  v-for="chat in chats"
                  :key="chat.id"
                  class="pa-2 d-flex flex-column chat-bubble"
                  :class="deviceId === chat.sender ? 'ml-auto text-right' : 'mr-auto'"
                >
                  <span
                    v-if="deviceId !== chat.sender"
                    class="text-caption primary--text"
                  >{{ chat.sender_name }}</span>
                  <span class="text-body-2">{{ chat.content }}</span>
                  <span
                    v-if="chat.delivered_at"
                    class="text-xs text--disabled"
                  >{{ formatTime(chat.delivered_at.toDate()) }}</span>
                </div>
              </div>
              <div class="chat-input px-4">
                <v-form
                  @submit.prevent="sendChat()"
                >
                  <v-text-field
                    v-model="chatInput"
                    hide-details
                    outlined
                    dense
                    placeholder="Kirim pesan..."
                    :append-icon="chatInput.length > 2 ? icons.mdiSend : ''"
                    @click:append="sendChat()"
                  />
                </v-form>
              </div>
            </v-tab-item>
            <v-tab-item class="h-full">
              Dokumen
            </v-tab-item>
          </v-tabs-items>
        </div>
      </div>
      <div class="bottom pa-4 d-flex justify-space-between">
        <div>
          <v-icon @click="showSidebar = true; currentTab = 0">
            {{ icons.mdiInformationOutline }}
          </v-icon>
        </div>
        <div class="d-flex align-center">
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                fab
                x-small
                :color="isMicrophoneActive ? 'success' : 'secondary'"
                class="mx-2"
                v-bind="attrs"
                v-on="on"
                @click="isMicrophoneActive = !isMicrophoneActive"
              >
                <v-icon
                  dark
                >
                  {{ isMicrophoneActive ? icons.mdiMicrophone : icons.mdiMicrophoneOff }}
                </v-icon>
              </v-btn>
            </template>
            <span>Status Mikrofon</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                fab
                x-small
                class="mx-2"
                v-bind="attrs"
                v-on="on"
                @click="showSidebar = true; currentTab = 1;"
              >
                <v-icon>
                  {{ icons.mdiMessageOutline }}
                </v-icon>
              </v-btn>
            </template>
            <span>Akses Chat</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                fab
                x-small
                class="mx-2"
                v-bind="attrs"
                v-on="on"
                @click="showSidebar = true; currentTab = 2;"
              >
                <v-icon>
                  {{ icons.mdiFileUpload }}
                </v-icon>
              </v-btn>
            </template>
            <span>Upload Dokumen</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                fab
                x-small
                class="mx-2"
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>
                  {{ icons.mdiMonitorScreenshot }}
                </v-icon>
              </v-btn>
            </template>
            <span>Bagikan Layar</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                fab
                x-small
                color="error"
                class="mx-2"
                v-bind="attrs"
                v-on="on"
              >
                <v-icon
                  dark
                >
                  {{ icons.mdiPhoneHangup }}
                </v-icon>
              </v-btn>
            </template>
            <span>Tinggalkan Konferensi</span>
          </v-tooltip>
        </div>
        <v-slide-x-reverse-transition
          mode="out-in"
        >
          <v-icon
            :key="showSidebar"
            @click="showSidebar = !showSidebar"
          >
            {{ showSidebar ? icons.mdiClose : icons.mdiMenu }}
          </v-icon>
        </v-slide-x-reverse-transition>
      </div>
    </v-card>
    <v-dialog
      v-model="showSetNameDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title>
          Atur Nama
        </v-card-title>
        <v-card-text>
          Kenalan dulu yuk!
        </v-card-text>
        <div class="px-4 pb-4">
          <v-form
            lazy-validation
            @submit.prevent="setName()"
          >
            <v-text-field
              v-model="inputName"
              dense
              placeholder="Input Nama"
              outlined
              hide-details
              :append-icon="inputName.length > 3 ? icons.mdiCheck : ''"
              :loading="loadingSetName"
              @click:append="setName()"
            ></v-text-field>
          </v-form>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import { ref, onMounted } from '@vue/composition-api'
import firebase from 'firebase/app'
import {
  mdiMenu, mdiClose, mdiMicrophone, mdiMicrophoneOff, mdiInformationOutline,
  mdiMessageOutline, mdiPhoneHangup, mdiMonitorScreenshot, mdiContentCopy,
  mdiSend, mdiFileUpload, mdiCheck,
} from '@mdi/js'
import { format } from 'date-fns'
import { db } from '@/firebase'
import router from '@/router'
import preferCodec from './codec'

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  methods: {
    copyCode() {
      this.$copyText(this.id).then(() => {
        this.$toast.success('Kode Berhasil Disalin!')
      })
    },
    copyLink() {
      this.$copyText(window.location.href).then(() => {
        this.$toast.success('Tautan Berhasil Disalin!')
      })
    },
  },
  setup(props) {
    const showSidebar = ref(false)
    const isMicrophoneActive = ref(true)
    const currentTab = ref(0)
    const deviceId = localStorage.getItem('deviceId')
    const formatTime = date => format(date, 'HH:mm')
    const conferenceData = ref({})
    const meetRef = db.collection('meets').doc(props.id)
    let userName = localStorage.getItem('userName')
    const uid = deviceId
    const showSetNameDialog = ref(false)
    const loadingSetName = ref(false)
    const inputName = ref('')

    // webrtc controls
    const configuration = {
      iceServers: [{
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      }],
      iceCandidatePoolSize: 10,
    }
    let localStream = null
    const remoteStream = ref([])
    const disableScreenShare = ref(false)
    const captureStream = null
    const screenState = ref(false)
    const contentId = ref(null)

    const openUserMedia = async () => {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      document.querySelector('#localStream').srcObject = localStream
    }

    const addUserToRoom = async () => {
      await meetRef.collection('participants').doc(uid).set({
        name: userName,
        id: uid,
        display: 'user',
      })
    }

    function registerPeerConnectionListeners(peerConnection) {
      peerConnection.addEventListener('icegatheringstatechange', () => {
        console.log(
          `ICE gathering state changed: ${peerConnection.iceGatheringState}`,
        )
      })

      peerConnection.addEventListener('connectionstatechange', () => {
        console.log(`Connection state change: ${peerConnection.connectionState}`)
      })

      peerConnection.addEventListener('signalingstatechange', () => {
        console.log(`Signaling state change: ${peerConnection.signalingState}`)
      })

      peerConnection.addEventListener('iceconnectionstatechange ', () => {
        console.log(
          `ICE connection state change: ${peerConnection.iceConnectionState}`,
        )
      })
    }

    const signalICECandidates = (peerConnection, peerId, Id) => {
      const callerCandidatesCollection = meetRef.collection(Id)
      peerConnection.addEventListener('icecandidate', event => {
        if (!event.candidate) {
          console.log('got final candidate!')
        } else {
          console.log('got candidate', event.candidate)
          callerCandidatesCollection.add(event.candidate.toJSON()).then(docRef => {
            docRef.update({
              id: peerId,
            })
          })
        }
      })
    }

    const sendStream = (peerConnection, stream) => {
      console.log(stream)
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream)
      })
    }

    const createOffer = async peerConnection => {
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)
      console.log('Created offer:', offer)
      offer.sdp = preferCodec(offer.sdp, 'h264')

      return offer
    }

    const sendOffer = async (offer, peerId, Id, isUserContent) => {
      const peerOffer = {
        offer: {
          type: offer.type,
          sdp: offer.sdp,
          display: 'user',
        },
      }

      if (isUserContent) {
        peerOffer.display = 'content'
      }

      await meetRef.collection(peerId).doc('SDP').collection('offer').doc(Id)
        .set(peerOffer)
    }

    const receiveOffer = async (peerConnection, peerId, Id) => {
      await meetRef.collection(Id).doc('SDP').collection('offer').doc(peerId)
        .get()
        .then(async snapshot => {
          if (snapshot.exists) {
            const data = snapshot.data()
            const { offer } = data
            console.log('got offer', offer)
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
          }
        })
    }

    const createAnswer = async peerConnection => {
      const answer = await peerConnection.createAnswer()
      console.log('created answer:', answer)
      await peerConnection.setLocalDescription(answer)
      answer.sdp = preferCodec(answer.sdp, 'h264')

      return answer
    }

    const sendAnswer = async (answer, peerId, Id, isUserContent) => {
      const peerAnswer = {
        answer: {
          type: answer.type,
          sdp: answer.sdp,
          display: 'user',
        },
      }

      if (isUserContent) {
        peerAnswer.answer.display = 'content'
        peerAnswer.display = 'content'
      }

      await meetRef.collection(peerId).doc('SDP').collection('answer').doc(Id)
        .set(peerAnswer)
    }

    const receiveAnswer = async (peerConnection, peerId, Id) => {
      meetRef.collection(Id).doc('SDP').collection('answer').doc(peerId)
        .onSnapshot(async snapshot => {
          if (snapshot.exists) {
            const data = snapshot.data()
            console.log('got remote description', data.answer)
            const rtcSessionDescription = new RTCSessionDescription(data.answer)
            await peerConnection.setRemoteDescription(rtcSessionDescription)
          }
        })
    }

    const receiveICECandidates = async (peerConnection, remoteEndpointID, Id) => {
      console.log('asdasdasd', remoteEndpointID)
      console.log('zxczxc', Id)
      meetRef.collection(remoteEndpointID).where('id', '==', Id).onSnapshot(snapshot => {
        console.log(snapshot)
        snapshot.docChanges().forEach(async change => {
          if (change.type === 'added' && change.doc.id !== 'SDP') {
            console.log(change)
            const data = change.doc.data()
            console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`)
            await peerConnection.addIceCandidate(new RTCIceCandidate(data))
          }
        })
      })
    }

    const closeConnection = (peerConnection, peerId) => {
      meetRef.collection('participants').where('id', '==', peerId).onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'removed') {
            if (change.doc.data().display === 'content') {
              console.log('remove the content later')

              // document.getElementById('screenShareButton').classList.remove('hidden');
            }
            peerConnection.close()
            console.log('remove video list here')

            // if (document.getElementById("video" + peerId + "Container") != null) {
            //   document.getElementById("video" + peerId + "Container").remove();
            // }
            // enforceLayout(--numberOfDisplayedPeers);
          }
        })
      })
    }

    const restartConnection = (peerConnection, peerId) => {
      // eslint-disable-next-line no-param-reassign
      peerConnection.oniceconnectionstatechange = async () => {
        console.log('restarting connection with', peerId)
        if (peerConnection.restartIce) {
          peerConnection.restartIce()
        } else {
          peerConnection.createOffer({
            iceRestart: true,
          }).then(peerConnection.setLocalDescription)
            .then(async offer => {
              await sendOffer(offer, peerId, false)
            })
        }
      }
    }

    const receiveStream = (peerConnection, remoteEndpointID, isPeerContent) => {
      peerConnection.addEventListener('track', event => {
        if (!remoteStream.value.some(el => el.peerId === remoteEndpointID)) {
          console.log('got remote track', event)
          remoteStream.value.push({
            peerId: remoteEndpointID,
            isPeerContent,
            src: event.streams[0],
            muted: false,
          })
          setTimeout(() => {
            document.querySelector(`#stream-${remoteEndpointID}`).srcObject = new MediaStream()
            // eslint-disable-next-line prefer-destructuring
            document.querySelector(`#stream-${remoteEndpointID}`).srcObject = event.streams[0]
            document.querySelector(`#stream-${remoteEndpointID}`).autoplay = true
            document.querySelector(`#stream-${remoteEndpointID}`).playsInline = true
            document.querySelector(`#stream-${remoteEndpointID}`).muted = false
          }, 2000)
        }
      })
    }

    const peerRequestConnection = async (peerId, Id, isUserContent, isPeerContent) => {
      console.log('starting peerRequestConnection')
      const peerConnection = new RTCPeerConnection(configuration)

      registerPeerConnectionListeners(peerConnection)

      if (isUserContent) {
        sendStream(peerConnection, captureStream)
      } else {
        sendStream(peerConnection, localStream)
      }

      signalICECandidates(peerConnection, peerId, Id)

      const offer = await createOffer(peerConnection)
      await sendOffer(offer, peerId, Id, isUserContent)

      if (!isUserContent) {
        receiveStream(peerConnection, peerId, isPeerContent)
      }

      await receiveAnswer(peerConnection, peerId, Id)

      await receiveICECandidates(peerConnection, peerId, Id)

      // document.querySelector('#hangupBtn').addEventListener('click', () => peerConnection.close());

      if (!isUserContent) {
        closeConnection(peerConnection, peerId)
        restartConnection(peerConnection, peerId)
      }
    }

    const peerAcceptConnection = async (peerId, Id, isPeerContent, isUserContent) => {
      console.log('Create PeerConnection with configuration: ', configuration)
      const peerConnection = new RTCPeerConnection(configuration)
      registerPeerConnectionListeners(peerConnection)

      if (!isPeerContent) {
        if (isUserContent) {
          sendStream(peerConnection, captureStream)
        } else {
          sendStream(peerConnection, localStream)

          // document.getElementById('cameras').childNodes.forEach(camera => {
          //   camera.addEventListener('click', () => {
          //     switchStream(peerConnection, cameraStream)
          //   });
          // });
        }
      }

      signalICECandidates(peerConnection, peerId, Id)

      if (!isUserContent) {
        receiveStream(peerConnection, peerId, isPeerContent)
      }

      await receiveOffer(peerConnection, peerId, Id)

      const answer = await createAnswer(peerConnection)

      await sendAnswer(answer, peerId, Id, isUserContent)

      await receiveICECandidates(peerConnection, peerId, Id)

      // document.querySelector('#hangupBtn').addEventListener('click', () => peerConnection.close())

      if (!isUserContent) {
        closeConnection(peerConnection, peerId)
      }

      if (!isUserContent) {
        restartConnection(peerConnection, peerId)
      }
    }

    const requestConnectionToCurrentPeers = (Id, isContent) => {
      meetRef.collection('participants').get().then(snapshot => {
        snapshot.docs.forEach(async doc => {
          const peerId = doc.id
          const isPeerContent = doc.data().display === 'content'

          if (peerId !== uid && peerId !== Id) {
            if (isPeerContent) {
              disableScreenShare.value = true
            }

            await peerRequestConnection(peerId, Id, isContent, isPeerContent)
          }
        })
      })
    }

    const signalHangup = () => {
      meetRef.collection('participants').doc(uid).delete()
      if (screenState.value) {
        meetRef.collection('participants').doc(contentId.value).delete()
      }
    }

    const acceptConnectionsFromJoiningPeers = (Id, isReceiverContent) => {
      meetRef.collection(Id).doc('SDP').collection('offer').onSnapshot(async snapshot => {
        await snapshot.docChanges().forEach(async change => {
          if (change.type === 'added') {
            console.log('accepting request from ', change.doc.id)
            let isSenderContent = false
            console.log(change.doc.data())
            if (change.doc.data().display === 'content') {
              isSenderContent = true

              // disable screen share here
            }
            console.log('is sender content', isSenderContent)
            await peerAcceptConnection(change.doc.id, Id, isSenderContent, isReceiverContent)
          } else {
            console.log('mesh has been setup')
          }
        })
      })
    }

    const joinRoom = () => {
      meetRef.get().then(data => {
        if (data.exists) {
          conferenceData.value = data.data()
          addUserToRoom()
          requestConnectionToCurrentPeers(uid, false)
          acceptConnectionsFromJoiningPeers(uid, false)
        } else {
          router.replace('/')
          Vue.$toast.error('Maaf kode tersebut tidak valid')
        }
      })
    }

    const initWebrtc = async () => {
      openUserMedia()
      const checkMedia = setInterval(() => {
        if (localStream) {
          joinRoom()
          clearInterval(checkMedia)
        }
      }, 1000)
    }

    // chat related stuff
    const chats = ref([])
    const chatInput = ref('')

    const subscribeChat = () => {
      db.collection('meets')
        .doc(props.id)
        .collection('chats').orderBy('delivered_at', 'asc')
        .onSnapshot(snapshot => {
          chats.value = snapshot.docs.map(el => ({ id: el.id, ...el.data() }))
        })
    }

    const sendChat = () => {
      if (chatInput.value.length > 2) {
        db.collection('meets')
          .doc(props.id)
          .collection('chats').add({
            type: 'chat',
            sender: deviceId,
            sender_name: localStorage.getItem('userName'),
            content: chatInput.value,
            delivered_at: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            chatInput.value = ''
          })
      }
    }

    const setName = () => {
      loadingSetName.value = true
      localStorage.setItem('userName', inputName.value)
      userName = inputName.value
      setTimeout(() => {
        loadingSetName.value = false
        showSetNameDialog.value = false
        subscribeChat()
        initWebrtc()
      }, 2000)
    }

    onMounted(() => {
      if (userName) {
        subscribeChat()
        initWebrtc()
      } else {
        showSetNameDialog.value = true
      }
    })

    return {
      showSidebar,
      isMicrophoneActive,
      currentTab,
      chats,
      chatInput,
      sendChat,
      deviceId,
      formatTime,
      conferenceData,
      signalHangup,
      remoteStream,
      showSetNameDialog,
      loadingSetName,
      inputName,
      setName,

      icons: {
        mdiMenu,
        mdiClose,
        mdiMicrophone,
        mdiMicrophoneOff,
        mdiMessageOutline,
        mdiPhoneHangup,
        mdiMonitorScreenshot,
        mdiInformationOutline,
        mdiContentCopy,
        mdiSend,
        mdiFileUpload,
        mdiCheck,
      },
    }
  },
}
</script>

<style lang="scss">
.main {
  height: 90vh;
}

.video-top {
  height: calc(90vh - 56px);
}

.video-list {
  display: flex;
  flex-wrap: wrap-reverse;
  align-content: center;
  justify-content: center;
}

.aspect916 {
  aspect-ratio: 16 / 9 !important;
}

video {
  object-fit: cover !important;
  width: 100%;
  height: 100%;
}

.bottom {
  height: 56px;
  border-top: 1px solid #eee;
  z-index: 1;
}

.sidebar {
  width: 560px;
  border-left: 1px solid #eee;
}

.chat-input {
  position: absolute;
  bottom: 0;
  width: 100%;
  margin-bottom: 20px;
}

.chat-bubble {
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 8px;
}

video {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}
</style>
