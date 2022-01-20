<template>
  <v-bottom-sheet
    v-model="showDetail"
    max-width="900px"
  >
    <v-card
      min-height="400px"
    >
      <div class="d-flex">
        <v-slide-y-reverse-transition
          mode="out-in"
        >
          <v-card-title
            :key="currentTab"
          >
            <span class="text-subtitle-2 font-weight-bold">{{ currentTab === 0 ? 'Detail Konferensi' : 'Edit Konferensi' }}</span>
          </v-card-title>
        </v-slide-y-reverse-transition>
        <v-slide-x-reverse-transition
          v-if="!isExpired"
          mode="out-in"
        >
          <div
            v-if="currentTab === 0 && isHost(userData.uid)"
            :key="1"
            class="pa-4 ml-auto"
          >
            <v-btn
              class="mr-2"
              rounded
              small
              color="error"
              outlined
              @click="$refs.delete.show(teamId, confId)"
            >
              Hapus
            </v-btn>
            <v-btn
              rounded
              small
              color="warning"
              outlined
              @click="currentTab = 1"
            >
              Edit
            </v-btn>
          </div>
          <div
            v-else-if="currentTab !== 0 && isHost(userData.uid)"
            :key="2"
            class="pa-4 ml-auto"
          >
            <v-btn
              rounded
              small
              color="secondary"
              outlined
              @click="currentTab = 0"
            >
              Tutup
            </v-btn>
          </div>
        </v-slide-x-reverse-transition>
        <div
          v-else
          class="pa-4 ml-auto"
        >
          <v-chip>
            Konferensi ini telah selesai
          </v-chip>
        </div>
      </div>
      <div
        v-if="loading"
        class="d-flex align-center justify-center h-100 mt-4"
      >
        <v-progress-circular
          indeterminate
          size="48"
          color="primary"
        ></v-progress-circular>
      </div>
      <div
        v-else
      >
        <v-tabs-items
          v-model="currentTab"
        >
          <v-tab-item>
            <v-card-title class="font-weight-bold pt-0">
              <span class="primary--text">{{ confDetail.name }}</span>
            </v-card-title>
            <v-card-text>
              Dimulai : {{ formatDateId(confDetail.start_date) }} {{ confDetail.start_time }} • Sampai : {{ formatDateId(confDetail.end_date) }} {{ confDetail.end_time }}
            </v-card-text>
            <v-card-text>
              <span class="font-weight-bold text-subtitle-2 d-block">Deskripsi</span>
              <span class="text-body-1 mt-1">{{ confDetail.description }}</span>
            </v-card-text>
            <v-card-text>
              <span class="font-weight-bold text-subtitle-2 d-block mb-2">Peserta</span>
              <v-row>
                <v-col
                  v-for="member in confDetail.participants"
                  :key="member.uid"
                  cols="12"
                  md="6"
                  lg="4"
                >
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
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-text
              v-if="!loading && !isExpired"
              class="mt-4"
            >
              <v-btn
                v-if="!isJoined"
                color="primary"
                rounded
                block
                class="mt-4"
                :loading="loadingJoin"
                @click="joinConference()"
              >
                Gabung
              </v-btn>
              <v-btn
                v-else
                color="primary"
                rounded
                block
                outlined
                class="mt-4"
                :loading="loadingJoin"
                @click="leaveConference()"
              >
                Berhalangan Hadir
              </v-btn>
              <v-btn
                v-if="isJoined"
                color="primary"
                rounded
                block
                class="mt-4 mb-4"
                :loading="loadingJoin"
                @click="$router.push({ name: 'fess', params: { teamId, id: confId } })"
              >
                Mulai Konferensi
              </v-btn>
            </v-card-text>
          </v-tab-item>
          <v-tab-item>
            <conference-form
              class="mt-2"
              :team-id="teamId"
              :conf-id="confId"
              :value="confDetail"
              @success="show(teamId, confId); $emit('refetch')"
            />
          </v-tab-item>
        </v-tabs-items>
      </div>
    </v-card>

    <delete-conference
      ref="delete"
      @success="showDetail = false; $emit('refetch')"
    />
  </v-bottom-sheet>
</template>

<script>
import Vue from 'vue'
import { ref, computed } from '@vue/composition-api'
import { formatDateId } from '@core/utils/filter'
import store from '@/store'
import DeleteConference from './DeleteConference.vue'
import ConferenceForm from './ConferenceForm.vue'

export default {
  components: {
    DeleteConference,
    ConferenceForm,
  },
  setup(props, { emit }) {
    const userData = computed(() => store.state.user.userData)
    const teamId = ref('')
    const confId = ref('')
    const showDetail = ref(false)
    const loading = ref(true)
    const confDetail = ref({})
    const currentTab = ref(0)
    const loadingJoin = ref(false)

    const isExpired = computed(() => {
      if (confDetail.value.name && new Date() > new Date(Date.parse(`${confDetail.value.end_date} ${confDetail.value.end_time}`))) {
        return true
      }

      return false
    })

    const show = (teamIds, confIds) => {
      loading.value = true
      showDetail.value = true
      teamId.value = teamIds
      confId.value = confIds
      store.dispatch('getConferenceDetail', {
        team_id: teamIds,
        conf_id: confIds,
      }).then(data => {
        confDetail.value = data
        loading.value = false
      }).catch(() => {
        loading.value = false
        showDetail.value = false
        Vue.$toast.error('terjadi kesalahan!')
      })
    }

    const isHost = uid => {
      if (confDetail.value.created_by === uid) return true

      return false
    }

    const isJoined = computed(() => {
      if (confDetail.value && confDetail.value.participants.length) return confDetail.value.participants.some(el => el.uid === userData.value.uid)

      return false
    })

    const joinConference = () => {
      loadingJoin.value = true
      store.dispatch('joinConference', {
        team_id: teamId.value,
        user_id: userData.value.uid,
        conf_id: confId.value,
      }).then(() => {
        loadingJoin.value = false
        Vue.$toast.success('Berhasil bergabung ke konferensi!')
        show(teamId.value, confId.value)
        emit('refetch')
      }).catch(() => {
        loadingJoin.value = false
        Vue.$toast.error('Terjadi kesalahan!')
      })
    }

    const leaveConference = () => {
      loadingJoin.value = true
      store.dispatch('leaveConference', {
        team_id: teamId.value,
        user_id: userData.value.uid,
        conf_id: confId.value,
      }).then(() => {
        loadingJoin.value = false
        Vue.$toast.success('Berhasil keluar dari konferensi!')
        show(teamId.value, confId.value)
        emit('refetch')
      }).catch(() => {
        loadingJoin.value = false
        Vue.$toast.error('Terjadi kesalahan!')
      })
    }

    return {
      userData,
      teamId,
      confId,
      currentTab,
      confDetail,
      showDetail,
      loading,
      show,
      formatDateId,
      isHost,
      isJoined,
      joinConference,
      leaveConference,
      loadingJoin,

      isExpired,
    }
  },
}
</script>

<style>

</style>
