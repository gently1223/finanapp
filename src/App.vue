<template>
  <div v-if="loading" class="window-height flex flex-center">
    <q-spinner-pie color="primary" size="25%" />
  </div>
  <router-view />
</template>
<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { api } from 'boot/axios';
import { auth } from 'boot/firebase';
import { useLoading } from 'src/factories/useLoading';

export default defineComponent({
  name: 'App',
  setup() {
    const { loading } = useLoading();
    //Set api auth headers
    api.interceptors.request.use(async (config) => {
      console.log('entering interceptor');
      const token = await auth().currentUser?.getIdToken();
      console.log(token);
      if (token) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    });

    return { loading };
  },
});
</script>
