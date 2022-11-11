<template>
  <q-layout view="">
    <q-page>
      <div class="row justify-center bg-primary background-banner">
        <img :src="'images/finanfox-logo.png'" width="135" />
      </div>
      <div class="row justify-center">
        <q-card class="col-11 col-sm-8 col-md-6 col-lg-4">
          <q-card-section class="">
            <q-form
              @submit="submit(false)"
              ref="loginForm"
              class="row justify-center"
            >
              <div class="col-12 text-center text-h4 primary-font">LOGIN</div>
              <q-input
                type="text"
                label="Email"
                v-model="email"
                class="col-11 col-md-7 q-my-md"
                :rules="[
                  (val) => (val && val.length > 0) || 'Introduzca email',
                  validEmail,
                ]"
              />
              <q-input
                v-if="!forgotPass"
                :type="isPwd ? 'password' : 'text'"
                label="Contraseña"
                v-model="pass"
                class="col-11 col-md-7 q-my-md"
                :rules="[
                  (val) => (val && val.length > 0) || 'Contraseña requerida',
                ]"
              >
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>
              <span
                class="col-11 col-md-7 text-blue-5 text-bold cursor-pointer"
                @click="forgotPass = !forgotPass"
                >{{ forgotPass ? 'Volver a Login' : forgotPassText }}</span
              >
              <div class="col-10 col-md-7 column">
                <q-btn
                  v-if="!forgotPass"
                  :label="'Entra en Finanfox'"
                  type="submit"
                  class="q-my-md"
                  color="primary"
                />

                <q-btn
                  v-else
                  :label="'Enviar email'"
                  @click="resetPass"
                  class="q-my-md"
                  color="primary"
                />
                <q-separator />
                <!-- <q-btn
                  v-if="provider"
                  label="Entra con email y contraseña"
                  @click="selectProvider('')"
                  class="q-my-md"
                  color="secondary"
                />
                <q-btn
                  v-else
                  label="Entra con Google"
                  @click="selectProvider('google')"
                  class="q-my-md"
                  color="secondary"
                /> -->
                <q-btn
                  class="q-my-md"
                  color="white"
                  text-color="black"
                  align="around"
                  @click="submit(true)"
                >
                  <q-icon name="img:icons/g-logo.png" />

                  <span class="col-10">Entra con Google</span>
                </q-btn>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </q-page>
  </q-layout>
</template>

<script lang="ts">
import { useAuthApi } from 'src/factories/useAuthApi';
import { defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { QForm, useQuasar } from 'quasar';
import { useLoading } from 'src/factories/useLoading';
import { useRules } from 'src/factories/useRules';
import { analytics } from 'src/boot/firebase';
// import { useHubspotApi } from 'src/factories/useHubspotApi';
export default defineComponent({
  name: 'PageIndex',
  components: {},
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const { showLoading, hideLoading } = useLoading();
    const { loginWithGoogle, loginWithPass, resetEmailPass } = useAuthApi();
    const { validEmail } = useRules();
    // const { contactExists } = useHubspotApi();
    // const provider = ref('');
    const email = ref(''),
      pass = ref(''),
      isPwd = ref(true),
      forgotPass = ref(false),
      forgotPassText = ref('¿Olvidaste la contraseña?');
    const loginForm = ref<QForm | null>(null);
    const loginLabel = ref('Entra en Finanfox');
    onMounted(() => {
      console.log(router.currentRoute.value);
      const currentRoute = router.currentRoute.value;
      if (currentRoute.query.email) {
        email.value = String(currentRoute.query.email);
        forgotPassText.value =
          '¿Te ha invitado un amigo? Genera tu contraseña aquí';
      }
    });
    const submit = async (provider: boolean) => {
      let user:
        | firebase.default.User
        | null
        | undefined
        | firebase.default.auth.AuthError;
      //TODO check the user exists in hubspot email.value
      // const exists = await contactExists(email.value);
      // if (!exists) {
      //   $q.dialog({
      //     title: 'Error',
      //     message: 'Usuario sin registrar',
      //   });
      //   return;
      // }
      showLoading();

      if (provider) {
        analytics.logEvent('login_click');
        const res = await loginWithGoogle();
        user = res.user;
      } else {
        analytics.logEvent('signup_click');
        user = await loginWithPass(email.value, pass.value);
      }
      if (user?.email) {
        await router.push('/');
      } else {
        $q.dialog({
          title: 'Error',
          message: 'Email con contraseña incorrectos',
        });
      }
      hideLoading();
    };
    const resetPass = async () => {
      analytics.logEvent('password_reminder');
      const isValid = await loginForm.value?.validate();
      if (isValid) {
        const error = await resetEmailPass(email.value);
        if (error?.message) {
          $q.dialog({
            title: 'Error',
            message: error?.message,
          });
        }
        forgotPass.value = false;
      }
    };
    // const selectProvider = (providerValue: string) => {
    //   provider.value = providerValue;
    //   if (providerValue) {
    //     loginLabel.value = 'Entra con Google';
    //   } else {
    //     loginLabel.value = 'Entra en Finanfox';
    //   }
    // };
    // const handleLogin = async () => {
    //   const user = await loginWithPass(email.value, pass.value);
    //   if (user) {
    //     //Success login redirect to main page
    //     await router.push('/onboarding');
    //   }
    // };
    // const handleGoogleLogin = async () => {
    //   const res = await loginWithGoogle();
    //   if (res.user) {
    //     //Success login redirect to main page
    //     await router.push('/onboarding');
    //   }
    // };
    return {
      submit,
      validEmail,
      resetPass,
      // selectProvider,
      email,
      pass,
      loginForm,
      isPwd,
      forgotPass,
      // provider,
      loginLabel,
      forgotPassText,
    };
  },
});
</script>

<style lang="scss" scoped>
.background-banner {
  padding-top: map-get($space-xl, 'x');
  padding-bottom: 2 * map-get($space-xl, 'x');
  margin-bottom: -(map-get($space-xl, 'x'));
}
</style>
