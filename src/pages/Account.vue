<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-6">
        <div class="text-h4 q-py-md">Tus datos personales</div>
        <dynamic-form
          @submit="onSubmit"
          @reset="onReset"
          label="Guardar"
          :formId="formID"
          v-model="contactForm"
          :loading="loading"
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { analytics } from 'src/boot/firebase';
import DynamicForm from 'src/components/DynamicForm.vue';
import { FormContact } from 'src/components/models';
import { FORMS, useHubspotApi } from 'src/factories/useHubspotApi';
import { defineComponent, onMounted, ref } from 'vue';
// import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'PageIndex',
  components: { DynamicForm },
  setup() {
    // const $q = useQuasar();
    // const router = useRouter();
    const { submitForm, contact, getContact } = useHubspotApi();
    const loading = ref(false);
    const contactdata = contact.value;
    const formData = {
      firstname: contactdata?.firstname || '',
      lastname: contactdata?.lastname || '',
      phone: contactdata?.phone || '',
      dni_nie: contactdata?.dni_nie || '',
      fecha_de_nacimiento: contactdata?.date_of_birth || '',
      address: contactdata?.address || '',
      zip: contactdata?.zip || '',
      city: contactdata?.city || '',
      state: contactdata?.state || '',
    };
    const contactForm = ref<FormContact>(formData);
    const formID = ref(FORMS.contact);
    onMounted(() => {
      onReset();
    });
    const onReset = () => {
      contactForm.value = { ...formData };
    };
    const onSubmit = async () => {
      loading.value = true;
      analytics.logEvent('mi_cuenta_guardar');
      //send form id
      await submitForm(FORMS.contact, {
        //add form fields
        ...contactForm.value,
      });
      await getContact();
      loading.value = false;
    };
    return {
      onReset,
      onSubmit,
      formID,
      contactForm,
      loading,
    };
  },
});
</script>
