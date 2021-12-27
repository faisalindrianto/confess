<template>
  <v-app>
    <v-app-bar
      app
      class="px-8"
    >
      <div class="d-flex align-center">
        <v-toolbar-title class="mr-2 font-weight-bold">
          <router-link
            class="text-decoration-none"
            to="/"
          >
            Confess
          </router-link>
        </v-toolbar-title>
        <v-chip
          color="primary"
          small
        >
          Teams
        </v-chip>
      </div>
      <v-spacer />
      <v-btn
        class="ml-4"
        outlined
        @click="$refs.logout.show()"
      >
        Logout
      </v-btn>
    </v-app-bar>
    <v-main class="grey lighten-2">
      <v-container>
        <v-card
          class="mb-8 welcome-card"
        >
          <div class="d-flex justify-space-between">
            <div
              class="mt-8"
            >
              <v-card-text
                class="text-h4 font-weight-bold white--text"
              >
                Selamat Datang!
              </v-card-text>
              <v-card-text
                class="white--text text-h6 font-weight-medium"
              >
                Kolaborasi dan jadwalkan telekonferensi dengan Confess Teams!
              </v-card-text>
              <v-card-text>
                <v-btn
                  class="mt-2"
                  @click="showCreateTeam = true"
                >
                  Buat Tim Baru
                </v-btn>
              </v-card-text>
            </div>
            <Lottie
              class="d-none d-md-block"
              :options="{
                animationData: teamslottie,
              }"
              style="max-width: 460px; height: 200px; margin: 0"
            />
          </div>
        </v-card>
        <v-row>
          <v-col
            v-for="i in 6"
            :key="i"
            cols="12"
            lg="4"
            md="6"
          >
            <v-hover #default="{ hover }">
              <v-card>
                <v-card-text>
                  <div class="d-flex justify-space-between align-center">
                    <router-link
                      :to="{ name: 'teams-detail', params: { id: 'idteam' } }"
                      class="text-decoration-none"
                    >
                      <h2 class="font-weight-bold mb-2 primary--text">
                        Team {{ i + 1 }}
                      </h2>
                    </router-link>
                    <v-slide-x-reverse-transition
                      mode="out-in"
                    >
                      <v-icon
                        v-if="hover"
                        size="20px"
                      >
                        {{ icons.mdiDotsVertical }}
                      </v-icon>
                    </v-slide-x-reverse-transition>
                  </div>
                  <span>
                    Deskripsi Tim Yang Panjang Sekali
                  </span>
                  <div
                    class="v-avatar-group mt-2"
                    :class="rootThemeClasses"
                  >
                    <v-avatar size="36">
                      <v-img src="@/assets/images/avatars/1.png"></v-img>
                    </v-avatar>
                    <v-avatar size="36">
                      <v-img src="@/assets/images/avatars/2.png"></v-img>
                    </v-avatar>
                    <v-avatar size="36">
                      <v-img src="@/assets/images/avatars/3.png"></v-img>
                    </v-avatar>
                  </div>
                  <v-card
                    elevation="0"
                    outlined
                    class="mt-4 pa-2"
                  >
                    <div class="d-flex align-center">
                      <v-icon
                        class="mr-4 ml-2"
                        color="primary"
                        size="28px"
                      >
                        {{ icons.mdiMessageVideo }}
                      </v-icon>
                      <div>
                        <h5>Meeting Siji</h5>
                        <small>Deskripsi Meeting</small>
                      </div>
                    </div>
                  </v-card>
                </v-card-text>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </v-container>

      <v-bottom-sheet
        v-model="showCreateTeam"
        max-width="600px"
      >
        <v-card>
          <v-card-title class="font-weight-bold">
            Buat Tim
          </v-card-title>
          <v-card-text>
            Pak yanto main ke Jatim, yuk kolaborasi dengan Confess Teams.
          </v-card-text>
          <create-team />
        </v-card>
      </v-bottom-sheet>

      <logout ref="logout" />
    </v-main>
  </v-app>
</template>

<script>
import { ref, computed } from '@vue/composition-api'
import Lottie from 'vue-lottie'
import { mdiDotsVertical, mdiMessageVideo } from '@mdi/js'
import firebase from 'firebase/app'
import useVuetify from '@core/utils/vuetify'
import store from '@/store'
import teamslottie from '@/assets/images/lottie/teams.json'
import Logout from '@/components/Logout.vue'
import CreateTeam from '@/components/forms/CreateTeam.vue'

export default {
  components: {
    Lottie,
    Logout,
    CreateTeam,
  },
  setup() {
    const userData = computed(() => store.state.user.userData)
    const { rootThemeClasses } = useVuetify()
    const teamData = {
      teamName: '',
      teamDescription: '',
    }
    const showCreateTeam = ref(false)

    const createTeam = () => {
      if (teamData.value.teamName) {
        store.dispatch('createTeam', {
          avatar: 'default.png',
          created_at: firebase.firestore.FieldValue.serverTimestamp(),
          description: teamData.value.teamDescription,
          host: userData.value.uid,
          name: teamData.value.teamName,
        }).then(data => {
          console.log('success', data)
        })
      } else {
        console.log('not valid')
      }
    }

    return {
      teamslottie,
      rootThemeClasses,
      teamData,
      showCreateTeam,
      createTeam,

      icons: {
        mdiDotsVertical,
        mdiMessageVideo,
      },
    }
  },
}
</script>

<style>
.welcome-card {
  background: url('../../assets/images/home-bg.png') !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
  background-position: right;
}
</style>
