<template>
  <div class="px-4 pb-8">
    <v-form
      ref="createConferenceForm"
      lazy-validation
      @submit.prevent="submitConference()"
    >
      <v-row class="mb-4">
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="formData.name"
            label="Judul Konferensi"
            dense
            placeholder="Input Judul Konferensi"
            outlined
            :rules="[required]"
          ></v-text-field>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="formData.description"
            label="Deskripsi Konferensi"
            dense
            placeholder="Input Deskripsi Konferensi"
            outlined
          ></v-text-field>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-row>
            <v-col
              cols="8"
            >
              <v-menu
                v-model="showStartDate"
                :close-on-content-click="false"
                max-width="290"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    :value="formatDateId(formData.start_date)"
                    clearable
                    label="Tanggal Mulai"
                    readonly
                    outlined
                    dense
                    v-bind="attrs"
                    v-on="on"
                    @click:clear="formData.start_date = null"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="formData.start_date"
                  locale="id-ID"
                  @change="showStartDate = false"
                ></v-date-picker>
              </v-menu>
            </v-col>
            <v-col
              cols="4"
            >
              <v-menu
                v-model="showStartTime"
                :close-on-content-click="false"
                max-width="290"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    :value="formData.start_time"
                    clearable
                    label="Jam Mulai"
                    readonly
                    outlined
                    dense
                    v-bind="attrs"
                    v-on="on"
                    @click:clear="formData.start_time = ''"
                  ></v-text-field>
                </template>
                <v-time-picker
                  v-model="formData.start_time"
                  locale="id-ID"
                  format="24hr"
                  scrollable
                  @change="showStartTime = false"
                ></v-time-picker>
              </v-menu>
            </v-col>
          </v-row>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-row>
            <v-col
              cols="8"
            >
              <v-menu
                v-model="showEndDate"
                :close-on-content-click="false"
                max-width="290"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    :value="formatDateId(formData.end_date)"
                    clearable
                    label="Tanggal Berakhir"
                    readonly
                    outlined
                    dense
                    v-bind="attrs"
                    v-on="on"
                    @click:clear="formData.end_date = null"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="formData.end_date"
                  locale="id-ID"
                  @change="showEndDate = false"
                ></v-date-picker>
              </v-menu>
            </v-col>
            <v-col
              cols="4"
            >
              <v-menu
                v-model="showEndTime"
                :close-on-content-click="false"
                max-width="290"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    :value="formData.end_time"
                    clearable
                    label="Jam Selesai"
                    readonly
                    outlined
                    dense
                    v-bind="attrs"
                    v-on="on"
                    @click:clear="formData.end_time = ''"
                  ></v-text-field>
                </template>
                <v-time-picker
                  v-model="formData.end_time"
                  locale="id-ID"
                  format="24hr"
                  scrollable
                  @change="showEndTime = false"
                ></v-time-picker>
              </v-menu>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-btn
        block
        color="primary"
        :loading="loading"
        @click="submitConference()"
      >
        {{ editMode ? 'Update Konferensi' : 'Buat Konferensi' }}
      </v-btn>
      <v-btn
        v-if="!editMode"
        block
        color="primary"
        outlined
        class="mt-4"
        @click="resetForm()"
      >
        Reset
      </v-btn>
    </v-form>
  </div>
</template>

<script>
import Vue from 'vue'
import { ref, computed, onMounted } from '@vue/composition-api'
import { formatDateId } from '@core/utils/filter'
import { format, parseISO } from 'date-fns'
import firebase from 'firebase/app'
import { required } from '@core/utils/validation'
import store from '@/store'

export default {
  props: {
    teamId: {
      type: String,
      default: null,
      required: true,
    },
    confId: {
      type: String,
      default: null,
    },
    value: {
      type: Object,
      default: null,
    },
  },
  setup(props, { emit }) {
    const createConferenceForm = ref(null)
    const userData = computed(() => store.state.user.userData)
    const formData = ref({
      name: '',
      description: '',
      start_date: format(parseISO(new Date().toISOString()), 'yyyy-MM-dd'),
      start_time: '12:00',
      end_date: format(parseISO(new Date().toISOString()), 'yyyy-MM-dd'),
      end_time: '12:00',
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      created_by: userData.value.uid,
    })
    const loading = ref(false)
    const showStartDate = ref(false)
    const showStartTime = ref(false)
    const showEndDate = ref(false)
    const showEndTime = ref(false)
    const editMode = computed(() => props.confId !== null)

    onMounted(() => {
      if (props.value) {
        formData.value = props.value
      }
    })

    const submitConference = () => {
      if (createConferenceForm.value.validate()) {
        loading.value = true

        if (!props.confId) {
          store.dispatch('createConference', {
            team_id: props.teamId,
            data: formData.value,
          }).then(() => {
            Vue.$toast.success('Jadwal berhasil dibuat!')
            emit('success')
            loading.value = false
          }).catch(() => {
            Vue.$toast.error('Terjadi kesalahan')
            emit('failed')
            loading.value = false
          })
        } else {
          store.dispatch('updateConference', {
            team_id: props.teamId,
            conf_id: props.confId,
            data: {
              name: formData.value.name,
              description: formData.value.description,
              start_time: formData.value.start_time,
              start_date: formData.value.start_date,
              end_date: formData.value.end_date,
              end_time: formData.value.end_time,
            },
          }).then(() => {
            Vue.$toast.success('Konferensi berhasil diubah!')
            emit('success')
            loading.value = false
          }).catch(() => {
            Vue.$toast.error('Terjadi kesalahan')
            emit('failed')
            loading.value = false
          })
        }
      } else {
        Vue.$toast.warning('Isi form dengan benar terlebih dahulu')
      }
    }
    const resetForm = () => {
      formData.value = {
        name: '',
        description: '',
        start_date: format(parseISO(new Date().toISOString()), 'yyyy-MM-dd'),
        start_time: '12:00',
        end_date: format(parseISO(new Date().toISOString()), 'yyyy-MM-dd'),
        end_time: '12:00',
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        created_by: userData.uid,
      }
      createConferenceForm.value.resetValidation()
    }

    return {
      createConferenceForm,
      userData,
      loading,
      formData,
      submitConference,
      resetForm,
      required,
      showStartDate,
      showStartTime,
      showEndDate,
      showEndTime,
      formatDateId,
      editMode,
    }
  },
}
</script>

<style>

</style>
