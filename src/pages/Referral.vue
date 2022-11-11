<template>
  <q-page class="q-pa-md">
    <div class="row flex-center">
      <div class="col-12 col-md-6">
        <q-card class="bg-secondary text-center">
          <q-card-section class="text-grey-2">
            <div class="text-h5 text-bold">
              {{ userName || 'Sin nombre' }}, recomienda Finanfox y gana 50€.
            </div>
            <div class="text-h6">
              Invita a un amigo a descubrir Finanfox, si contrata cualquier
              producto de inversión ambos recibiréis 50€
            </div>
          </q-card-section>
          <q-card-section>
            <q-input
              filled
              label="Email de tu amigo"
              v-model="email"
              color="white"
              label-color="white"
              input-class="text-white"
              :rules="[
                (val) =>
                  !referrals.includes(val) || 'Ya has invitado a este amigo',
                (val) => userEmail !== val || 'No te puedes invitar a ti mismo',
                validEmail,
              ]"
            >
              <template v-slot:after>
                <q-btn
                  dense
                  flat
                  icon="send"
                  :loading="sendingForm"
                  :disable="sendingForm"
                  color="white"
                  @click="send"
                />
              </template>
            </q-input>
          </q-card-section>
        </q-card>
        <div class="text-h4 q-py-md">Tus invitaciones:</div>
        <q-linear-progress indeterminate v-if="loading" />
        <q-card v-else>
          <q-list bordered>
            <template v-for="refer in referralsDeals" :key="refer.refered">
              <q-item>
                <q-item-section avatar>
                  <q-avatar>
                    <q-img :src="getAnimal()" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-bold">{{
                    refer.refered
                  }}</q-item-label>
                  <q-item-label>
                    <q-badge :color="getReferralStatus(refer.deals).color"
                      >{{ getReferralStatus(refer.deals).label }}
                    </q-badge></q-item-label
                  >
                </q-item-section>
              </q-item>
              <q-separator spaced />
            </template>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import { analytics } from 'src/boot/firebase';
import { useAnimals } from 'src/factories/useAnimals';
import { useHubspotApi, FORMS } from 'src/factories/useHubspotApi';
// import { useLoading } from 'src/factories/useLoading';
import { useRules } from 'src/factories/useRules';
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  name: 'Referral',
  components: {},
  setup() {
    const $q = useQuasar();
    const {
      contact,
      updateContact,
      submitForm,
      referrals,
      getContact,
      getReferralDeals,
      referralsDeals,
      loading,
    } = useHubspotApi();
    const userName = ref(contact.value?.firstname || '');
    const userEmail = ref(contact.value?.email || '');
    const email = ref('');
    const { getAnimal } = useAnimals();
    // const { showLoading, hideLoading } = useLoading();
    const { validEmail } = useRules();
    const sendingForm = ref(false);
    const send = async () => {
      sendingForm.value = true;
      analytics.logEvent('referral_sent');
      const allRefers = [...referrals.value, email.value].join('\n');
      console.log(allRefers);
      // showLoading();
      try {
        const err = await submitForm(FORMS.referral, {
          email: email.value,
          referido_por: contact.value?.email,
          referido_por_nombre: contact.value
            ? `${contact.value.firstname} ${contact.value.lastname}`
            : '',
        });
        if (!err) {
          await updateContact({
            referidos: allRefers,
          });
          await getContact();
          await getReferralDeals();
        } else {
          //show erro moda
          console.log('error referral', err.message);
          $q.dialog({
            title: 'Ups',
            message: err.message,
          });
        }
      } catch (error) {
        console.log(error);
        $q.dialog({
          title: 'Error',
          message: 'Contacte con nuestro equipo',
        });
      }
      sendingForm.value = false;

      // hideLoading();
    };
    onMounted(async () => {
      await getReferralDeals();
    });
    const getReferralStatus = (
      deals: { properties: { [key: string]: { value: string } } }[]
    ) => {
      if (
        deals.find(
          (d) =>
            d.properties.dealstage &&
            d.properties.dealstage.value === 'closedwon'
        )
      ) {
        return { color: 'green', label: 'Ya es cliente' };
      }
      // if (deals.length) {
      //   return { color: 'orange', label: 'Registrado' };
      // }
      return { color: 'secondary', label: 'Todavía no es cliente' };
    };
    return {
      userName,
      userEmail,
      email,
      send,
      referrals,
      getAnimal,
      validEmail,
      referralsDeals,
      getReferralStatus,
      loading,
      sendingForm,
    };
  },
});
</script>
