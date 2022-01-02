<template>
  <v-bottom-sheet
    v-model="showModal"
    max-width="600px"
  >
    <v-card>
      <v-form
        ref="addMemberForm"
        lazy-validation
        @submit.prevent="addMember()"
      >
        <v-card-title>
          Tambah Anggota Tim
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="email"
            class="mt-2"
            label="Email"
            dense
            placeholder="Input Email Anggota"
            outlined
            :rules="[required, emailValidator]"
          ></v-text-field>
          <v-btn
            class="mt-2"
            color="primary"
            block
            rounded
            :loading="loading"
            @click="addMember()"
          >
            Tambah Anggota
          </v-btn>
        </v-card-text>
      </v-form>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import Vue from 'vue'
import { ref } from '@vue/composition-api'
import { required, emailValidator } from '@core/utils/validation'
import { db } from '@/firebase'
import store from '@/store'

export default {
  props: {
    teamId: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const showModal = ref(false)
    const email = ref('')
    const addMemberForm = ref(null)
    const loading = ref(false)

    const show = () => {
      showModal.value = true
    }

    const addMember = () => {
      if (addMemberForm.value.validate()) {
        loading.value = true
        db.collection('users').where('email', '==', email.value).limit(1).get()
          .then(result => {
            if (!result.empty) {
              store.dispatch('joinTeam', {
                user_id: result.docs[0].id,
                team_id: props.teamId,
              }).then(() => {
                emit('success')
                loading.value = false
                Vue.$toast.success('Berhasil menambahkan anggota!')
                showModal.value = false
              }).catch(() => {
                loading.value = false
                Vue.$toast.error('Gagal menambahkan anggota!')
              })
            } else {
              loading.value = false
              Vue.$toast.warning('Email tidak terdaftar di Confess')
            }
          })
      } else {
        Vue.$toast.warning('Lengkapi data terlebih dahulu!')
      }
    }

    return {
      showModal,
      email,
      show,
      required,
      emailValidator,
      addMemberForm,
      addMember,
      loading,
    }
  },
}
</script>

<style>

</style>
