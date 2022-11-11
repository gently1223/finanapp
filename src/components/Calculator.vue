<template>
  <div class="">
    <h3>Objetivo: {{ targetName }}</h3>

    <div class="calculator-wrapper row">
      <div class="product-info col-3">
        <h4>{{ productName }}</h4>
      </div>
      <div class="calculator col-6">
        <div class="calculator-form row">
          <div class="form-inputs">
            <q-input
              v-if="selectedProduct?.monthly"
              v-model.number="monthlyAmount"
              label-slot
            >
              <template v-slot:label>Aportación mensual</template>
            </q-input>
            <q-input v-else v-model.number="fixedAmount" label-slot>
              <template v-slot:label>Aportación</template>
            </q-input>
            <q-input
              v-model.number="yearsTerm"
              label-slot
              placeholder="Sin duración"
            >
              <template v-slot:label>Duración (años)</template>
            </q-input>
          </div>
          <!-- <div class="ctas">
            <q-btn color="primary" label="CALCULAR" />
          </div> -->
        </div>
        <line-chart :chartData="chartData" />
      </div>
      <div class="col-3">Resumen resultado</div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import LineChart from './LineChart.vue';
import { Product } from './models';

export default defineComponent({
  components: { LineChart },
  props: {
    objectiveId: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    //TODO get this from FB
    const objectives: { [key: string]: { name: string; main_type: string } } = {
      acortar_hipoteca: {
        name: 'Acortamiento de hipoteca',
        main_type: '1',
      },
      hijos: {
        name: 'Estudio de los hijos',
        main_type: '2',
      },
      colchon: {
        name: 'Colchon de seguridad',
        main_type: '3',
      },
    };
    const products: {
      [key: string]: Partial<Product>;
    } = {
      '1': {
        name: 'PIAS',
        average_profit: 7,
        compound: true,
        annual_cost: 1,
        //Costes iniciales del 70% sobre los primero 3000 antes de meter el dinero
        //2.25 del resto el primer año
        //Coste fijo primer año
        // first_cost: {
        //   //High interest apply to max
        //   max: 3000,
        //   high_interest: 70,
        //   //Low interest apply to upper max
        //   low_interest: 2.25,
        // },
        max_apex: 8000,
        monthly: true,
      },
      '2': {
        name: 'Renta variable',
        average_profit: 18,
        compound: true,
      },
      '3': {
        name: 'Cuenta renumerada 2,5%',
        fixed_profit: 2.5,
      },
    };
    const selectedProduct = ref<Partial<Product>>();
    //This is linked to the product as main_target
    const targetName = ref();
    const productName = ref();
    const monthlyAmount = ref(0),
      fixedAmount = ref(0),
      yearsTerm = ref(0);
    //TODO get this from dates tool
    const yearNow = 2022;
    onMounted(() => {
      const objective = objectives[props.objectiveId];
      selectedProduct.value = products[objective.main_type];
      targetName.value = objective.name;
      productName.value = selectedProduct.value.name;
    });
    const profitByYear = computed(() => {
      //Always look at fixed profit if not then try average
      const productInterest =
        (selectedProduct.value?.fixed_profit ||
          selectedProduct.value?.average_profit ||
          0) /
          100 +
        1;
      //Aportado anual, if monthly then monthly if not the normal amount
      let yearlyAmount = monthlyAmount.value * 12;
      let profit = fixedAmount.value || 0;
      return [...Array(yearsTerm.value).keys()].map((i) => {
        //Fixed amount multiplied by years passed or fixed amount provided by user
        const amount = fixedAmount.value
          ? fixedAmount.value
          : yearlyAmount * (i + 1);
        if (selectedProduct.value?.compound) {
          //Apply compound profit
          profit = (profit + yearlyAmount) * productInterest;
        } else {
          //Apply yearly profit
          profit += amount * (productInterest - 1);
        }
        //Apply fixed expenses the first year
        // if (i === 0) {
        //   profit -= selectedProduct.value?.fixed_cost || 0;
        // } else {
        //   //TODO apply yearly expenses
        // }
        //Apply yeraly expenses
        if (selectedProduct.value?.annual_cost) {
          profit -= profit * selectedProduct.value?.annual_cost;
        }
        return { label: yearNow + i, amount, profit };
      });
    });
    const chartData = computed(() => {
      return {
        labels: profitByYear.value.map((el) => el.label),
        datasets: [
          {
            label: 'Aportado',
            backgroundColor: '#f87910',
            data: profitByYear.value.map((el) => el.amount),
            tension: 0.5,
            fill: true,
          },
          {
            label: 'Disponible',
            backgroundColor: '#f87979',
            data: profitByYear.value.map((el) => el.profit),
            tension: 0.5,
            fill: '0',
          },
        ],
      };
    });
    return {
      targetName,
      productName,
      monthlyAmount,
      fixedAmount,
      yearsTerm,
      chartData,
      selectedProduct,
    };
  },
});
</script>
