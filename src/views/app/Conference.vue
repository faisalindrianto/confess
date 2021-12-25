<template>
  <div>
    <div class="d-flex justify-space-between py-4 px-8 w-100 align-center">
      <h6 class="text-h5 font-weight-bold primary--text">
        confess
      </h6>
      <v-chip
        class="primary--text font-weight-medium white"
      >
        dev-ind-212
      </v-chip>
    </div>
    <v-card class="mx-8 main d-flex flex-column">
      <div class="d-flex video-top">
        <div class="w-100 d-flex flex-column align-center justify-center">
          <div
            :key="showSidebar"
            class="video-list pa-4 overflow-auto"
          >
            <v-card
              v-for="i in 6"
              :key="i"
              :min-width="showSidebar ? '240px' : '500px'"
              max-width="500px"
              outlined
              class="mr-2 mb-2 flex-grow-1"
            >
              <v-responsive :aspect-ratio="16/9">
                <div class="d-flex align-center h-100 w-100 justify-center">
                  <v-avatar size="48">
                    <v-img src="@/assets/images/avatars/1.png"></v-img>
                  </v-avatar>
                </div>
              </v-responsive>
            </v-card>
          </div>
        </div>
        <div
          v-if="showSidebar"
          class="sidebar pa-4"
        >
          Sidebar
        </div>
      </div>
      <div class="bottom pa-4 d-flex justify-end">
        <v-slide-x-reverse-transition
          mode="out-in"
        >
          <v-icon
            :key="showSidebar"
            @click="showSidebar = !showSidebar"
          >
            {{ showSidebar ? icons.mdiClose : icons.mdiMenu }}
          </v-icon>
        </v-slide-x-reverse-transition>
      </div>
    </v-card>
  </div>
</template>

<script>
import { ref } from '@vue/composition-api'
import { mdiMenu, mdiClose } from '@mdi/js'

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup() {
    const showSidebar = ref(false)

    return {
      showSidebar,

      icons: {
        mdiMenu,
        mdiClose,
      },
    }
  },
}
</script>

<style lang="scss">
.main {
  height: 90vh;
}

.video-top {
  height: calc(90vh - 56px);
}

.video-list {
  display: flex;
  flex-wrap: wrap-reverse;
  align-content: center;
  justify-content: center;
}

.bottom {
  height: 56px;
  border-top: 1px solid #eee;
}

.sidebar {
  width: 560px;
  border-left: 1px solid #eee;
}
</style>
