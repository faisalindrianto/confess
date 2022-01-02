<template>
  <v-dialog
    v-model="showDeleteConfDialog"
    max-width="290"
  >
    <v-card>
      <v-card-title class="text-h5">
        Hapus konferensi?
      </v-card-title>

      <v-card-text>
        Konfirmasi jika kamu ingin menghapus konferensi ini.
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn
          class="text-capitalize"
          color="grey darken-1"
          text
          @click="showDeleteConfDialog = false"
        >
          Batalkan
        </v-btn>

        <v-btn
          class="text-capitalize"
          color="primary"
          text
          @click="deleteConf()"
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
    const confData = ref({})
    const showDeleteConfDialog = ref(false)
    const userData = computed(() => store.state.user.userData)

    const show = (teamId, confId) => {
      confData.value = {
        teamId,
        confId,
      }
      showDeleteConfDialog.value = true
    }

    const deleteConf = () => {
      store.dispatch('deleteConference', confData.value).then(() => {
        showDeleteConfDialog.value = false
        Vue.$toast.success('Berhasil menghapus konferensi!')
        emit('success')
        store.dispatch('getUserSchedules', userData.value.uid).then(result => {
          store.commit('setUserSchedules', result)
        })
      }).catch(() => {
        showDeleteConfDialog.value = false
        Vue.$toast.success('Terjadi kesalahan!')
      })
    }

    return {
      show,
      deleteConf,
      showDeleteConfDialog,
    }
  },
}
</script>

<style>

</style>
