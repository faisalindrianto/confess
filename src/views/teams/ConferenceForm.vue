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
                    :value="formatDate(formData.start_date)"
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
                    :value="formatDate(formData.end_date)"
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
        @click="submitConference()"
      >
        Buat Konferensi
      </v-btn>
      <v-btn
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
import { ref, computed } from '@vue/composition-api'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import firebase from 'firebase/app'
import { required } from '@core/utils/validation'
import store from '@/store'

export default {
  props: {
    confId: {
      type: String,
      default: null,
    },
    value: {
      type: Object,
      default: null,
    },
  },
  setup() {
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
      created_by: userData.uid,
    })
    const loading = ref(false)
    const showStartDate = ref(false)
    const showStartTime = ref(false)
    const showEndDate = ref(false)
    const showEndTime = ref(false)
    const formatDate = date => (date ? format(parseISO(date), 'EEEE, d MMMM yyyy', { locale: id }) : '')

    const submitConference = () => {
      if (createConferenceForm.value.validate()) {
        console.log('submit conference!', formData.value)
      } else {
        Vue.$toast.warning('Data tidak valid')
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
      formatDate,
    }
  },
}
</script>

<style>

</style>
