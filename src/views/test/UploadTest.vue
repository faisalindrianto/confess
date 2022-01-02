<template>
  <v-container>
    <v-file-input
      v-model="files"
      chips
      counter
      multiple
      show-size
      outlined
      dense
      truncate-length="20"
    ></v-file-input>
    <v-btn @click="submit">
      Submit!
    </v-btn>
    <v-divider class="my-6" />
    <v-text-field
      v-model="chatContent"
      outlined
      dense
      label="Kirim Chat"
      placeholder="Input Chat"
    />
    <v-btn @click="sendChat">
      Send!
    </v-btn>
    <v-btn @click="$router.push('/')">
      back to home
    </v-btn>
    <v-list>
      <v-list-item
        v-for="chat in chatList"
        :key="chat.id"
      >
        {{ chat.content }}
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script>
import firebase from 'firebase/app'
import { ref, onMounted } from '@vue/composition-api'
import store from '@/store'
import { db } from '@/firebase'

export default {
  setup() {
    const files = ref([])
    const submit = () => {
      if (files.value.length) {
        files.value.forEach(async file => {
          store.dispatch('uploadDocument', {
            team_id: 'teams-1',
            conf_id: 'okeoke',
            file,
          }).then(result => {
            console.log('success upload', result)
          })
        })
      }
    }
    const chatContent = ref('')
    const sendChat = () => {
      store.dispatch('sendChat', {
        team_id: 'teams-1',
        conf_id: 'okeoke',
        data: {
          type: 'chat',
          sender: 'uid',
          sender_name: 'faisal',
          content: chatContent.value,
          delivered_at: firebase.firestore.FieldValue.serverTimestamp(),
        },
      })
    }

    const chatList = ref([])

    onMounted(() => {
      db.collection('teams')
        .doc('teams-1')
        .collection('conferences')
        .doc('okeoke')
        .collection('chats')
        .onSnapshot(snapshot => {
          chatList.value = snapshot.docs.map(el => ({ id: el.id, ...el.data() }))
          console.log(chatList.value)
        })
    })

    return {
      files,
      submit,
      chatContent,
      sendChat,
      chatList,
    }
  },
}
</script>

<style>

</style>
