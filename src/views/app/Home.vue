<template>
  <div class="home">
    <v-row>
      <v-col
        cols="12"
        lg="7"
        class="home-left d-flex flex-column justify-center"
      >
        <Lottie
          :options="{
            animationData: homelottie,
          }"
          style="max-width: 460px; height: 40vh; margin: 0"
        />
        <div>
          <h1
            class="mt-10 text--primary"
          >
            Konferensi Dengan Confess
          </h1>
          <p class="mt-2">
            Buat video conference dengan mudah melalui Confess.
          </p>
          <v-row class="mt-2">
            <v-col
              cols="12"
              md="8"
            >
              <v-btn
                block
                color="primary"
                class="text-capitalize py-5 mb-4"
                :loading="loading"
                @click="createConference()"
              >
                Confess Sekarang
              </v-btn>
              <v-form
                ref="confForm"
                lazy-validation
                @submit.prevent="joinConf()"
              >
                <v-text-field
                  v-model="confCode"
                  dense
                  placeholder="Input Kode Ruang"
                  outlined
                  hide-details
                  :append-icon="confCode.length > 3 ? icons.mdiCheck : ''"
                  :rules="[required]"
                  :loading="confLoading"
                  @click:append="joinConf()"
                ></v-text-field>
              </v-form>
            </v-col>
          </v-row>
        </div>
      </v-col>
      <v-col
        cols="12"
        lg="5"
        class="home-right"
      >
        <v-card
          class="team-card d-flex flex-column justify-space-between"
          elevation="0"
        >
          <v-img
            :src="require('@/assets/images/confess-logo-home.svg')"
            width="40%"
            max-height="120px"
            contain
            position="right"
            class="ms-auto"
          ></v-img>
          <v-tabs-items
            v-model="confessTeamTab"
            class="transparent"
          >
            <v-tab-item>
              <v-card>
                <v-card-text class="text-h5 font-weight-medium primary--text">
                  <span class="font-weight-bold">Confess</span> Bersama Tim
                </v-card-text>
                <v-card-text class="text-body-1">
                  Atur dan buat jadwal conference bersama tim dengan mudah menggunakan <span class="font-weight-bold">Confess Teams</span>.
                </v-card-text>
                <div class="px-4 py-4">
                  <v-row class="mb-2">
                    <v-col
                      cols="6"
                      class="pr-25"
                    >
                      <v-btn
                        block
                        color="primary"
                        class="text-capitalize py-5"
                        @click="signIn(1)"
                      >
                        Buat Tim
                      </v-btn>
                    </v-col>
                    <v-col
                      cols="6"
                      class="pl-25"
                    >
                      <v-btn
                        block
                        outlined
                        color="primary"
                        class="text-capitalize py-5"
                        @click="signIn(2)"
                      >
                        Gabung Tim
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-btn
                    block
                    color="light"
                    class="text-capitalize font-weight-medium primary--text py-5"
                    @click="signIn(3)"
                  >
                    {{ isAuthenticated ? 'Masuk ke Dashboard' : 'Sudah Punya Tim?' }}
                  </v-btn>
                  <h6
                    v-if="isAuthenticated"
                    class="mt-6 text-center font-weight-medium"
                  >
                    Terlogin sebagai {{ userData.email }}. <span
                      class="primary--text cursor-pointer"
                      @click="$refs.logout.show()"
                    >Logout?</span>
                  </h6>
                </div>
              </v-card>
            </v-tab-item>
            <v-tab-item>
              <v-card>
                <v-card-text class="text-h6 font-weight-bold primary--text">
                  <v-icon
                    class="cursor-pointer mb-1"
                    @click="confessTeamTab = 0"
                  >
                    {{ icons.mdiArrowLeft }}
                  </v-icon>
                  Buat Tim
                </v-card-text>
                <v-card-text>
                  Buat tim dengan mengisi form di bawah ini, nama tim dan deskripsi bisa diubah nanti jika perlu.
                </v-card-text>
                <create-team />
              </v-card>
            </v-tab-item>
            <v-tab-item>
              <v-card>
                <v-card-text class="text-h6 font-weight-bold primary--text">
                  <v-icon
                    class="cursor-pointer mb-1"
                    @click="confessTeamTab = 0"
                  >
                    {{ icons.mdiArrowLeft }}
                  </v-icon>
                  Gabung Tim
                </v-card-text>
                <v-card-text>
                  Gabung ke tim yang sudah dibuat teman dengan menginputkan kode di bawah. Minta kode akses ke teman jika belum punya kode.
                </v-card-text>
                <join-team />
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-col>
    </v-row>

    <logout ref="logout" />

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
              v-model="userName"
              dense
              placeholder="Input Nama"
              outlined
              hide-details
              :append-icon="userName.length > 3 ? icons.mdiCheck : ''"
              :rules="[required]"
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
import { ref, computed } from '@vue/composition-api'
import { mdiArrowLeft, mdiCheck } from '@mdi/js'
import firebase from 'firebase/app'
import Lottie from 'vue-lottie'
import { required } from '@core/utils/validation'
import { useRouter } from '@core/utils'
import { db } from '@/firebase'
import store from '@/store'
import homelottie from '@/assets/images/lottie/home.json'
import Logout from '@/components/Logout.vue'
import CreateTeam from '@/components/forms/CreateTeam.vue'
import JoinTeam from '@/components/forms/JoinTeam.vue'

export default {
  components: {
    Lottie,
    Logout,
    CreateTeam,
    JoinTeam,
  },
  setup() {
    const confessTeamTab = ref(0)
    const { router } = useRouter()
    const isAuthenticated = computed(() => store.state.user.isAuthenticated)
    const userData = computed(() => store.state.user.userData)
    const loading = computed(() => store.state.webrtc.loadingMeeting)
    const teamData = ref({
      teamCode: '',
    })
    const confCode = ref('')
    const confForm = ref(null)
    const confLoading = ref(false)
    const showSetNameDialog = ref(false)
    const saveRoute = ref('')
    const userName = ref('')
    const loadingSetName = ref(false)

    const signIn = nextRoute => {
      const routeList = {
        1: () => {
          confessTeamTab.value = 1
        },
        2: () => {
          confessTeamTab.value = 2
        },
        3: () => {
          router.push('/teams')
        },
      }

      if (!isAuthenticated.value) {
        store.dispatch('signInWithGoogle').then(data => {
          db.collection('users').where('email', '==', data.additionalUserInfo.profile.email).get().then(async users => {
            if (!users.empty) {
              await store.dispatch('signIn', users.docs[0].id)
            } else {
              await store.dispatch('signUp', {
                avatar: data.additionalUserInfo.profile.picture,
                created_at: firebase.firestore.FieldValue.serverTimestamp(),
                email: data.additionalUserInfo.profile.email,
                last_login: firebase.firestore.FieldValue.serverTimestamp(),
                name: data.additionalUserInfo.profile.name,
              })
            }

            routeList[nextRoute]()
          })
        }).catch(err => {
          console.log('gagal!', err)
        })
      } else {
        routeList[nextRoute]()
      }
    }

    const createConference = () => {
      if (localStorage.getItem('userName')) {
        store.dispatch('createMeting').then(code => {
          router.push({ name: 'con', params: { id: code } })
        })
      } else {
        saveRoute.value = 'create'
        showSetNameDialog.value = true
      }
    }

    const joinConf = () => {
      if (localStorage.getItem('userName')) {
        if (confForm.value.validate()) {
          confLoading.value = true
          setTimeout(() => {
            router.push({ name: 'con', params: { id: confCode.value } })
            confLoading.value = false
          }, 5000)
        }
      } else {
        saveRoute.value = 'join'
        showSetNameDialog.value = true
      }
    }

    const setName = () => {
      loadingSetName.value = true
      localStorage.setItem('userName', userName.value)
      setTimeout(() => {
        loadingSetName.value = false
        showSetNameDialog.value = false
        if (saveRoute.value === 'create') {
          createConference()
        } else if (saveRoute.value === 'join') {
          joinConf()
        }
      }, 2000)
    }

    return {
      confessTeamTab,
      teamData,
      homelottie,
      isAuthenticated,
      userData,
      confCode,
      icons: {
        mdiArrowLeft,
        mdiCheck,
      },
      required,
      joinConf,
      confForm,
      confLoading,
      loading,
      showSetNameDialog,
      saveRoute,
      userName,
      loadingSetName,
      setName,

      signIn,
      createConference,
    }
  },
}
</script>

<style lang="scss">
.home {
  background: #ffffff !important;
  height: 100%;
  min-height: 100vh;
}

.home-left {
  height: 100vh;
  padding: 48px;

  .v-image .v-responsive {
    flex: 0 0 auto !important;
  }
}

@media (min-width: 960px) {
  .home-left {
    padding: 0 120px;
  }
}

.home-right {
  padding: 48px;
  height: 100vh;

  .team-card {
    padding: 24px;
    height: 100%;
    background: url('../../assets/images/home-bg.png') !important;
    background-repeat: no-repeat !important;
    background-size: cover !important;
    background-position: right;
  }
}
</style>
