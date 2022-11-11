<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-11 col-md-10">
        <q-expansion-item
          popup
          group="test"
          icon="house"
          label="Bienes inmuebles"
          header-class="text-h6"
        >
          <q-separator />
          <dynamic-form
            @submit="onSubmit(formPropertiesId, propertiesForm)"
            @reset="onReset"
            label="Guardar"
            :formId="formPropertiesId"
            v-model="propertiesForm"
            class="q-gutter-md q-pa-md"
            :loading="loading"
          />
        </q-expansion-item>
        <q-expansion-item
          group="test"
          popup
          icon="mdi-bullseye-arrow"
          label="Objetivos para asesoramiento"
          header-class="text-h6"
        >
          <q-separator />
          <dynamic-form
            @submit="onSubmit(formObjectivesId, objectivesForm)"
            @reset="onReset"
            label="Guardar"
            :formId="formObjectivesId"
            v-model="objectivesForm"
            class="q-gutter-md q-pa-md"
            :loading="loading"
          />
        </q-expansion-item>
        <!-- <div class="text-h4 q-py-md">Objetivos para asesoramiento</div> -->
        <q-expansion-item
          popup
          group="test"
          icon="family_restroom"
          label="Situacion familiar"
          header-class="text-h6"
        >
          <q-separator />
          <dynamic-form
            @submit="onSubmit(formFamilyId, familyForm)"
            @reset="onReset"
            label="Guardar"
            :formId="formFamilyId"
            v-model="familyForm"
            class="q-gutter-md q-pa-md"
            :loading="loading"
          />
        </q-expansion-item>
        <!-- <div class="text-h4 q-py-md">Situacion familiar</div> -->
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import { analytics } from 'src/boot/firebase';
import DynamicForm from 'src/components/DynamicForm.vue';
import { FORMS, useHubspotApi } from 'src/factories/useHubspotApi';
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  name: 'Objectives',
  components: { DynamicForm },
  setup() {
    const $q = useQuasar();
    const { submitForm, loading } = useHubspotApi();
    const { contact } = useHubspotApi();
    const formObjectivesId = ref(FORMS.objectives);
    const formFamilyId = ref(FORMS.family);
    const formPropertiesId = ref(FORMS.properties);
    const contactdata = { ...contact.value };
    const objectivesFormData = {
        objetivo_1: contactdata.objetivo_1 || '',
        plazo_objetivo_1: contactdata.plazo_objetivo_1 || '',
        producto_objetivo_1: contactdata.producto_objetivo_1 || '',
        aportacion_objetivo_1: contactdata.aportacion_objetivo_1 || '',
        objetivo_2: contactdata.objetivo_2 || '',
        plazo_objetivo_2: contactdata.plazo_objetivo_2 || '',
        producto_objetivo_2: contactdata.producto_objetivo_2 || '',
        aportacion_objetivo_2: contactdata.aportacion_objetivo_2 || '',
        objetivo_3: contactdata.objetivo_3 || '',
        plazo_objetivo_3: contactdata.plazo_objetivo_3 || '',
        producto_objetivo_3: contactdata.producto_objetivo_3 || '',
        aportacion_objetivo_3: contactdata.aportacion_objetivo_3 || '',
      },
      familyFormData = {
        jobtitle: contactdata.jobtitle || '',
        hijos: contactdata.hijos || '',
        nombre_hijo_1: contactdata.nombre_hijo_1 || '',
        fecha_de_nacimiento_hijo_1:
          contactdata.fecha_de_nacimiento_hijo_1 || '',
        nombre_hijo_2: '',
        fecha_de_nacimiento_hijo_2: '',
        nombre_hijo_3: '',
        fecha_de_nacimiento_hijo_3: '',
      },
      propertiesFormData = {
        tipo_de_inmueble_1: contactdata.tipo_de_inmueble_1 || '',
        estado_del_inmueble_1: contactdata.estado_del_inmueble_1 || '',
        capital_restante_hipoteca_1:
          contactdata.capital_restante_hipoteca_1 || '',
        anos_restantes_hipoteca_1: contactdata.anos_restantes_hipoteca_1 || '',
        cuota_mensual_hipoteca_1: contactdata.cuota_mensual_hipoteca_1 || '',
        tipo_de_inmueble_2: contactdata.tipo_de_inmueble_2 || '',
        estado_del_inmueble_2: contactdata.estado_del_inmueble_2 || '',
        capital_restante_hipoteca_2:
          contactdata.capital_restante_hipoteca_2 || '',
        anos_restantes_hipoteca_2: contactdata.anos_restantes_hipoteca_2 || '',
        cuota_mensual_hipoteca_2: contactdata.cuota_mensual_hipoteca_2 || '',
      };
    const objectivesForm = ref(objectivesFormData);
    const familyForm = ref(familyFormData);
    const propertiesForm = ref(propertiesFormData);
    const submitLoading = ref(false);
    onMounted(() => {
      onReset();
    });
    const onReset = () => {
      objectivesForm.value = { ...objectivesFormData };
    };
    const onSubmit = async (
      formId: string,
      formData: { [key: string]: unknown }
    ) => {
      submitLoading.value = true;
      //send form id
      console.log(formId, formData);
      switch (formId) {
        case FORMS.objectives:
          analytics.logEvent('objetivos_objetivos_guardar');
          break;
        case FORMS.family:
          analytics.logEvent('objetivos_situacion_guardar');
          break;
        case FORMS.properties:
          analytics.logEvent('objetivos_bienes_guardar');
          break;
      }
      await submitForm(formId, {
        //add form fields
        ...formData,
      });
      submitLoading.value = true;

      $q.dialog({
        title: 'Datos guardados correctamente',
      });
    };
    return {
      formObjectivesId,
      objectivesForm,
      formFamilyId,
      familyForm,
      formPropertiesId,
      propertiesForm,
      loading,
      onSubmit,
      onReset,
    };
  },
});
</script>
