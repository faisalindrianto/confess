<template>
  <div class="home">
    <v-row>
      <v-col
        cols="12"
        md="7"
        class="home-left d-flex flex-column justify-center"
      >
        <v-img
          max-height="40vh"
          max-width="420px"
          contain
          position="left"
          :src="require('@/assets/images/svg/home-video.svg')"
        ></v-img>
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
              lg="6"
            >
              <v-btn
                block
                color="primary"
                class="text-capitalize py-5 mb-4"
              >
                Confess Sekarang
              </v-btn>
              <v-text-field
                dense
                placeholder="Input Kode Ruang"
                outlined
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>
        </div>
      </v-col>
      <v-col
        cols="12"
        md="5"
        class="home-right"
      >
        <v-card
          class="team-card d-flex flex-column justify-space-between"
          elevation="0"
        >
          <v-img
            :src="require('@/assets/images/confess-logo-home.svg')"
            width="40%"
            max-height="90px"
            contain
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
                        @click="confessTeamTab = 1"
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
                        @click="confessTeamTab = 2"
                      >
                        Gabung Tim
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-btn
                    block
                    color="light"
                    class="text-capitalize font-weight-medium primary--text py-5"
                    @click="googleSignIn()"
                  >
                    Sudah Punya Tim?
                  </v-btn>
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
                <v-card-text class="text-body-1">
                  Form Buat Tim
                </v-card-text>
                <div class="px-4 py-4">
                  <v-btn
                    block
                    color="primary"
                    class="text-capitalize py-5"
                    @click="testFirebase()"
                  >
                    Buat Tim
                  </v-btn>
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
                  Gabung Tim
                </v-card-text>
                <v-card-text class="text-body-1">
                  Form Gabung Tim
                </v-card-text>
                <div class="px-4 py-4">
                  <v-btn
                    block
                    color="primary"
                    class="text-capitalize py-5"
                  >
                    Gabung Tim
                  </v-btn>
                </div>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { ref } from '@vue/composition-api'
import { mdiArrowLeft } from '@mdi/js'
import { db } from '@/firebase'
import store from '@/store'

export default {
  setup() {
    const confessTeamTab = ref(0)

    const testFirebase = () => {
      db.collection('test').doc('hello').set({
        field: 'this is a test',
      }).then(data => {
        console.log('success', data)
      })
    }

    const googleSignIn = () => {
      store.dispatch('signInWithGoogle').then(() => {
        /*
          check if user is exist or not
          if exist then sign in and set user state
          if doesn't exist then sign up and set user state
        */
        // db.collection('users').where('email', '==', 'wwf051099@gmail.com').get().then(users => {
        //   console.log(users)
        // if (!users.empty) {

        // } else {
        //   state.dispatch('signUp', {
        //     avatar: '',
        //     created_at: '',
        //     email: '',
        //     last_login: '',
        //     name: '',
        //   })
        // }
        // })
      })
    }

    return {
      confessTeamTab,
      testFirebase,
      googleSignIn,
      icons: {
        mdiArrowLeft,
      },
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
