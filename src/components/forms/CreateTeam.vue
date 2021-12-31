<template>
  <div>
    <v-form
      ref="createTeamForm"
      lazy-validation
      @submit.prevent="submitTeam()"
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
          @click="submitTeam()"
        >
          {{ editMode ? 'Update Tim' : 'Buat Tim' }}
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script>
import { ref, computed, onMounted } from '@vue/composition-api'
import Vue from 'vue'
import { required } from '@core/utils/validation'
import firebase from 'firebase/app'
import store from '@/store'
import router from '@/router'

export default {
  props: {
    teamId: {
      type: String,
      default: null,
    },
    editMode: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Object,
      default: null,
    },
  },
  setup(props, { emit }) {
    const userData = computed(() => store.state.user.userData)
    const createTeamForm = ref(null)
    const teamData = ref({
      // for create team
      teamName: '',
      teamDescription: '',
    })
    const loading = ref(false)

    onMounted(() => {
      if (props.value) {
        teamData.value = props.value
      }
    })

    const submitTeam = async () => {
      if (createTeamForm.value.validate()) {
        loading.value = true

        if (props.editMode) {
          await store.dispatch('updateTeam', {
            team_id: props.teamId,
            data: {
              description: teamData.value.teamDescription,
              name: teamData.value.teamName,
            },
          }).then(() => {
            loading.value = false

            Vue.$toast.success('Berhasil mengupdate team!')
            store.dispatch('getUserTeams', userData.value.uid).then(result => {
              store.commit('setUserTeams', result)
            })
            emit('updated')
          }).catch(() => {
            loading.value = false
            Vue.$toast.error('Gagal mengubah team!')
          })
        } else {
          await store.dispatch('createTeam', {
            avatar: 'default.png',
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            description: teamData.value.teamDescription,
            host: userData.value.uid,
            name: teamData.value.teamName,
          }).then(data => {
            loading.value = false

            router.push({ name: 'teams-detail', params: { id: data.id } })
            Vue.$toast.success('Berhasil membuat team!')
            store.dispatch('getUserTeams', userData.value.uid).then(result => {
              store.commit('setUserTeams', result)
            })
          }).catch(() => {
            loading.value = false
            Vue.$toast.error('Gagal membuat team!')
          })
        }
      } else {
        Vue.$toast.warning('Data tidak valid')
      }
    }

    return {
      createTeamForm,
      teamData,
      loading,
      submitTeam,
      required,
    }
  },
}
</script>

<style>

</style>
