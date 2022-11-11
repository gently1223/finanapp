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
          v-if="userEmail"
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
      v-if="userEmail"
      v-model="leftDrawerOpen"
      bordered
      elevated
      :behavior="'mobile'"
    >
      <q-list class="menu-list">
        <q-item
          class="text-white bg-primary q-py-xl"
          clickable
          @click="backhome"
        >
          <q-item-section avatar>
            <q-avatar size="85px">
              <q-img :src="icon" />
            </q-avatar>
          </q-item-section>
          <q-item-section class="text-bold text-h5">
            {{ userName }}
          </q-item-section>
        </q-item>
        <q-item clickable @click="backhome">
          <q-item-section avatar>
            <q-icon name="mdi-home" />
          </q-item-section>
          <q-item-section> Home </q-item-section>
        </q-item>
        <q-item
          clickable
          @click="logEvent('mis_inversiones_menu')"
          to="/investments"
        >
          <q-item-section avatar>
            <q-icon name="mdi-finance" />
          </q-item-section>
          <q-item-section> Mi planificación </q-item-section>
        </q-item>

        <q-item clickable @click="logEvent('objetivos_menu')" to="/objectives">
          <q-item-section avatar>
            <q-icon name="mdi-bullseye-arrow" />
          </q-item-section>
          <q-item-section> Objetivos - Salud fin. </q-item-section>
        </q-item>

        <q-item clickable @click="logEvent('conecta_banco_menu')" to="/banks">
          <q-item-section avatar>
            <q-icon name="account_balance" />
          </q-item-section>
          <q-item-section> Conecta tu banco </q-item-section>
        </q-item>

        <q-item
          clickable
          @click="logEvent('mis_reuniones_menu')"
          to="/meetings"
        >
          <q-item-section avatar>
            <q-icon name="mdi-calendar-account" />
          </q-item-section>
          <q-item-section> Mis reuniones </q-item-section>
        </q-item>

        <q-item clickable @click="logEvent('referral_menu')" to="/referral">
          <q-item-section avatar>
            <q-icon name="mdi-gift" />
          </q-item-section>
          <q-item-section> Recomiéndanos +50€ </q-item-section>
        </q-item>

        <q-item v-if="hasProducts" clickable>
          <q-item-section avatar>
            <q-icon name="chat" />
          </q-item-section>
          <q-item-section> ¿Hablamos? </q-item-section>
        </q-item>
        <q-item clickable @click="logEvent('mi_cuenta_menu')" to="/account">
          <q-item-section avatar>
            <q-icon name="mdi-account" />
          </q-item-section>
          <q-item-section> Mi cuenta </q-item-section>
        </q-item>
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
import { useHubspotApi } from 'src/factories/useHubspotApi';
import { useAnimals } from 'src/factories/useAnimals';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { analytics } from 'src/boot/firebase';

export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup() {
    const leftDrawerOpen = ref(false);
    const hasProducts = ref(false);
    const $router = useRouter();
    const { logout } = useAuthApi();
    const { contact } = useHubspotApi();
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
    const logEvent = (event: string) => {
      console.log(event);
      analytics.logEvent(event);
    };
    const handleLogout = async () => {
      analytics.logEvent('logout_menu');
      await logout();
    };
    const userName = computed(() => {
      return `${contact.value?.firstname || 'Sin nombre'} ${
        contact.value?.lastname || ''
      }`;
    });
    const userEmail = computed(() => {
      return contact.value?.email;
    });
    return {
      leftDrawerOpen,
      hasProducts,
      userName,
      icon,
      userEmail,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      backhome,
      handleLogout,
      logEvent,
    };
  },
});
</script>

<style lang="scss" scoped>
.menu-list .q-item {
  // border-radius: 0 32px 32px 0;
}
</style>
