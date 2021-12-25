<template>
  <div>
    <v-form
      ref="createTeamForm"
      lazy-validation
      @submit.prevent="createTeam()"
    >
      <div class="px-4">
        <v-text-field
          v-model="teamData.teamName"
          label="Nama Tim"
          dense
          placeholder="Input Nama Tim"
          outlined
          hide-details
          class="mb-2"
          :rules="[required]"
        ></v-text-field>
        <v-textarea
          v-model="teamData.teamDescription"
          label="Deskripsi Tim"
          dense
          placeholder="Deskripsi Tim"
          outlined
          hide-details
        ></v-textarea>
      </div>
      <div class="pa-4">
        <v-btn
          block
          color="primary"
          class="text-capitalize py-5"
          :loading="loading"
          @click="createTeam()"
        >
          Buat Tim
        </v-btn>
      </div>
    </v-form>

    <v-snackbar
      v-model="showSnackbar"
      :timeout="2000"
    >
      {{ snackBarText }}

      <template v-slot:action="{ attrs }">
        <v-btn
          color="blue"
          text
          v-bind="attrs"
          @click="showSnackbar = false"
        >
          OK
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { ref, computed } from '@vue/composition-api'
import { required } from '@core/utils/validation'
import firebase from 'firebase/app'
import store from '@/store'
import router from '@/router'

export default {
  setup() {
    const userData = computed(() => store.state.user.userData)
    const createTeamForm = ref(null)
    const teamData = ref({
      // for create team
      teamName: '',
      teamDescription: '',
    })
    const loading = ref(false)
    const showSnackbar = ref(false)
    const snackBarText = ref('')

    const createTeam = async () => {
      if (createTeamForm.value.validate()) {
        loading.value = true
        await store.dispatch('createTeam', {
          avatar: 'default.png',
          created_at: firebase.firestore.FieldValue.serverTimestamp(),
          description: teamData.value.teamDescription,
          host: userData.value.uid,
          name: teamData.value.teamName,
        }).then(data => {
          loading.value = false
          showSnackbar.value = true
          snackBarText.value = 'Berhasil membuat tim!'

          setTimeout(() => {
            router.push({ name: 'teams-detail', params: { id: data.id } })
          }, 2000)
        }).catch(err => {
          loading.value = false
          showSnackbar.value = true
          snackBarText.value = 'Gagal membuat tim!'
          console.log(err)
        })
      } else {
        console.log('not valid')
      }
    }

    return {
      createTeamForm,
      teamData,
      loading,
      createTeam,
      required,

      showSnackbar,
      snackBarText,
    }
  },
}
</script>

<style>

</style>
