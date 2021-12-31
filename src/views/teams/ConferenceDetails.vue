<template>
  <v-bottom-sheet
    v-model="showDetail"
    max-width="900px"
  >
    <v-card
      min-height="400px"
    >
      <v-card-title class="font-weight-bold">
        Detail Konferensi
      </v-card-title>
      <div
        v-if="loading"
        class="d-flex align-center justify-center h-100 mt-4"
      >
        <v-progress-circular
          indeterminate
          size="48"
          color="primary"
        ></v-progress-circular>
      </div>
      <div
        v-else
        class="px-4"
      >
        <h6>Lorem ipsum dolor sit amet consectetur.</h6>
      </div>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import { ref } from '@vue/composition-api'

export default {
  setup() {
    const showDetail = ref(false)
    const loading = ref(true)
    const confDetail = ref({})

    const show = id => {
      console.log(id)
      loading.value = true
      showDetail.value = true
      setTimeout(() => {
        loading.value = false
      }, 3000)
    }

    return {
      confDetail,
      showDetail,
      loading,
      show,
    }
  },
}
</script>

<style>

</style>
