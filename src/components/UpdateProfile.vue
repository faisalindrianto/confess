<template>
  <v-dialog
    v-model="showModal"
    width="600px"
  >
    <v-card>
      <div class="d-flex align-center">
        <v-card-title class="font-weight-bold">
          Edit Akun
        </v-card-title>
        <div class="mr-5 ml-auto">
          <v-icon
            @click="showModal = false"
          >
            {{ icons.mdiClose }}
          </v-icon>
        </div>
      </div>
      <v-card-text>
        <v-file-input
          ref="filePicker"
          class="d-none"
          hide-input
          accept="image/*"
        />
        <v-card
          class="pa-4 mb-8 d-flex align-center"
          outlined
          @click="pickPhoto"
        >
          <v-avatar
            class="mr-8"
            size="120px"
          >
            <v-img :src="updateData.avatar" />
          </v-avatar>
          <div>
            <span class="text-subtitle-2 font-weight-bold">Update Foto Profil</span>
            <span class="text-body-2 d-block mt-2">Upload foto profilmu disini.</span>
          </div>
        </v-card>

        <v-text-field
          v-model="updateData.name"
          label="Nama"
          placeholder="Ubah Nama"
          dense
          outlined
        />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          outlined
          @click="reset"
        >
          Reset
        </v-btn>
        <v-btn
          class="ml-4"
          color="primary"
          :loading="loading"
          :disabled="updateData.name.length < 3"
          @click="updateProfile"
        >
          Update
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from 'vue'
import { mdiClose } from '@mdi/js'
import { ref, computed, onMounted } from '@vue/composition-api'
import store from '@/store'

export default {
  setup() {
    const userData = computed(() => store.state.user.userData)
    const showModal = ref(false)
    const updateData = ref({
      name: '',
      avatar: '',
    })
    const show = () => {
      showModal.value = true
    }
    const loading = ref(false)
    onMounted(() => {
      updateData.value.name = userData.value.name
      updateData.value.avatar = userData.value.avatar
    })
    const pickPhoto = () => {}
    const reset = () => {
      updateData.value.name = userData.value.name
      updateData.value.avatar = userData.value.avatar
    }
    const updateProfile = () => {
      loading.value = true
      store.dispatch('updateUserData', {
        uid: userData.value.uid,
        data: updateData.value,
      }).then(() => {
        loading.value = false
        showModal.value = false
        Vue.$toast.success('Berhasil mengupdate profil!')
      }).catch(() => {
        loading.value = false
        Vue.$toast.error('Gagal mengupdate profil!')
      })
    }

    return {
      showModal,
      userData,
      updateData,
      show,
      pickPhoto,
      reset,
      updateProfile,
      loading,

      icons: {
        mdiClose,
      },
    }
  },
}
</script>

<style>

</style>
