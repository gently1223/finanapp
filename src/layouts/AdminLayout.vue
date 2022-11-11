<template>
  <q-layout view="hHh Lpr lff">
    <q-header elevated>
      <q-toolbar>
        <q-avatar @click="backhome" class="cursor-pointer">
          <q-img :src="icon" />
        </q-avatar>
        <q-toolbar-title class="cursor-pointer" @click="backhome">
          FINANFOX
        </q-toolbar-title>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      side="right"
      v-model="leftDrawerOpen"
      bordered
      elevated
      :behavior="'mobile'"
    >
      <q-list class="menu-list">
        <q-item clickable @click="handleLogout">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section> Logout </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { useAuthApi } from 'src/factories/useAuthApi';
// import { useHubspotApi } from 'src/factories/useHubspotApi';
import { useAnimals } from 'src/factories/useAnimals';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { analytics } from 'src/boot/firebase';

export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup() {
    const leftDrawerOpen = ref(false);
    // const hasProducts = ref(false);
    const $router = useRouter();
    const { logout } = useAuthApi();
    // const { contact } = useHubspotApi();
    const { getAnimal } = useAnimals();
    // const userName = ref('')
    // const userEmail = contact.value?.email;
    const icon = ref('');
    const backhome = async () => {
      await $router.push('/');
    };
    onMounted(() => {
      icon.value = getAnimal();
    });
    const handleLogout = async () => {
      analytics.logEvent('logout_menu');
      await logout();
    };
    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      backhome,
      icon,
      handleLogout,
    };
  },
});
</script>

<style lang="scss" scoped></style>
