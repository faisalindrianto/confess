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
        class="ml-2"
        outlined
        @click="$refs.updateProfile.show()"
      >
        Update Profile
      </v-btn>
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
                  class="mt-2 mr-2"
                  @click="showCreateTeam = true"
                >
                  Buat Tim Baru
                </v-btn>
                <v-btn
                  class="mt-2 join-btn"
                  outlined
                  dark
                  @click="showJoinTeam = true"
                >
                  Gabung Tim
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
            v-for="team in teamList"
            :key="team.id"
            cols="12"
            lg="4"
            md="6"
          >
            <v-hover #default="{ hover }">
              <v-card>
                <v-card-text>
                  <div class="d-flex justify-space-between align-center">
                    <router-link
                      :to="{ name: 'teams-detail', params: { id: team.id } }"
                      class="text-decoration-none"
                    >
                      <h2 class="font-weight-bold mb-2 primary--text">
                        {{ team.name }}
                      </h2>
                    </router-link>
                    <v-menu
                      bottom
                      left
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-slide-x-reverse-transition
                          mode="out-in"
                        >
                          <v-icon
                            v-show="hover"
                            size="20px"
                            v-bind="attrs"
                            v-on="on"
                          >
                            {{ icons.mdiDotsVertical }}
                          </v-icon>
                        </v-slide-x-reverse-transition>
                      </template>
                      <v-list>
                        <v-list-item
                          v-if="isMyTeam(team.host)"
                          @click="editTeam(team)"
                        >
                          Edit Tim
                        </v-list-item>
                        <v-list-item
                          v-if="isMyTeam(team.host)"
                          @click="$refs.deleteTeam.show(team)"
                        >
                          Hapus Tim
                        </v-list-item>
                        <v-list-item
                          v-if="!isMyTeam(team.host)"
                          @click="$refs.leaveTeam.show(team)"
                        >
                          Keluar Dari Tim
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                  <span>
                    {{ team.description }}
                  </span>
                  <div
                    class="v-avatar-group mt-2"
                    :class="rootThemeClasses"
                  >
                    <v-tooltip
                      v-for="member in team.members"
                      :key="member.uid"
                      top
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-avatar
                          v-bind="attrs"
                          size="36"
                          v-on="on"
                        >
                          <v-img :src="member.avatar"></v-img>
                        </v-avatar>
                      </template>
                      <span>{{ member.name }}</span>
                    </v-tooltip>
                  </div>
                  <v-card
                    v-if="team.latest_schedule"
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
                        <h5>{{ team.latest_schedule.name }}</h5>
                        <small>{{ formatDateId(team.latest_schedule.start_date) }} • {{ team.latest_schedule.start_time }} - {{ team.latest_schedule.end_time }} </small>
                      </div>
                    </div>
                  </v-card>
                  <v-card
                    v-else
                    outlined
                    class="mt-4"
                    min-height="32px"
                  >
                    <v-card-text class="py-4">
                      Tidak Ada Jadwal Meeting
                    </v-card-text>
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

      <v-bottom-sheet
        v-model="showEdit"
        max-width="600px"
      >
        <v-card>
          <v-card-title class="font-weight-bold my-4">
            Edit Tim
          </v-card-title>
          <create-team
            edit-mode
            :team-id="editData.id"
            :value="{
              teamName: editData.teamName,
              teamDescription: editData.teamDescription,
            }"
            @updated="$store.dispatch('initApp'); showEdit = false"
          />
        </v-card>
      </v-bottom-sheet>

      <v-bottom-sheet
        v-model="showJoinTeam"
        max-width="600px"
      >
        <v-card>
          <v-card-title class="font-weight-bold">
            Gabung Tim
          </v-card-title>
          <v-card-text>
            Gabung ke tim yang sudah dibuat teman dengan menginputkan kode di bawah. Minta kode akses ke teman jika belum punya kode.
          </v-card-text>
          <join-team />
        </v-card>
      </v-bottom-sheet>

      <logout ref="logout" />
      <leave-team ref="leaveTeam" />
      <delete-team ref="deleteTeam" />
      <update-profile ref="updateProfile" />
    </v-main>
  </v-app>
</template>

<script>
import { ref, computed } from '@vue/composition-api'
import Lottie from 'vue-lottie'
import { mdiDotsVertical, mdiMessageVideo } from '@mdi/js'
import { createHelpers } from 'vuex-map-fields'
import { formatDateId } from '@core/utils/filter'
import useVuetify from '@core/utils/vuetify'
import teamslottie from '@/assets/images/lottie/teams.json'
import Logout from '@/components/Logout.vue'
import UpdateProfile from '@/components/UpdateProfile.vue'
import LeaveTeam from '@/views/teams/LeaveTeam.vue'
import DeleteTeam from '@/views/teams/DeleteTeam.vue'
import CreateTeam from '@/components/forms/CreateTeam.vue'
import JoinTeam from '@/components/forms/JoinTeam.vue'
import store from '@/store'

const { mapFields: mapTeamFields } = createHelpers({
  getterType: 'getTeamFields',
  mutationType: 'updateTeamFields',
})

export default {
  components: {
    Lottie,
    Logout,
    CreateTeam,
    JoinTeam,
    LeaveTeam,
    DeleteTeam,
    UpdateProfile,
  },
  computed: {
    ...mapTeamFields(['teamList']),
  },
  setup() {
    const { rootThemeClasses } = useVuetify()
    const showCreateTeam = ref(false)
    const showJoinTeam = ref(false)
    const userData = computed(() => store.state.user.userData)
    const isMyTeam = host => {
      if (host === userData.value.uid) return true

      return false
    }
    const editData = ref({
      id: '',
      teamName: '',
      teamDescription: '',
    })
    const showEdit = ref(false)

    const editTeam = teamDetails => {
      editData.value = {
        id: teamDetails.id,
        teamName: teamDetails.name,
        teamDescription: teamDetails.description,
      }
      console.log(editData.value)
      showEdit.value = true
    }

    return {
      teamslottie,
      rootThemeClasses,
      showCreateTeam,
      showJoinTeam,
      isMyTeam,
      editData,
      showEdit,
      editTeam,
      formatDateId,

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

.join-btn {
  color: #fff !important;
  border-width: 2px !important;
}
</style>
