<template>
  <div
    style="height: 80vh"
    class="d-flex flex-column align-center"
  >
    <p class="text-h5 font-weight-bold mt-8">
      Sesi Telah Berakhir
    </p>
    <p>Terima kasih telah menggunakan {{ teamId ? 'Confess Teams!' : 'Confess!' }} Semoga harimu selalu menyenangkan!</p>
    <v-btn
      color="primary"
      elevation="0"
      @click="teamId ? $router.push(`/teams/${teamId}`) : $router.push('/')"
    >
      {{ teamId ? 'Kembali ke Halaman Team' : 'Kembali ke Halaman Awal' }}
    </v-btn>
    <v-divider class="my-8 secondary" />
    <p class="mt-auto">
      Made with ❤️ from Surabaya by <a
        class="text-decoration-none"
        href="https://faisalindrianto.ninja"
      >Faisal Indrianto</a>
    </p>
  </div>
</template>

<script>
export default {
  props: {
    teamId: {
      type: String,
      default: '',
    },
  },
}
</script>

<style>

</style>
