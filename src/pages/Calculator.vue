<template>
  <q-layout view="">
    <q-page>
      <CalculatorVue :objectiveId="'acortar_hipoteca'" />
      <CalculatorVue :objectiveId="'hijos'" />
      <CalculatorVue :objectiveId="'colchon'" />
    </q-page>
  </q-layout>
</template>

<script lang="ts">
import CalculatorVue from 'src/components/Calculator.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  components: { CalculatorVue },
  setup() {
    return {};
  },
});
</script>
