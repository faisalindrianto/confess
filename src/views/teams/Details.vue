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
            to="/teams"
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
    <v-main class="grey lighten-3">
      <div
        v-if="loadingDetails"
        class="d-flex align-center justify-center h-100"
      >
        <v-progress-circular
          indeterminate
          size="48"
          color="primary"
        ></v-progress-circular>
      </div>
      <v-container v-else>
        <v-card
          v-if="teamDetails.name"
          class="mb-8"
        >
          <div class="d-flex justify-space-between">
            <div>
              <v-card-title class="font-weight-bold">
                <span class="primary--text">{{ teamDetails.name }}</span>
              </v-card-title>
              <v-card-text>
                {{ teamDetails.description }}
              </v-card-text>
              <v-card-text>
                <small>Dibuat oleh : {{ teamDetails.host.name }}</small>
              </v-card-text>
            </div>
            <div class="d-flex flex-column pa-4">
              <span class="mb-2 text-body-2 text-right">Kode Tim : <b>{{ id }}</b></span>
              <v-btn
                color="primary"
                outlined
                rounded
                @click="copyLink()"
              >
                Salin Kode Tim
              </v-btn>
            </div>
          </div>
        </v-card>
        <v-row>
          <v-col
            cols="3"
            lg="2"
          >
            <v-sheet rounded="lg">
              <v-list rounded>
                <v-list-item-group
                  v-model="currentTab"
                  color="primary"
                >
                  <v-list-item
                    link
                    active
                  >
                    <v-list-item-content>
                      <v-list-item-title>
                        Konferensi
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item
                    link
                  >
                    <v-list-item-content>
                      <v-list-item-title>
                        Dokumen
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item
                    link
                  >
                    <v-list-item-content>
                      <v-list-item-title>
                        Anggota
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
                <v-divider class="my-2" />
                <v-list-item
                  v-if="teamDetails.host && isMyTeam(teamDetails.host.uid)"
                  link
                >
                  <v-btn
                    color="warning"
                    outlined
                    rounded
                    block
                    @click="showEdit = true"
                  >
                    Edit Tim
                  </v-btn>
                </v-list-item>
                <v-list-item
                  v-if="teamDetails.host && !isMyTeam(teamDetails.host.uid)"
                  link
                >
                  <v-btn
                    color="error"
                    outlined
                    rounded
                    block
                    @click="$refs.leaveTeam.show({
                      ...teamDetails,
                      id,
                    })"
                  >
                    Keluar Tim
                  </v-btn>
                </v-list-item>
                <v-list-item
                  v-if="teamDetails.host && isMyTeam(teamDetails.host.uid)"
                  link
                >
                  <v-btn
                    color="error"
                    outlined
                    rounded
                    block
                    @click="$refs.deleteTeam.show({
                      ...teamDetails,
                      id,
                    })"
                  >
                    Hapus Tim
                  </v-btn>
                </v-list-item>
              </v-list>
            </v-sheet>
          </v-col>

          <v-col>
            <v-tabs-items
              v-model="currentTab"
              class="rounded"
            >
              <v-tab-item>
                <v-sheet
                  min-height="40vh"
                  rounded="lg"
                  class="pb-2"
                >
                  <div class="d-flex justify-space-between">
                    <v-card-title class="font-weight-bold">
                      Jadwal Konferensi
                    </v-card-title>
                    <div class="pa-4">
                      <v-btn
                        color="primary"
                        rounded
                        @click="showCreateConference = true"
                      >
                        Buat Konferensi
                      </v-btn>
                    </div>
                  </div>
                  <div
                    v-if="loadingConference"
                    class="px-4 d-flex align-center justify-center"
                    style="height: 200px"
                  >
                    <v-progress-circular
                      indeterminate
                      size="36"
                      color="primary"
                    ></v-progress-circular>
                  </div>
                  <div
                    v-else
                    class="px-4"
                  >
                    <v-card
                      v-for="conf in conferenceList"
                      :key="conf.id"
                      outlined
                      class="mb-2 mt-2"
                      @click="$refs.detail.show(id, conf.id)"
                    >
                      <div class="d-flex flex-wrap justify-space-between">
                        <v-card-title class="text-h6 font-weight-bold">
                          {{ conf.name }}
                        </v-card-title>
                        <div class="pa-4">
                          <v-btn
                            v-if="!isJoined(conf.participants)"
                            color="primary"
                            outlined
                            rounded
                          >
                            Gabung
                          </v-btn>
                        </div>
                      </div>
                      <div class="d-flex flex-wrap justify-space-between">
                        <div>
                          <v-card-text>
                            {{ conf.description }}
                          </v-card-text>
                          <v-card-text>
                            Dimulai : {{ formatDateId(conf.start_date) }} {{ conf.start_time }} • Sampai : {{ formatDateId(conf.end_date) }} {{ conf.end_time }}
                          </v-card-text>
                        </div>
                        <div class="px-4 pb-4">
                          <p class="text-right text-caption mb-1">
                            Peserta
                          </p>
                          <div
                            class="v-avatar-group"
                            :class="rootThemeClasses"
                          >
                            <v-tooltip
                              v-for="participant in conf.participants"
                              :key="participant.uid"
                              top
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-avatar
                                  v-bind="attrs"
                                  size="36"
                                  v-on="on"
                                >
                                  <v-img :src="participant.avatar"></v-img>
                                </v-avatar>
                              </template>
                              <span>{{ participant.name }}</span>
                            </v-tooltip>
                          </div>
                        </div>
                      </div>
                    </v-card>
                  </div>
                </v-sheet>
              </v-tab-item>
              <v-tab-item>
                <v-sheet
                  min-height="40vh"
                  rounded="lg"
                >
                  <v-card-title class="font-weight-bold">
                    Dokumen
                  </v-card-title>
                  <v-card-text>
                    Dokumen yang diupload dari konferensi yang sudah selesai.
                  </v-card-text>
                  <v-card-text class="pt-2 pb-6">
                    <v-expansion-panels>
                      <v-expansion-panel
                        v-for="j in 5"
                        :key="j"
                      >
                        <v-expansion-panel-header>
                          <div>
                            <span class="text-heading-2 font-weight-bold d-block mb-1">Konferensi {{ j }}</span>
                            <small>1232s23 • Tanggal 123123</small>
                          </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                          <v-row>
                            <v-col
                              v-for="i in 6"
                              :key="i"
                              cols="12"
                              md="6"
                            >
                              <v-hover #default="{ hover }">
                                <v-card outlined>
                                  <div class="d-flex align-center pa-2">
                                    <v-avatar
                                      size="40"
                                      class="mr-2"
                                    >
                                      <v-img :src="require('@/assets/images/avatars/1.png')"></v-img>
                                    </v-avatar>
                                    <div>
                                      <div class="d-flex align-center">
                                        <h5 class="mr-2">
                                          Dokumen Name
                                        </h5>
                                      </div>
                                      <small>Dokumen Details</small>
                                    </div>
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
                                            class="ml-auto"
                                            v-on="on"
                                          >
                                            {{ icons.mdiDotsVertical }}
                                          </v-icon>
                                        </v-slide-x-reverse-transition>
                                      </template>
                                      <v-list>
                                        <v-list-item>
                                          Lihat Detail
                                        </v-list-item>
                                        <v-list-item>
                                          Hapus Dokumen
                                        </v-list-item>
                                      </v-list>
                                    </v-menu>
                                  </div>
                                </v-card>
                              </v-hover>
                            </v-col>
                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-card-text>
                </v-sheet>
              </v-tab-item>
              <v-tab-item>
                <v-sheet
                  min-height="40vh"
                  rounded="lg"
                >
                  <div class="d-flex justify-space-between">
                    <v-card-title class="font-weight-bold">
                      Anggota tim
                    </v-card-title>
                    <div class="pa-4">
                      <v-btn
                        color="primary"
                        rounded
                        @click="$refs.addMembers.show()"
                      >
                        Tambah Anggota
                      </v-btn>
                    </div>
                  </div>
                  <v-card-text class="pt-2">
                    <v-row>
                      <v-col
                        v-for="member in teamDetails.members"
                        :key="member.uid"
                        cols="12"
                        md="6"
                        lg="4"
                      >
                        <v-hover #default="{ hover }">
                          <v-card outlined>
                            <div class="d-flex align-center pa-2">
                              <v-avatar
                                size="40"
                                class="mr-2"
                              >
                                <v-img :src="member.avatar"></v-img>
                              </v-avatar>
                              <div>
                                <div class="d-flex align-center">
                                  <h5 class="mr-2">
                                    {{ member.name }}
                                  </h5>
                                  <v-chip
                                    v-if="isHost(member.uid)"
                                    color="primary"
                                    x-small
                                  >
                                    Host
                                  </v-chip>
                                </div>
                                <small>{{ member.email }}</small>
                              </div>
                              <v-menu
                                v-if="!isHost(member.uid)"
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
                                      class="ml-auto"
                                      v-on="on"
                                    >
                                      {{ icons.mdiDotsVertical }}
                                    </v-icon>
                                  </v-slide-x-reverse-transition>
                                </template>
                                <v-list>
                                  <v-list-item
                                    @click="kickMember = true; idKick = member.uid; $refs.leaveTeam.show({
                                      ...teamDetails,
                                      id,
                                    })"
                                  >
                                    Keluarkan Dari Tim
                                  </v-list-item>
                                </v-list>
                              </v-menu>
                            </div>
                          </v-card>
                        </v-hover>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-sheet>
              </v-tab-item>
            </v-tabs-items>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-bottom-sheet
      v-model="showEdit"
      max-width="600px"
    >
      <v-card>
        <v-card-title class="font-weight-bold my-4">
          Edit Tim
        </v-card-title>
        <create-team
          v-if="teamDetails && teamDetails.name"
          edit-mode
          :team-id="id"
          :value="{
            teamName: teamDetails.name,
            teamDescription: teamDetails.description,
          }"
          @updated="fetchDetails(); showEdit = false"
        />
      </v-card>
    </v-bottom-sheet>

    <v-bottom-sheet
      v-model="showCreateConference"
      max-width="900px"
    >
      <v-card>
        <v-card-title class="font-weight-bold my-4">
          Buat Konferensi
        </v-card-title>
        <conference-form
          :team-id="id"
          @success="showCreateConference = false; fetchConference()"
        />
      </v-card>
    </v-bottom-sheet>

    <leave-team
      :id="idKick"
      ref="leaveTeam"
      :kick="kickMember"
      @success="kickMember ? fetchDetails() : $router.replace('/teams')"
    />
    <delete-team
      ref="deleteTeam"
      @success="kickMember ? fetchDetails() : $router.replace('/teams')"
    />
    <logout ref="logout" />
    <conference-details
      ref="detail"
      @refetch="fetchConference()"
    />
    <add-members
      ref="addMembers"
      :team-id="id"
      @success="fetchDetails()"
    />
  </v-app>
</template>

<script>
import Vue from 'vue'
import { ref, computed, onMounted } from '@vue/composition-api'
import { mdiDotsVertical } from '@mdi/js'
import useVuetify from '@core/utils/vuetify'
import { formatDateId } from '@core/utils/filter'
import store from '@/store'
import router from '@/router'
import CreateTeam from '@/components/forms/CreateTeam.vue'
import DeleteTeam from '@/views/teams/DeleteTeam.vue'
import LeaveTeam from '@/views/teams/LeaveTeam.vue'
import Logout from '@/components/Logout.vue'
import ConferenceForm from './ConferenceForm.vue'
import ConferenceDetails from './ConferenceDetails.vue'
import AddMembers from './AddMembers.vue'

export default {
  components: {
    CreateTeam,
    DeleteTeam,
    LeaveTeam,
    Logout,
    ConferenceForm,
    ConferenceDetails,
    AddMembers,
  },
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },
  methods: {
    copyLink() {
      this.$copyText(this.id).then(() => {
        this.$toast.success('Kode Tim Berhasil Disalin!')
      })
    },
  },
  setup(props) {
    const { rootThemeClasses } = useVuetify()
    const teamDetails = ref({})
    const loadingDetails = ref(false)
    const conferenceList = ref([])
    const loadingConference = ref(false)
    const currentTab = ref(1)
    const showEdit = ref(false)
    const userData = computed(() => store.state.user.userData)
    const isMyTeam = host => {
      if (host === userData.value.uid) return true

      return false
    }
    const isHost = uid => {
      if (teamDetails.value.host.uid === uid) return true

      return false
    }
    const kickMember = ref(false)
    const idKick = ref(null)
    const showCreateConference = ref(false)

    const fetchDetails = () => {
      kickMember.value = false
      idKick.value = null
      loadingDetails.value = true
      store.dispatch('getTeamDetail', props.id).then(result => {
        if (result.exists) {
          store.dispatch('getUserData', result.data().host).then(host => {
            store.dispatch('getMemberList', props.id).then(members => {
              teamDetails.value = {
                ...result.data(),
                host: {
                  ...host.data(),
                  uid: host.id,
                },
                members,
              }
              loadingDetails.value = false
            })
          })
        } else {
          Vue.$toast.warning('Tim tidak tersedia')
          router.replace('/teams')
        }
      }).catch(() => {
        loadingDetails.value = false
        Vue.$toast.error('Terjadi kesalahan')
        router.replace('/teams')
      })
    }
    const fetchConference = () => {
      loadingConference.value = true
      store.dispatch('getConferenceList', {
        team_id: props.id,
      }).then(result => {
        loadingConference.value = false
        conferenceList.value = result
      })
    }

    const isJoined = members => {
      if (members && members.length) return members.some(el => el.uid === userData.value.uid)

      return false
    }

    onMounted(() => {
      fetchDetails()
      fetchConference()
    })

    return {
      rootThemeClasses,
      teamDetails,
      loadingDetails,
      currentTab,
      showEdit,
      fetchDetails,
      fetchConference,
      isMyTeam,
      isHost,
      kickMember,
      idKick,
      showCreateConference,
      conferenceList,
      loadingConference,
      formatDateId,
      isJoined,

      icons: {
        mdiDotsVertical,
      },
    }
  },
}
</script>
