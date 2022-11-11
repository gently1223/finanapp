<template>
  <q-page class="q-pa-md">
    <div v-if="showOnboarding" class="q-pa-md">
      <q-carousel
        animated
        v-model="slide"
        swipeable
        transition-prev="slide-right"
        transition-next="slide-left"
        navigation
        ref="carousel"
        class="full-height q-my-md"
      >
        <template v-slot:navigation-icon="{ active, onClick }">
          <q-btn
            size="xs"
            icon="circle"
            :color="active ? 'blue' : 'grey'"
            flat
            round
            dense
            @click="onClick"
          ></q-btn>
        </template>
        <q-carousel-slide :name="1" class="row justify-center text-center">
          <div class="col-6 col-sm-12">
            <img class="onboarding-img" src="images/onboarding-1.png" />
          </div>
          <p class="col-6 col-sm-12 text-primary text-h5">
            HAZ QUE TU DINERO TRABAJE POR TI
          </p>
          <p class="col-12 q-mb-xl">
            Accede a distintas opciones de inversión según tus objetivos
            financieros, buscando la máxima rentabilidad y de la mano de
            planificadores financieros acreditados
          </p>
        </q-carousel-slide>
        <q-carousel-slide :name="2" class="row justify-center text-center">
          <div class="col-6 col-sm-12">
            <img class="onboarding-img" src="images/onboarding-2.png" />
          </div>
          <p class="col-6 col-sm-12 text-primary text-h5">
            ENTIENDO QUÉ POR QUÉ Y PARA QUÉ
          </p>
          <p class="col-12 q-mb-xl">
            Te explicamos todo al detalle sin dejarnos nada, de forma totalmente
            transparente y con un lenguaje sencillo y fácil de entender
          </p>
        </q-carousel-slide>
        <q-carousel-slide :name="3" class="row justify-center text-center">
          <div class="col-6 col-sm-12">
            <img class="onboarding-img" src="images/onboarding-3.png" />
          </div>
          <p class="col-6 col-sm-12 text-primary text-h5">SIN COSTE PARA TI</p>
          <p class="col-12 q-mb-xl">
            Trabajamos con más de 80 entidades financieras (bancos,
            aseguradoras, fintech) y en vez de cobrarte a ti, les cobramos a
            ellas
          </p>
        </q-carousel-slide>
        <q-carousel-slide :name="4" class="row justify-center text-center">
          <div class="col-6 col-sm-12">
            <img class="onboarding-img" src="images/onboarding-4.png" />
          </div>
          <p class="col-6 col-sm-12 text-primary text-h5">
            TODO ELLO DE LA MANO DE FINANFOX
          </p>
          <p class="col-12 q-mb-xl">
            La <b>Mejor Empresa de Planificación Financiera</b> de España 2021 y
            2022 con más de 140 reseñas en Google con una media de 5 estrellas
          </p>
        </q-carousel-slide>
      </q-carousel>
      <div class="row justify-center">
        <q-btn
          v-if="slide < 4"
          label="Continuar"
          color="primary"
          @click="handleNextClick(false)"
        >
        </q-btn>
        <q-btn
          v-else
          label="Comenzar"
          color="primary"
          @click="handleNextClick(true)"
        >
        </q-btn>
      </div>
    </div>
    <div v-else class="row flex-center">
      <dynamic-form
        @onSubmit="onSubmit"
        @onReset="onReset"
        :formId="formID"
        v-model="onboardingForm"
        :radioList="true"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
// import { useQuasar } from 'quasar';
import { QCarousel } from 'quasar';
import { analytics } from 'src/boot/firebase';
import DynamicForm from 'src/components/DynamicForm.vue';
import { FormOnboarding } from 'src/components/models';
import { FORMS, useHubspotApi } from 'src/factories/useHubspotApi';
import { useLoading } from 'src/factories/useLoading';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'PageIndex',
  components: { DynamicForm },
  setup() {
    // const $q = useQuasar();
    const router = useRouter();
    const { submitForm, contact, getContact } = useHubspotApi();
    const { showLoading, hideLoading } = useLoading();
    const onboardingForm = ref<FormOnboarding>({
      objetivo_1: '',
      plazo_objetivo_financiero_principal: '',
      capacidad_de_ahorro_mensual: 0,
    });
    const slide = ref(1);
    const onboarding = ref(true);
    const showOnboarding = computed(
      () => !!!contact.value?.dni_nie && onboarding.value
    );
    const carousel = ref<QCarousel>();
    const formID = ref(FORMS.onboarding);
    onMounted(() => {
      onReset();
    });
    const onReset = () => {
      onboardingForm.value = {
        objetivo_1: '',
        plazo_objetivo_financiero_principal: '',
        capacidad_de_ahorro_mensual: 0,
      };
    };
    const onSubmit = async (data: FormOnboarding) => {
      showLoading();
      analytics.logEvent('onboarding_submit');
      await submitForm(formID.value, {
        objetivo_1: data.objetivo_1,
        plazo_objetivo_financiero_principal:
          data.plazo_objetivo_financiero_principal,
        capacidad_de_ahorro_mensual: data.capacidad_de_ahorro_mensual,
      });
      await getContact();
      //Go to dashboard/home page
      await router.push('/');
      hideLoading();
    };
    const handleNextClick = (end: boolean) => {
      if (end) {
        analytics.logEvent('onboarding_fin');
        console.log('onboadring fin');
        onboarding.value = false;
      } else {
        analytics.logEvent(`onboarding_next_${slide.value}`);
        console.log('Onboarding next', slide.value);
        if (carousel.value) {
          carousel.value.next();
        }
      }
    };
    return {
      onReset,
      onSubmit,
      handleNextClick,
      onboarding,
      showOnboarding,
      slide,
      onboardingForm,
      carousel,
      formID,
    };
  },
});
</script>
<style lang="scss" scoped>
.onboarding-img {
  width: 100%;
  max-width: 200px;
}
</style>
