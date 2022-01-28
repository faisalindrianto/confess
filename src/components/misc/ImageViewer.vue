<template>
  <v-bottom-sheet
    v-model="isOpen"
    max-width="900px"
    scrollable
  >
    <v-card
      min-height="90vh"
    >
      <v-card-title class="font-weight-bold d-flex">
        <span>Preview Gambar</span>
        <v-btn
          color="primary"
          rounded
          outlined
          small
          class="ml-auto mr-2"
          @click="download()"
        >
          Download
        </v-btn>
        <v-icon
          size="26px"
          @click="close()"
        >
          {{ icons.mdiClose }}
        </v-icon>
      </v-card-title>
      <v-card-text
        height="80vh"
      >
        <v-img
          width="100%"
          :src="link"
          contain
        />
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import { ref } from '@vue/composition-api'
import { mdiClose } from '@mdi/js'

export default {
  setup() {
    const link = ref('')
    const isOpen = ref(false)

    const show = data => {
      link.value = data
      isOpen.value = true
    }

    const close = () => {
      isOpen.value = false
    }

    const download = () => {
      window.open(link.value, '_blank').focus()
    }

    return {
      link,
      isOpen,
      show,
      close,
      download,

      icons: {
        mdiClose,
      },
    }
  },
}
</script>

<style>

</style>
