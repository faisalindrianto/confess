<template>
  <v-bottom-sheet
    v-model="isOpen"
    max-width="900px"
    scrollable
  >
    <v-card
      min-height="90vh"
    >
      <v-card-title class="font-weight-bold d-flex justify-space-between">
        <span>Preview Dokumen</span>
        <v-icon
          size="26px"
          @click="close()"
        >
          {{ icons.mdiClose }}
        </v-icon>
      </v-card-title>
      <div
        class="mb-4"
        style="height: 90%;"
      >
        <perfect-scrollbar v-if="pdfLink">
          <pdf
            v-for="i in 10"
            :key="i"
            :page="i"
            :src="pdfLink"
            class="h-full"
          />
        </perfect-scrollbar>
      </div>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import { ref } from '@vue/composition-api'
import pdf from 'pdfvuer'
import { mdiClose } from '@mdi/js'
import { PerfectScrollbar } from 'vue2-perfect-scrollbar'

export default {
  components: {
    pdf,
    PerfectScrollbar,
  },
  setup() {
    const pdfLink = ref('')
    const filename = ref('Oriens')
    const isOpen = ref(false)

    const show = (data, name) => {
      if (name) {
        filename.value = name
      } else {
        // eslint-disable-next-line prefer-destructuring
        filename.value = data.substring(data.lastIndexOf('/') + 1).split('.')[0]
      }

      pdfLink.value = data
      isOpen.value = true
    }

    const close = () => {
      pdfLink.value = ''
      isOpen.value = false
    }

    return {
      pdfLink,
      filename,
      isOpen,
      show,
      close,

      icons: {
        mdiClose,
      },
    }
  },
}
</script>

<style>

</style>
