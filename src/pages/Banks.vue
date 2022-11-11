<template>
  <q-page class="row justify-evenly q-pa-md">
    <q-banner
      v-if="showBanner"
      inline-actions
      rounded
      class="bg-secondary text-white"
    >
      Finanfox nunca guardara información confidencial ni claves

      <template v-slot:action>
        <q-btn flat label="OK" @click="showBanner = false" />
      </template>
    </q-banner>
    <div v-if="!showBankSelector" class="col-11 col-md-5">
      <q-toolbar
        class="rounded-borders shadow-1"
        v-for="linkedBank in accounts"
        :key="linkedBank.id"
      >
        <q-avatar size="80px">
          <img :src="getBankDetails(linkedBank.id)?.logo" />
        </q-avatar>

        <q-toolbar-title class="text-bold">
          {{
            linkedBank.balance !== null
              ? $n(linkedBank.balance, 'currency')
              : 'Pulse para verificar'
          }}
        </q-toolbar-title>

        <q-btn
          v-if="!linkedBank.balance && linkedBank.link"
          round
          color="secondary"
          :href="linkedBank.link"
          icon="link"
        />
        <q-btn
          round
          color="red"
          @click="handleDeleteBank(linkedBank.id)"
          icon="close"
        />
      </q-toolbar>
      <q-btn
        :color="'secondary'"
        icon="add"
        @click="showBankSelector = true"
        class="q-my-md full-width"
      >
      </q-btn>
    </div>
    <div v-else class="col-10">
      <div class="column">
        <q-btn
          v-if="accounts.length"
          label="Mis bancos conectados"
          @click="showBankSelector = false"
          color="secondary"
        />
      </div>
      <div class="row q-gutter-md flex-center">
        <div
          class="col-4 col-sm-3 col-md-2 cursor-pointer text-center"
          v-for="bank in preBanks"
          :key="bank.id"
          @click="bank_selected = bank"
        >
          <q-btn
            :color="
              bank_selected && bank.id === bank_selected.id ? 'primary' : ''
            "
            class="q-pa-md"
          >
            <img class="full-width" :src="bank.logo" />
          </q-btn>
        </div>
      </div>
      <div class="column q-gutter-md">
        <q-select
          v-model="bank_selected"
          :options="banks"
          option-value="id"
          option-label="name"
          :label="'Encuentra tu banco'"
          :loading="loading"
        />
        <q-btn
          v-if="bank_selected"
          label="Conecta tu banco"
          @click="handleLinkBank"
          color="secondary"
          :loading="loading"
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import { analytics } from 'src/boot/firebase';
import { useAuthApi } from 'src/factories/useAuthApi';
import { useBanksApi } from 'src/factories/useBanksApi';
import { useLoading } from 'src/factories/useLoading';
import { useUserApi } from 'src/factories/useUserApi';
import { computed, defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  name: 'Banks',
  components: {},
  setup() {
    const {
      linkBank,
      getBanks,
      getBankDetails,
      getAccounts,
      banks,
      bank_selected,
      selectBank,
      accounts,
    } = useBanksApi();
    const { showLoading, hideLoading, loading } = useLoading();
    const $q = useQuasar();
    const { getUserBanks, linkedBanks, deleteUserBank } = useUserApi();
    const { userId } = useAuthApi();
    const showBankSelector = ref(false);
    const showBanner = ref(false);
    //TODO preslected banks ids
    const preBanks = computed(() => {
      const s = [
        'ING_INGDESMM',
        'BBVA_BBVAESMM',
        'CAJASUR_CSURES2C',
        'CAIXABANK_CAIXESBB',
        'SANTANDER_BSCHESMM',
      ];
      return banks.value.filter((bank) => s.includes(bank.id));
    });
    const _init = async () => {
      showLoading();
      await getUserBanks(userId.value);
      await getBanks();
      await getAccounts();

      if (!linkedBanks.value.length) {
        // } else {
        showBankSelector.value = true;
      }
      hideLoading();
    };
    onMounted(async () => {
      await _init();
    });
    const handleSelectUserBank = async (bank_id: string) => {
      analytics.logEvent('banco_reintentar_link');
      showLoading();
      const bankSelected = getBankDetails(bank_id);
      if (bankSelected) {
        selectBank(bankSelected);
      }
      await linkBank();
      hideLoading();
    };
    const handleDeleteBank = (bankId: string) => {
      $q.dialog({
        title: 'Seguro que deseas borrarlo?',
        cancel: true,
        persistent: true,
      })
        .onOk(() => {
          //TODO delete bank form firebase
          analytics.logEvent('banco_borrar');
          console.log('deleting');
          void deleteUserBank(bankId, userId.value).then(() => {
            void _init();
          });
        })
        .onCancel(() => {
          console.log('canceling');
        });
    };
    const handleLinkBank = async () => {
      analytics.logEvent('banco_añadir');
      showLoading();
      await linkBank();
      hideLoading();
    };
    return {
      handleLinkBank,
      getBanks,
      getUserBanks,
      getBankDetails,
      handleSelectUserBank,
      handleDeleteBank,
      showBanner,
      accounts,
      banks,
      linkedBanks,
      bank_selected,
      loading,
      preBanks,
      showBankSelector,
    };
  },
});
</script>
