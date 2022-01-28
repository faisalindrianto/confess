<template>
  <div>
    <div class="d-flex justify-space-between py-4 px-8 w-100 align-center">
      <router-link
        class="text-decoration-none d-flex align-center"
        to="/"
      >
        <h6 class="text-h5 font-weight-bold primary--text mr-2">
          confess
        </h6>
        <v-chip
          v-if="teamMode"
          color="primary"
          small
        >
          Teams
        </v-chip>
      </router-link>
      <v-chip
        v-if="teamMode && teamConferenceDetail"
        class="primary--text font-weight-medium white"
      >
        {{ teamConferenceDetail.data().name }}
      </v-chip>
      <v-chip
        :color="teamMode ? 'primary' : null"
        class="font-weight-medium"
        :class="teamMode ? '' : 'white primary--text'"
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
        <div
          class="w-100 d-flex flex-column align-center justify-center"
          :class="screenState && showSidebar ? 'screen-state' : null"
        >
          <v-card
            v-if="screenState"
            :min-height="'60vh'"
            max-height="60vh"
            elevation="0"
            class="mr-2 mb-2 aspect916"
          >
            <div class="aspect916">
              <video
                id="contentStream"
                ref="contentStream"
                class="rounded-lg"
                autoplay
                muted
                playsinline
              />
              <div class="display-name">
                <span id="contentName" class="text-subtitle-2 primary--text"></span>
              </div>
            </div>
          </v-card>
          <div
            class="video-list pa-4"
            :class="screenState ? 'justify-start' : 'flex-wrap'"
          >
            <v-card
              :min-width="screenState ? '200px' : '500px'"
              :max-width="screenState ? '200px' : '500px'"
              elevation="0"
              class="mr-2 mb-2 flex-grow-1"
            >
              <div class="aspect916">
                <video
                  id="localStream"
                  ref="webcamVideo"
                  class="rounded-lg"
                  autoplay
                  muted
                  playsinline
                />
                <div class="display-name">
                  <span class="text-subtitle-2 primary--text">{{ userName }}</span>
                </div>
              </div>
            </v-card>
            <v-card
              v-for="stream in remoteStream"
              :key="stream.peerId"
              :min-width="screenState ? '200px' : '500px'"
              :max-width="screenState ? '200px' : '500px'"
              elevation="0"
              class="mr-2 mb-2 flex-grow-1"
            >
              <div class="aspect916">
                <video
                  :id="`stream-${stream.peerId}`"
                  ref="remoteVideo"
                  autoplay
                  playsinline
                  muted
                />
                <div class="display-name">
                  <span class="text-subtitle-2 primary--text">{{ findParticipants(stream.peerId).name }}</span>
                </div>
              </div>
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
                    v-for="i in participants"
                    :key="i.id"
                    outlined
                    class="pa-2 mb-2"
                  >
                    <div
                      v-if="teamMode"
                      class="d-flex align-center pa-2"
                    >
                      <v-avatar
                        size="40"
                        class="mr-3"
                      >
                        <v-img :src="i.userData.avatar"></v-img>
                      </v-avatar>
                      <div>
                        <div class="d-flex align-center">
                          <h5 class="mr-2">
                            {{ i.name }}
                          </h5>
                        </div>
                        <small>{{ i.userData.email }}</small>
                      </div>
                    </div>
                    <span
                      v-else
                      class="text-subtitle-2"
                    >{{ i.name }}</span>
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
                <perfect-scrollbar class="chat-list">
                  <div
                    v-for="chat in chats"
                    :key="chat.id"
                    class="d-flex flex-column"
                  >
                    <div
                      v-if="chat.type === 'chat'"
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
                    <div
                      v-else-if="chat.type === 'photo'"
                      class="d-flex flex-column chat-bubble"
                      :class="deviceId === chat.sender ? 'ml-auto text-right' : 'mr-auto'"
                    >
                      <v-img
                        max-width="280px"
                        contain
                        class="rounded-t rounded-b cursor-pointer"
                        :src="parseAttachment(chat.content).url"
                        @click="$refs.doc.show(parseAttachment(chat.content).meta.type, parseAttachment(chat.content))"
                      />
                    </div>
                    <div
                      v-else
                      class="d-flex flex-column chat-bubble"
                      :class="deviceId === chat.sender ? 'ml-auto text-right' : 'mr-auto'"
                    >
                      <v-card
                        width="240px"
                        elevation="0"
                        @click="$refs.doc.show(parseAttachment(chat.content).meta.type, parseAttachment(chat.content))"
                      >
                        <div class="d-flex align-center pa-2">
                          <v-avatar
                            size="40"
                            class="mr-3"
                            color="primary"
                          >
                            <v-icon
                              color="white"
                              size="28px"
                            >
                              {{ icons.mdiFileDocument }}
                            </v-icon>
                          </v-avatar>
                          <div class="text-left">
                            <div class="d-flex align-center">
                              <h5 class="text-truncate">
                                {{ parseAttachment(chat.content).meta.name }}
                              </h5>
                            </div>
                            <small>{{ getFileSize(parseAttachment(chat.content).meta.size) }}</small>
                          </div>
                          <v-icon
                            class="ml-auto mr-2"
                            color="grey lighten-3"
                            size="32px"
                          >
                            {{ icons.mdiDownloadCircleOutline }}
                          </v-icon>
                        </div>
                      </v-card>
                    </div>
                  </div>
                </perfect-scrollbar>
              </div>
              <div class="chat-input px-4">
                <v-form
                  @submit.prevent="sendChat()"
                >
                  <v-text-field
                    v-model="chatInput"
                    hide-details
                    solo
                    dense
                    placeholder="Kirim pesan..."
                    :readonly="attachment !== null"
                    :loading="loadingAttachment"
                  >
                    <template #append>
                      <v-btn
                        v-if="attachment !== null"
                        icon
                        @click="attachment = null; chatInput = ''"
                      >
                        <v-icon size="18px">
                          {{ icons.mdiCloseCircleOutline }}
                        </v-icon>
                      </v-btn>
                      <v-file-input
                        v-if="teamMode"
                        v-model="attachment"
                        hide-input
                        class="pa-0 ma-0 mb-2"
                        @change="chatInput = $event ? $event.name : ''"
                      />
                      <v-btn
                        color="primary"
                        elevation="0"
                        type="submit"
                        icon
                        :disabled="chatInput.length < 2"
                      >
                        <v-icon size="20px">
                          {{ icons.mdiSend }}
                        </v-icon>
                      </v-btn>
                    </template>
                  </v-text-field>
                </v-form>
              </div>
            </v-tab-item>
            <v-tab-item
              v-if="teamMode"
              class="h-full"
            >
              <div class="pa-4 d-flex flex-column">
                <span class="text-h6 mb-2">Dokumen</span>
                <span class="text-subtitle-2 text--disabled">Dokumen yang diunggah selama sesi berlangsung</span>
                <perfect-scrollbar class="chat-list mt-4">
                  <div
                    v-for="doc in documentList"
                    :key="doc.id"
                    class="mb-2"
                  >
                    <v-card
                      outlined
                      class="mr-2 ml-1"
                      @click="$refs.doc.show(doc.type, doc)"
                    >
                      <div class="d-flex align-center pa-2">
                        <v-avatar
                          size="40"
                          class="mr-4"
                          color="primary"
                        >
                          <v-icon
                            color="white"
                            size="28px"
                          >
                            {{ icons.mdiFileDocument }}
                          </v-icon>
                        </v-avatar>
                        <div>
                          <div class="d-flex align-center">
                            <h5 class="mr-2 text-truncate">
                              {{ doc.name }}
                            </h5>
                          </div>
                          <small>{{ getFileSize(doc.size) }}</small>
                        </div>
                      </div>
                    </v-card>
                  </div>
                </perfect-scrollbar>
              </div>
              <div class="chat-input px-4">
                <v-form
                  @submit.prevent
                >
                  <v-file-input
                    v-model="file"
                    solo
                    hide-details
                    placeholder="Unggah Dokumen"
                    :prepend-icon="null"
                    :append-icon="icons.mdiSend"
                    :loading="loadingAttachment"
                    @click:append="uploadAttachment(file); file = null"
                  />
                </v-form>
              </div>
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
                @click="muteAudio()"
              >
                <v-icon
                  dark
                >
                  {{ isMicrophoneActive ? icons.mdiMicrophone : icons.mdiMicrophoneOff }}
                </v-icon>
              </v-btn>
            </template>
            <span>Status Mikrofon : {{ isMicrophoneActive ? 'Aktif' : 'Tidak Aktif' }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                fab
                x-small
                :color="isCameraActive ? 'success' : 'secondary'"
                class="mx-2"
                v-bind="attrs"
                v-on="on"
                @click="toggleCamera()"
              >
                <v-icon
                  dark
                >
                  {{ isCameraActive ? icons.mdiVideoBox : icons.mdiVideoBoxOff }}
                </v-icon>
              </v-btn>
            </template>
            <span>Status Kamera : {{ isCameraActive ? 'Aktif' : 'Tidak Aktif' }}</span>
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
          <v-tooltip
            v-if="teamMode"
            top
          >
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
                :color="screenState ? 'success' : null"
                :disabled="disableScreenShare"
                @click="toggleScreenShare"
                v-on="on"
              >
                <v-icon>
                  {{ icons.mdiProjectorScreen }}
                </v-icon>
              </v-btn>
            </template>
            <span>{{ screenState ? 'Stop Bagikan Layar' : 'Bagikan Layar' }}</span>
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
                @click="showHangupConfirmation = true"
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
    <v-dialog
      v-model="showHangupConfirmation"
      max-width="500"
    >
      <v-card>
        <v-card-title class="text-h5">
          Keluar dari ruang konferensi?
        </v-card-title>

        <v-card-text>
          Konfirmasi jika kamu ingin keluar dari ruang ini.
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            class="text-capitalize"
            color="grey darken-1"
            text
            @click="showHangupConfirmation = false"
          >
            Batalkan
          </v-btn>

          <v-btn
            class="text-capitalize"
            color="primary"
            text
            @click="hangUp()"
          >
            Yakin
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <document-viewer ref="doc" />
  </div>
</template>

<script>
import Vue from 'vue'
import {
  ref, onMounted, onUnmounted, computed,
} from '@vue/composition-api'
import firebase from 'firebase/app'
import {
  mdiMenu, mdiClose, mdiMicrophone, mdiMicrophoneOff, mdiInformationOutline,
  mdiMessageOutline, mdiPhoneHangup, mdiProjectorScreen, mdiContentCopy,
  mdiSend, mdiFileUpload, mdiCheck, mdiVideoBox, mdiVideoBoxOff, mdiFileDocument,
  mdiDownloadCircleOutline, mdiCloseCircleOutline,

} from '@mdi/js'
import { PerfectScrollbar } from 'vue2-perfect-scrollbar'
import { format } from 'date-fns'
import { db } from '@/firebase'
import store from '@/store'
import router from '@/router'
import DocumentViewer from '@/components/misc/DocumentViewer.vue'
import preferCodec from './codec'

export default {
  components: {
    PerfectScrollbar,
    DocumentViewer,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    teamId: {
      type: String,
      default: null,
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
    const isCameraActive = ref(true)
    const currentTab = ref(0)
    const deviceId = localStorage.getItem('deviceId')
    const formatTime = date => format(date, 'HH:mm')
    const conferenceData = ref({})
    let meetRef = db.collection('meets').doc(props.id)
    let participantRef = db.collection('meets').doc(props.id).collection('participants')
    const userName = ref(localStorage.getItem('userName'))
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
    let captureStream = null
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
      await participantRef.doc(uid).set({
        name: userName.value,
        id: uid,
        display: 'user',
        userData: props.teamId ? JSON.parse(localStorage.getItem('userData')) : null,
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
      console.log('closing connection!', peerId)
      participantRef.where('id', '==', peerId).onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'removed') {
            if (change.doc.data().display === 'content') {
              console.log('remove the content later')
              disableScreenShare.value = false
              screenState.value = false
            }
            remoteStream.value = remoteStream.value.filter(el => el.peerId !== peerId)
            peerConnection.close()
          }
        })
      })

      // eslint-disable-next-line no-param-reassign
      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
          participantRef.doc(peerId).delete()
          peerConnection.close()
          remoteStream.value = remoteStream.value.filter(el => el.peerId !== peerId)
        }
      }
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

    const participants = ref([])
    const findParticipants = id => {
      const filter = participants.value.filter(el => el.id === id)

      if (filter.length) {
        return filter[0]
      }

      return ''
    }

    const receiveStream = (peerConnection, remoteEndpointID, isPeerContent) => {
      peerConnection.addEventListener('track', event => {
        if (!remoteStream.value.some(el => el.peerId === remoteEndpointID)) {
          console.log('got remote track', event)
          if (!isPeerContent) {
            remoteStream.value.push({
              peerId: remoteEndpointID,
              isPeerContent,
              src: event.streams[0],
              muted: false,
              name: 'Dummy',
            })
          }
          setTimeout(() => {
            console.log('receive peer content!', isPeerContent)
            if (isPeerContent) {
              document.querySelector('#contentStream').srcObject = new MediaStream()
              // eslint-disable-next-line prefer-destructuring
              document.querySelector('#contentStream').srcObject = event.streams[0]
              document.querySelector('#contentStream').autoplay = true
              document.querySelector('#contentStream').playsInline = true
              document.querySelector('#contentStream').muted = false
              document.querySelector('#contentName').innerText = findParticipants(remoteEndpointID).name
            } else {
              document.querySelector(`#stream-${remoteEndpointID}`).srcObject = new MediaStream()
              // eslint-disable-next-line prefer-destructuring
              document.querySelector(`#stream-${remoteEndpointID}`).srcObject = event.streams[0]
              document.querySelector(`#stream-${remoteEndpointID}`).autoplay = true
              document.querySelector(`#stream-${remoteEndpointID}`).playsInline = true
              document.querySelector(`#stream-${remoteEndpointID}`).muted = false
            }
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
      participantRef.get().then(snapshot => {
        snapshot.docs.forEach(async doc => {
          const peerId = doc.id
          const isPeerContent = doc.data().display === 'content'

          if (peerId !== uid && peerId !== Id) {
            if (isPeerContent) {
              disableScreenShare.value = true
              screenState.value = true
            }

            await peerRequestConnection(peerId, Id, isContent, isPeerContent)
          }
        })
      })
    }

    const signalHangup = () => {
      participantRef.doc(uid).delete()
      if (screenState.value) {
        participantRef.doc(contentId.value).delete()
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
              disableScreenShare.value = true
              screenState.value = true
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
          router.replace({ name: 'home' })
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
    const attachment = ref(null)
    const file = ref(null)

    const subscribeChat = () => {
      meetRef
        .collection('chats').orderBy('delivered_at', 'asc')
        .onSnapshot(snapshot => {
          chats.value = snapshot.docs.map(el => ({ id: el.id, ...el.data() }))
        })
    }

    const loadingAttachment = ref(false)

    const uploadAttachment = async attach => new Promise((resolve, reject) => {
      loadingAttachment.value = true
      store.dispatch('uploadDocument', {
        team_id: props.teamId,
        conf_id: props.id,
        file: attach,
      }).then(result => {
        loadingAttachment.value = false
        resolve(result)
      }).catch(err => {
        reject(err)
        loadingAttachment.value = false
      })
    })

    const sendChat = async () => {
      if (chatInput.value.length > 2) {
        const payload = {
          type: 'chat',
          sender: deviceId,
          sender_name: userName.value,
          content: chatInput.value,
          delivered_at: firebase.firestore.FieldValue.serverTimestamp(),
        }

        if (attachment.value) {
          if (attachment.value.type.includes('image')) {
            payload.type = 'photo'
          } else {
            payload.type = 'document'
          }
          await uploadAttachment(attachment.value).then(data => {
            payload.content = JSON.stringify({
              url: data.url,
              meta: data.meta,
            })
          })
        }

        meetRef
          .collection('chats').add(payload)
          .then(() => {
            attachment.value = null
            chatInput.value = ''
          })
      }
    }

    const parseAttachment = json => JSON.parse(json)
    const getFileSize = size => {
      const mb = Math.round((size / 1000000) * 100) / 100
      if (mb < 1) {
        const kb = Math.round((mb * 1000) * 100) / 100

        return `${kb} kb`
      }

      return `${mb} mb`
    }
    const openDocument = document => {
      window.open(document, '_blank').focus()
    }

    const documentInput = ref('')
    const documentList = ref([])
    const subscribeDocs = () => {
      db.collection('teams').doc(props.teamId)
        .collection('documents').where('conf_id', '==', props.id)
        .orderBy('uploaded_at', 'asc')
        .onSnapshot(snapshot => {
          documentList.value = snapshot.docs.map(el => ({ id: el.id, ...el.data() }))
        })
    }

    const subscribeParticipants = () => {
      participantRef.onSnapshot(snapshot => {
        participants.value = snapshot.docs.map(el => ({ id: el.id, ...el.data() }))
      })
    }

    const setName = () => {
      loadingSetName.value = true
      localStorage.setItem('userName', inputName.value)
      userName.value = inputName.value
      setTimeout(() => {
        loadingSetName.value = false
        showSetNameDialog.value = false
        subscribeChat()
        subscribeParticipants()
        initWebrtc()
      }, 2000)
    }

    const muteAudio = () => {
      isMicrophoneActive.value = !isMicrophoneActive.value
      localStream.getAudioTracks()[0].enabled = isMicrophoneActive.value
    }

    const toggleCamera = () => {
      isCameraActive.value = !isCameraActive.value
      localStream.getVideoTracks()[0].enabled = isCameraActive.value
    }

    const signalContentShare = async () => {
      contentId.value = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      console.log('content id', contentId.value)
      participantRef.doc(contentId.value).set({
        name: userName.value,
        id: contentId.value,
        display: 'content',
      })
      requestConnectionToCurrentPeers(contentId.value, true)
      acceptConnectionsFromJoiningPeers(contentId.value, true)
    }

    const stopCapture = stream => {
      const tracks = stream.getTracks()

      tracks.forEach(track => track.stop())

      // eslint-disable-next-line no-param-reassign
      stream = null
    }

    const toggleScreenOff = async () => {
      participantRef.doc(contentId.value).delete()
      screenState.value = false
      stopCapture(captureStream)

      document.querySelector('#localStream').srcObject = localStream
    }

    const toggleScreenShare = async () => {
      if (!screenState.value) {
        captureStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
          },
          audio: true,
        })

        signalContentShare()
        screenState.value = true
        captureStream.getVideoTracks()[0].onended = () => {
          toggleScreenOff()
        }
        setTimeout(() => {
          document.querySelector('#contentStream').srcObject = captureStream
          document.querySelector('#contentName').innerText = userName.value
        }, 200)
      } else {
        toggleScreenOff()
      }
    }

    const showHangupConfirmation = ref(false)
    const hangUp = () => {
      participantRef.doc(uid).delete().then(() => {
        const tracks = localStream.getTracks()
        tracks.forEach(track => {
          track.stop()
        })
        if (screenState.value) {
          participantRef.doc(contentId.value).delete()
        }
        router.replace({ name: 'home' })
      })
    }

    const teamConferenceDetail = ref(null)
    const teamMode = computed(() => props.teamId !== null)

    onMounted(async () => {
      if (props.teamId) {
        meetRef = db.collection('teams').doc(props.teamId).collection('conferences').doc(props.id)
        participantRef = db.collection('teams').doc(props.teamId).collection('conferences').doc(props.id)
          .collection('joined')
        teamConferenceDetail.value = await meetRef.get()
        subscribeChat()
        subscribeDocs()
        subscribeParticipants()
        initWebrtc()
      } else {
        // eslint-disable-next-line no-lonely-if
        if (userName.value) {
          subscribeChat()
          subscribeParticipants()
          initWebrtc()
        } else {
          showSetNameDialog.value = true
        }
      }
    })

    onUnmounted(() => {
      hangUp()
    })

    return {
      userName,
      showSidebar,
      isMicrophoneActive,
      currentTab,
      chats,
      chatInput,
      attachment,
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
      muteAudio,
      isCameraActive,
      toggleCamera,
      documentList,
      subscribeDocs,
      documentInput,
      showHangupConfirmation,
      hangUp,
      findParticipants,
      disableScreenShare,
      toggleScreenShare,
      screenState,
      participants,
      teamConferenceDetail,
      teamMode,
      loadingAttachment,
      uploadAttachment,
      file,
      parseAttachment,
      getFileSize,
      openDocument,

      icons: {
        mdiMenu,
        mdiClose,
        mdiMicrophone,
        mdiMicrophoneOff,
        mdiMessageOutline,
        mdiPhoneHangup,
        mdiProjectorScreen,
        mdiInformationOutline,
        mdiContentCopy,
        mdiSend,
        mdiFileUpload,
        mdiCheck,
        mdiVideoBox,
        mdiVideoBoxOff,
        mdiFileDocument,
        mdiDownloadCircleOutline,
        mdiCloseCircleOutline,
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
  max-width: 100%;
  display: flex;
  justify-content: center;
  overflow-x: auto;
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

.chat-list {
  max-height: calc(90vh - 180px) !important;
}

.chat-bubble {
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 8px;
}

// video {
//   -webkit-transform: scaleX(-1);
//   transform: scaleX(-1);
// }

.display-name {
  background: white;
  padding: 2px 4px;
  border-radius: 4px;
  position: absolute;
  bottom: 8px;
  right: 8px;
}

.v-application--is-ltr .v-input__prepend-outer {
  margin-right: 0px !important;
}

.screen-state {
  max-width: calc(100% - 440px) !important;
}
</style>
