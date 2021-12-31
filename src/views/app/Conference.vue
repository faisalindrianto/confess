<template>
  <div>
    <div class="d-flex justify-space-between py-4 px-8 w-100 align-center">
      <h6 class="text-h5 font-weight-bold primary--text">
        confess
      </h6>
      <v-chip
        class="primary--text font-weight-medium white"
      >
        dev-ind-212
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
              v-for="i in 6"
              :key="i"
              :min-width="showSidebar ? '240px' : '500px'"
              max-width="500px"
              outlined
              class="mr-2 mb-2 flex-grow-1"
            >
              <v-responsive :aspect-ratio="16/9">
                <div class="d-flex align-center h-100 w-100 justify-center">
                  <v-avatar size="48">
                    <v-img src="@/assets/images/avatars/1.png"></v-img>
                  </v-avatar>
                </div>
              </v-responsive>
            </v-card>
          </div>
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
                @click="currentTab = 1"
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
import { ref } from '@vue/composition-api'
import {
  mdiMenu, mdiClose, mdiMicrophone, mdiMicrophoneOff, mdiInformationOutline,
  mdiMessageOutline, mdiPhoneHangup, mdiMonitorScreenshot,
} from '@mdi/js'

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup() {
    const showSidebar = ref(true)
    const isMicrophoneActive = ref(true)
    const currentTab = ref(0)

    return {
      showSidebar,
      isMicrophoneActive,
      currentTab,

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
</style>
