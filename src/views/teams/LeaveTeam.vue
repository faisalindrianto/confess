<template>
  <v-dialog
    v-model="showLeaveTeamDialog"
    max-width="290"
  >
    <v-card>
      <v-card-title class="text-h5">
        {{ kick ? 'Keluarkan dari tim?' : 'Keluar tim?' }}
      </v-card-title>

      <v-card-text>
        {{ kick ? 'Data pengguna ini akan dihapus dari tim' : 'Konfirmasi jika kamu ingin keluar dari tim ini.' }}
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn
          class="text-capitalize"
          color="grey darken-1"
          text
          @click="showLeaveTeamDialog = false"
        >
          Batalkan
        </v-btn>

        <v-btn
          class="text-capitalize"
          color="primary"
          text
          @click="leave()"
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
  props: {
    kick: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: null,
    },
  },
  setup(props, { emit }) {
    const teamData = ref({})
    const showLeaveTeamDialog = ref(false)
    const userData = computed(() => store.state.user.userData)

    const show = data => {
      teamData.value = data
      showLeaveTeamDialog.value = true
    }

    const leave = () => {
      store.dispatch('leaveTeam', {
        team_id: teamData.value.id,
        user_id: props.kick ? props.id : userData.value.uid,
      }).then(() => {
        showLeaveTeamDialog.value = false
        Vue.$toast.success(props.kick ? 'Berhasil dikeluarkan dari tim!' : 'Berhasil keluar dari tim!')
        emit('success')
        store.dispatch('getUserTeams', userData.value.uid).then(result => {
          store.commit('setUserTeams', result)
        })
      }).catch(() => {
        showLeaveTeamDialog.value = false
        Vue.$toast.success('Terjadi kesalahan!')
      })
    }

    return {
      show,
      leave,
      showLeaveTeamDialog,
    }
  },
}
</script>

<style>

</style>
