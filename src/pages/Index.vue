<template>
  <q-page class="">
    <div class="row flex-center">
      <div class="col-11 col-sm-7 col-md-5">
        <div v-if="userName" class="text-h4 text-bold text-primary q-mt-md">
          Hola {{ userName }},
        </div>
        <div v-if="userName" class="text-bold text-h5">
          Qué alegría verte de nuevo...
        </div>
        <card-avatar
          v-if="!userName"
          :title="fillUserDetailsCard.title"
          :subtitle="fillUserDetailsCard.subtitle"
          :avatar="ownerPic"
        >
          <template #body>
            <div class="text-h6">Bienvenid@ a finanfox,</div>
            <div class="text-grey-7">
              ¿Qué tal si nos cuentas algo más sobre ti? ¿Cómo te llamas?
            </div>
          </template>
          <template #ctas
            ><div class="flex flex-center">
              <q-btn
                v-for="cta in fillUserDetailsCard.ctas"
                :key="cta.label"
                :label="cta.label"
                @click="cta.exec"
                :color="cta.color"
              />
            </div>
          </template>
        </card-avatar>
        <card-avatar
          v-else-if="!linkedBanks.length"
          :title="connectBankCard.title"
          :subtitle="connectBankCard.subtitle"
          :avatar="ownerPic"
        >
          <template #body>
            <div class="text-h6">"Bienvenid@ a finanfox,</div>
            <div class="text-grey-7">
              Qué tal si empiezas conectando tu banco. Es un proceso 100%
              privado que me ayudará a asesorarte mejor sin tediosos
              formularios"
            </div>
          </template>
          <template #ctas
            ><div class="flex flex-center">
              <q-btn
                v-for="cta in connectBankCard.ctas"
                :key="cta.label"
                :label="cta.label"
                @click="cta.exec"
                :color="cta.color"
              />
            </div>
          </template>
        </card-avatar>

        <card-avatar
          v-if="userProducts.length"
          :title="investmentsCard.title"
          :subtitle="investmentsCard.subtitle"
          :avatar="ownerPic"
        >
          <template #body>
            <div class="text-h6">
              "Ya he añadido en tu sección Mi planificación todos tus productos
              :) "
            </div>
            <!-- TODO products widget info -->
          </template>
          <template #ctas
            ><div class="flex flex-center">
              <q-btn
                v-for="cta in investmentsCard.ctas"
                :key="cta.label"
                :label="cta.label"
                @click="cta.exec"
                :color="cta.color"
              />
            </div>
          </template>
        </card-avatar>

        <card-avatar
          v-for="prod in products"
          :key="prod.name"
          :title="productCard.title"
          :avatar="ownerPic"
          :subtitle="productCard.subtitle"
        >
          <template v-if="isUserProduct(prod.id)" #left>
            <q-badge align="right" color="info">CONTRATADO</q-badge>
          </template>
          <template #body>
            <div class="text-h6">
              {{ prod.name }}
            </div>
            <div v-if="prod.video" class="row video-wrapper q-mb-md">
              <iframe class="col-12" :src="prod.video"> </iframe>
            </div>
            <div class="column q-gutter-md">
              <card-product
                :title="'Primero lo menos bueno'"
                :features="prod.bad"
                accent
              />
              <card-product
                :title="'Y ahora lo mejor'"
                :features="prod.good"
                positive
              />
            </div>
          </template>

          <template #ctas
            ><div class="flex flex-center">
              <q-btn
                v-for="cta in productCard.ctas"
                :key="cta.label"
                :label="cta.label"
                @click="cta.exec(prod.name)"
                :color="cta.color"
                no-caps
              />
            </div>
          </template>
        </card-avatar>

        <card-avatar
          :title="referralCard.title"
          :subtitle="referralCard.subtitle"
          :avatar="ownerPic"
        >
          <template #body>
            <div class="text-h6">
              "¿Sabías que por recomendarnos ganas 50€ y tu amig@ otros 50€?"
            </div>
            <div class="flex flex-center q-ma-md">
              <div
                class="row no-wrap bg-light-green-7 q-pa-md text-white rounded-borders"
              >
                <div class="flex flex-center text-h3 primary-font q-pr-md">
                  +50€
                </div>
                <div class="flex flex-center text-h2">|</div>
                <div class="flex flex-center text-h6 q-pl-md">
                  Recomiendanos y gana
                </div>
              </div>
            </div>
          </template>
          <template #ctas
            ><div class="flex flex-center">
              <q-btn
                v-for="cta in referralCard.ctas"
                :key="cta.label"
                :label="cta.label"
                @click="cta.exec"
                :color="cta.color"
              />
            </div>
          </template>
        </card-avatar>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { analytics } from 'src/boot/firebase';
import CardAvatar from 'src/components/CardAvatar.vue';
import CardProduct from 'src/components/CardProduct.vue';
import { useAuthApi } from 'src/factories/useAuthApi';
import { useHubspotApi } from 'src/factories/useHubspotApi';
import { useLoading } from 'src/factories/useLoading';
import { useProductsApi } from 'src/factories/useProductsApi';
import { useUserApi } from 'src/factories/useUserApi';
import { defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'PageIndex',
  components: { CardAvatar, CardProduct },
  setup() {
    const { userId } = useAuthApi();
    const { showLoading, hideLoading } = useLoading();
    const { contact, ownerPic, selectProduct } = useHubspotApi();
    const router = useRouter();
    const { getProductsBy, products } = useProductsApi();
    const {
      getUserProducts,
      products: userProducts,
      isUserProduct,
      getUserBanks,
      linkedBanks,
    } = useUserApi();
    const userName = contact.value?.firstname || '';
    const connectBankCard = ref({
      title: contact.value?.hubspot_owner_name,
      subtitle: 'Tu planificador financiero',
      ctas: [
        {
          label: 'Conecta tu banco',
          color: 'secondary',
          exec: async () => {
            analytics.logEvent('conecta_banco_dashboard');
            await router.push('/banks');
          },
        },
      ],
    });
    const fillUserDetailsCard = ref({
      title: contact.value?.hubspot_owner_name,
      subtitle: 'Tu planificador financiero',
      ctas: [
        {
          label: 'Completar mi perfil',
          color: 'secondary',
          exec: async () => {
            // analytics.logEvent('conecta_banco_dashboard');
            await router.push('/account');
          },
        },
      ],
    });
    const investmentsCard = ref({
      title: contact.value?.hubspot_owner_name,
      subtitle: 'Tu planificador financiero',
      ctas: [
        {
          label: 'Ir a Mi planificación',
          color: 'secondary',
          exec: async () => {
            await router.push('/investments');
          },
        },
      ],
    });
    const referralCard = ref({
      title: contact.value?.hubspot_owner_name,
      subtitle: 'Tu planificador financiero',
      ctas: [
        {
          label: 'Recomienda finanfox',
          color: 'secondary',
          exec: async () => {
            analytics.logEvent('referral_card');
            await router.push('/referral');
          },
        },
      ],
    });
    const productCard = ref({
      title: contact.value?.hubspot_owner_name,
      subtitle: 'Según tu objetivo principal te recomiendo:',
      ctas: [
        {
          label: `Agenda una reunión con ${
            contact.value?.hubspot_owner_name || ''
          }`,
          color: 'primary',
          exec: async (productName: string) => {
            selectProduct(productName);
            analytics.logEvent('reunion_dashboard', { product: productName });
            await router.push('/meetings');
          },
        },
        // {
        //   label: 'Si ya lo tienes claro, solicita contratación',
        //   color: 'secondary',
        //   exec: () => {
        //     //TODO
        //   },
        // },
      ],
    });
    // const userName = contact.value?.firstname;
    // const ownerEmail = contact.value?.hubspot_owner_email;
    onMounted(async () => {
      showLoading();
      const objective = contact.value?.objetivo_1?.toLowerCase() || '';
      const range =
        contact.value?.plazo_objetivo_financiero_principal
          ?.split(' ')[0]
          .toLowerCase() || '';

      await getProductsBy(range, objective);
      await getUserProducts(userId.value);
      await getUserBanks(userId.value);

      hideLoading();
    });
    return {
      userId,
      userName,
      connectBankCard,
      investmentsCard,
      referralCard,
      productCard,
      ownerPic,
      products,
      userProducts,
      linkedBanks,
      fillUserDetailsCard,
      isUserProduct,
    };
  },
});
</script>
<style lang="scss" scoped>
.video-wrapper {
  height: 49vw;
  max-height: 450px;
}
</style>
