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
        <span>Preview Dokumen</span>
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
        <pdf
          v-for="i in numPages"
          :key="`${pdfLink}${i}`"
          :page="i"
          :src="pdfLink"
          class="h-full"
        />
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import { ref } from '@vue/composition-api'
import pdf from 'pdfvuer'
import { mdiClose } from '@mdi/js'

export default {
  components: {
    pdf,
  },
  setup() {
    const pdfLink = ref('')
    const numPages = ref(0)
    const filename = ref('Oriens')
    const isOpen = ref(false)

    const show = (data, name) => {
      if (name) {
        filename.value = name
      } else {
        // eslint-disable-next-line prefer-destructuring
        filename.value = data.substring(data.lastIndexOf('/') + 1).split('.')[0]
      }

      pdf.createLoadingTask(data).then(result => {
        numPages.value = result.numPages
        pdfLink.value = data
        isOpen.value = true
      })
    }

    const close = () => {
      isOpen.value = false
    }

    const download = () => {
      window.open(pdfLink.value, '_blank').focus()
    }

    return {
      pdfLink,
      filename,
      isOpen,
      show,
      close,
      numPages,
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
