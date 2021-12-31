<template>
  <v-dialog
    v-model="showLogoutDialog"
    max-width="290"
  >
    <v-card>
      <v-card-title class="text-h5">
        Ingin logout?
      </v-card-title>

      <v-card-text>
        Konfirmasi jika kamu ingin logout.
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn
          class="text-capitalize"
          color="grey darken-1"
          text
          @click="showLogoutDialog = false"
        >
          Batalkan
        </v-btn>

        <v-btn
          class="text-capitalize"
          color="primary"
          text
          @click="logout()"
        >
          Yakin
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from 'vue'
import { ref } from '@vue/composition-api'
import store from '@/store'
import router from '@/router'

export default {
  setup() {
    const showLogoutDialog = ref(false)

    const show = () => {
      showLogoutDialog.value = true
    }

    const logout = () => {
      store.dispatch('logout').then(() => {
        showLogoutDialog.value = false
        router.go()
        Vue.$toast.success('Berhasil Logout!')
      }).catch(() => {
        Vue.$toast.error('Gagal Logout!')
      })
    }

    return {
      show,
      logout,
      showLogoutDialog,
    }
  },
}
</script>

<style>

</style>
