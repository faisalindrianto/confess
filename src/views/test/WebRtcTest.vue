<template>
  <div>
    <div class="d-flex justify-space-between py-4 px-8 w-100 align-center">
      <h6 class="text-h5 font-weight-bold primary--text">
        confess
      </h6>
      <v-chip
        class="primary--text font-weight-medium white"
      >
        {{ roomCode }}
      </v-chip>
    </div>
    <v-card class="mx-8 main d-flex flex-column">
      <div class="d-flex video-top">
        <div class="w-100 d-flex flex-column align-center justify-center">
          <div
            :key="showSidebar"
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
              />
            </v-card>
            <v-card
              v-for="i in 1"
              :key="i + 11"
              :min-width="showSidebar ? '240px' : '500px'"
              max-width="500px"
              elevation="0"
              class="mr-2 mb-2 flex-grow-1 aspect916"
            >
              <video
                id="remoteStream"
                ref="remoteVideo"
                autoplay
              />
            </v-card>
          </div>
          {{ roomCode }}
        </div>
        <div
          v-if="showSidebar"
          class="sidebar"
        >
          <v-tabs
            v-model="currentTab"
            fixed-tabs
            class="rounded-tr"
          >
            <v-tab class="text-capitalize">
              Informasi
            </v-tab>
            <v-tab class="text-capitalize">
              Chat
            </v-tab>
            <v-tab class="text-capitalize">
              Dokumen
            </v-tab>
          </v-tabs>
        </div>
      </div>
      <div class="bottom pa-4 d-flex justify-space-between">
        <div>
          <v-icon>
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
  </div>
</template>

<script>
/* eslint-disable */
import { ref, onMounted, onUpdated } from '@vue/composition-api'
import {
  mdiMenu, mdiClose, mdiMicrophone, mdiMicrophoneOff, mdiInformationOutline,
  mdiMessageOutline, mdiPhoneHangup, mdiMonitorScreenshot,
} from '@mdi/js'
import short from 'short-uuid'
import { db } from '@/firebase'

export default {
  setup() {
    const meetCode = short.generate()
    const showSidebar = ref(false)
    const isMicrophoneActive = ref(true)
    const isCameraActive = ref(true)
    const currentTab = ref(0)
    const server = {
      iceServers: [
        {
          urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
      ],
      iceCandidatePoolSize: 10,
    }
    const peer = new RTCPeerConnection(server)
    let localStream = null
    let remoteStream = null
    const roomCode = ref('')
    const webcamVideo = ref(null)
    const remoteVideo = ref(null)
    const deviceId = localStorage.getItem('deviceId')

    const joinCall = async () => {
      const callDoc = db.collection('calls').doc(roomCode.value)
      const answerCandidates = callDoc.collection('answerCandidates')
      const offerCandidates = callDoc.collection('offerCandidates')

      peer.onicecandidate = event => {
        if (event.candidate) {
          answerCandidates.add(event.candidate.toJSON())
        }
      }

      const callData = (await callDoc.get()).data()

      const offerDescription = callData.offer
      await peer.setRemoteDescription(new RTCSessionDescription(offerDescription))

      const answerDescription = await peer.createAnswer()
      await peer.setLocalDescription(answerDescription)

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      }

      await callDoc.update({ answer })

      offerCandidates.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const data = change.doc.data()
            peer.addIceCandidate(new RTCIceCandidate(data))
          }
        })
      })
    }

    const createCall = async () => {
      // Reference Firestore collections for signaling
      const callDoc = db.collection('calls').doc()
      const offerCandidates = callDoc.collection('offerCandidates')
      const answerCandidates = callDoc.collection('answerCandidates')

      roomCode.value = callDoc.id

      // Get candidates for caller, save to db
      peer.onicecandidate = event => {
        if (event.candidate) {
          offerCandidates.add(event.candidate.toJSON())
        }
      }

      // Create offer
      const offerDescription = await peer.createOffer()
      await peer.setLocalDescription(offerDescription)

      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      }

      await callDoc.set({ offer })

      // Listen for remote answer
      callDoc.onSnapshot(snapshot => {
        const data = snapshot.data()
        if (!peer.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer)
          peer.setRemoteDescription(answerDescription)
        }
      })

      // When answered, add candidate to peer connection
      answerCandidates.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data())
            peer.addIceCandidate(candidate)
          }
        })
      })

      joinCall()
    }

    const startLocalStream = async () => {
      localStream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true })
      remoteStream = new MediaStream()

      localStream.getTracks().forEach(track => {
        peer.addTrack(track, localStream)
      })

      peer.ontrack = event => {
        event.streams[0].getTracks().forEach(track => {
          remoteStream.addTrack(track)
        })

        console.log(localStream)
        console.log(remoteStream)
      }

      webcamVideo.value[0].srcObject = localStream
      remoteVideo.value[0].srcObject = remoteStream
      console.log('dom', remoteVideo.value[0].srcObject)

      createCall()
    }

    onMounted(() => {
      startLocalStream()
    })

    onUpdated(() => {
      webcamVideo.value[0].srcObject = localStream
      remoteVideo.value[0].srcObject = remoteStream
    })

    return {
      showSidebar,
      isMicrophoneActive,
      isCameraActive,
      currentTab,
      startLocalStream,
      localStream,
      webcamVideo,
      remoteVideo,
      remoteStream,
      createCall,
      joinCall,
      roomCode,

      icons: {
        mdiMenu,
        mdiClose,
        mdiMicrophone,
        mdiMicrophoneOff,
        mdiMessageOutline,
        mdiPhoneHangup,
        mdiMonitorScreenshot,
        mdiInformationOutline,
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

.bottom {
  height: 56px;
  border-top: 1px solid #eee;
}

.sidebar {
  width: 560px;
  border-left: 1px solid #eee;
}

.aspect916 {
  aspect-ratio: 16 / 9 !important;
}

video {
  object-fit: cover !important;
  width: 100%;
  height: 100%;
}

#localStream {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}

</style>
