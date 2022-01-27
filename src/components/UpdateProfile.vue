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
          @click="$refs.file.click()"
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
          <input
            ref="file"
            type="file"
            style="display:none"
            @change="onFileChange($event.target.files)"
          >
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
import router from '@/router'
import { storage } from '@/firebase'

export default {
  setup() {
    const userData = computed(() => store.state.user.userData)
    const showModal = ref(false)
    const updateData = ref({
      name: '',
      avatar: '',
    })
    const newAvatar = ref(null)
    const show = () => {
      showModal.value = true
    }
    const loading = ref(false)
    onMounted(() => {
      updateData.value.name = userData.value.name
      updateData.value.avatar = userData.value.avatar
    })
    const reset = () => {
      updateData.value.name = userData.value.name
      updateData.value.avatar = userData.value.avatar
    }
    const updateProfile = async () => {
      loading.value = true
      const payload = {
        uid: userData.value.uid,
        data: updateData.value,
      }
      if (newAvatar.value) {
        const metadata = {
          contentType: newAvatar.value.type,
        }
        const upload = storage.ref().child(`userPhoto/${payload.uid}/${newAvatar.value.name}`)
        await upload.put(newAvatar.value, metadata).then(async () => {
          const url = await upload.getDownloadURL()

          payload.data.avatar = url
        })
      }

      store.dispatch('updateUserData', payload).then(() => {
        loading.value = false
        showModal.value = false
        Vue.$toast.success('Berhasil mengupdate profil!')
        router.go()
      }).catch(() => {
        loading.value = false
        Vue.$toast.error('Gagal mengupdate profil!')
      })
    }

    const onFileChange = files => {
      updateData.value.avatar = URL.createObjectURL(files[0])

      // eslint-disable-next-line prefer-destructuring
      newAvatar.value = files[0]
    }

    return {
      showModal,
      userData,
      updateData,
      show,
      reset,
      updateProfile,
      loading,
      onFileChange,

      icons: {
        mdiClose,
      },
    }
  },
}
</script>

<style>

</style>
