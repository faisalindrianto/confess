<template>
  <v-dialog
    v-model="showDeleteTeamDialog"
    max-width="290"
  >
    <v-card>
      <v-card-title class="text-h5">
        Hapus tim?
      </v-card-title>

      <v-card-text>
        Konfirmasi jika kamu ingin hapus tim ini.
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn
          class="text-capitalize"
          color="grey darken-1"
          text
          @click="showDeleteTeamDialog = false"
        >
          Batalkan
        </v-btn>

        <v-btn
          class="text-capitalize"
          color="primary"
          text
          @click="deleteTeam()"
        >
          Yakin
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from 'vue'
import { ref, computed } from '@vue/composition-api'
import store from '@/store'

export default {
  setup(props, { emit }) {
    const teamData = ref({})
    const showDeleteTeamDialog = ref(false)
    const userData = computed(() => store.state.user.userData)

    const show = data => {
      teamData.value = data
      showDeleteTeamDialog.value = true
    }

    const deleteTeam = () => {
      store.dispatch('deleteTeam', teamData.value.id).then(() => {
        showDeleteTeamDialog.value = false
        Vue.$toast.success('Berhasil menghapus tim!')
        emit('success')
        store.dispatch('getUserTeams', userData.value.uid).then(result => {
          store.commit('setUserTeams', result)
        })
      }).catch(() => {
        showDeleteTeamDialog.value = false
        Vue.$toast.success('Terjadi kesalahan!')
      })
    }

    return {
      show,
      deleteTeam,
      showDeleteTeamDialog,
    }
  },
}
</script>

<style>

</style>
