<template>
  <div>
    <v-form
      ref="joinTeamForm"
      lazy-validation
      @submit.prevent="joinTeam()"
    >
      <div class="px-4">
        <v-text-field
          v-model="teamData.teamCode"
          label="Kode Tim"
          dense
          placeholder="Input Kode Tim"
          outlined
          hide-details
          class="mb-2"
          :rules="[required]"
        ></v-text-field>
      </div>
      <div class="pa-4">
        <v-btn
          block
          color="primary"
          class="text-capitalize py-5"
          :loading="loading"
          @click="joinTeam()"
        >
          Gabung Tim
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script>
import { ref, computed } from '@vue/composition-api'
import Vue from 'vue'
import { required } from '@core/utils/validation'
import store from '@/store'
import router from '@/router'

export default {
  setup() {
    const userData = computed(() => store.state.user.userData)
    const joinTeamForm = ref(null)
    const teamData = ref({
      teamCode: '',
    })
    const loading = ref(false)

    const joinTeam = async () => {
      if (joinTeamForm.value.validate()) {
        loading.value = true
        await store.dispatch('joinTeam', {
          team_id: teamData.value.teamCode,
          user_id: userData.value.uid,
        }).then(() => {
          loading.value = false

          router.push({ name: 'teams-detail', params: { id: teamData.value.teamCode } })
          Vue.$toast.success('Berhasil bergabung ke tim!')
          store.dispatch('getUserTeams', userData.value.uid).then(result => {
            store.commit('setUserTeams', result)
          })
        }).catch(() => {
          loading.value = false
          Vue.$toast.error('Gagal bergabung ke tim!')
        })
      } else {
        Vue.$toast.warning('Data tidak valid')
      }
    }

    return {
      joinTeamForm,
      teamData,
      loading,
      joinTeam,
      required,
    }
  },
}
</script>

<style>

</style>
