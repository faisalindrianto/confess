<template>
  <div>
    <pdf-viewer ref="pdf" />
    <image-viewer ref="img" />
  </div>
</template>

<script>
import PdfViewer from './PdfViewer.vue'
import ImageViewer from './ImageViewer.vue'

export default {
  components: {
    PdfViewer,
    ImageViewer,
  },
  methods: {
    show(type, doc) {
      if (type === 'application/pdf') {
        this.$refs.pdf.show(doc.url)
      } else if (type.includes('image')) {
        this.$refs.img.show(doc.url)
      } else {
        window.open(doc.url, '_blank').focus()
      }
    },
  },
}
</script>

<style>

</style>
