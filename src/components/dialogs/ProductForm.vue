<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section class="q-gutter-md column">
        <div class="text-h4">{{ title }}</div>
        <div class="text-h5">INFORMACIÓN <b>PÚBLICA</b> DEL PRODUCTO</div>
        <q-toggle v-model="formModel['active']" label="Visible en la web" />
        <q-input
          v-model="formModel['name']"
          label="Nombre de cara al usuario"
        />
        <q-input
          type="textarea"
          v-model="formModel['description']"
          label="Descripción"
        />
        <q-input v-model="formModel['video']" label="Video URL" />
        <q-select
          multiple
          :options="types"
          v-model="formModel['types']"
          label="Filtros de Objetivo"
        />
        <q-select
          multiple
          :options="ranges"
          v-model="formModel['ranges']"
          label="Filtros de Plazos"
        />
        <div>
          <q-input v-model="listItemText.bad" label="Añade algo malo">
            <template v-slot:after>
              <q-btn
                round
                dense
                flat
                icon="add_circle"
                @click="handleAddListItem('bad')"
              />
            </template>
          </q-input>
          <dynamic-order-list
            v-if="formModel['bad']"
            :title="'Listado cosas malas :('"
            :items="formModel['bad']"
            switcher
          />
        </div>
        <div>
          <q-input v-model="listItemText.good" label="Añade algo bueno">
            <template v-slot:after>
              <q-btn
                round
                dense
                flat
                icon="add_circle"
                @click="handleAddListItem('good')"
              />
            </template>
          </q-input>
          <dynamic-order-list
            v-if="formModel['good']"
            :title="'Listado cosas buenas :)'"
            :items="formModel['good']"
            switcher
          />
        </div>
        <div class="text-h5">INFORMACIÓN <b>PRIVADA</b> DEL PRODUCTO</div>
        <q-select
          :options="partners"
          v-model="privateFormModel.partner"
          option-value="name"
          option-label="name"
          emit-value
          label="Partner"
        />
        <!-- TODO fill this from db of partner products -->
        <q-input
          v-model="privateFormModel.name"
          label="Nombre real del producto"
        />
        <div class="text-h5">
          INFORMACIÓN NECESARIA PARA LA <b>CALCULADORA</b>
        </div>

        <q-toggle
          v-model="formModel.compound"
          label="Interes compuesto"
          left-label
        />
        <q-toggle
          v-model="formModel.monthly"
          label="Aportacion mensual"
          left-label
        />

        <q-input
          type="number"
          v-model="formModel.fixed_profit"
          label="Rentabilidad fija(anual)"
        />
        <q-input
          type="number"
          v-model="formModel.average_profit"
          label="Rentabilidad media(anual)"
        />
        <q-input
          type="number"
          v-model="formModel.annual_cost"
          label="Coste anual(%)"
        />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="OK" @click="save" />
        <q-btn flat label="Cancelar" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { Partner, PrivateProduct, Product } from '../models';
import DynamicOrderList from '../DynamicOrderList.vue';
// import { Product, UserProduct } from '../models';

export default defineComponent({
  components: { DynamicOrderList },
  props: {
    title: {
      type: String,
      default: 'Seguro?',
    },
    modelValue: {
      type: Object as PropType<Product>,
      default: () => ({}),
    },
    partners: {
      type: Array as PropType<Partner[]>,
      default: () => [],
    },
  },
  emits: [
    // REQUIRED; need to specify some events that your
    // component will emit through useDialogPluginComponent()
    ...useDialogPluginComponent.emits,
  ],
  setup(props) {
    // REQUIRED; must be called inside of setup()
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent();
    const addingProduct = ref(false);
    console.log(props.modelValue.active);
    const formModel = ref<Product>({
      active: false,
      compound: false,
      monthly: false,
      ...props.modelValue,
    });
    const privateFormModel = ref<PrivateProduct>({
      name: props.modelValue.private?.name || '',
      partner: props.modelValue.private?.partner || '',
      // average_profit: props.modelValue.private?.average_profit || 0,
      // annual_profit: props.modelValue.private?.annual_profit || 0,
      // fixed_profit: props.modelValue.private?.fixed_profit || 0,
    });
    const ranges = ['corto', 'largo', 'medio'];
    //From hubspot
    const types = [
      'jubilación',
      'hijos',
      'acortamiento de hipoteca',
      'casa nueva',
      'negocio',
      'obtener rentabilidad',
      'colchón de seguridad',
      'protección',
    ];
    const listItemText = ref({
      bad: '',
      good: '',
    });
    const save = () => {
      console.log(formModel.value);
      onDialogOK({ ...formModel.value, private: privateFormModel.value });
    };
    const handleAddListItem = (param: 'bad' | 'good') => {
      if (!formModel.value[param]) {
        formModel.value[param] = [];
      }
      formModel.value[param].push(listItemText.value[param]);
      listItemText.value[param] = '';
    };

    return {
      dialogRef,
      formModel,
      addingProduct,
      ranges,
      types,
      listItemText,
      privateFormModel,
      onDialogHide,
      onDialogOK,
      onDialogCancel,
      save,
      handleAddListItem,
    };
  },
});
</script>

<style lang="scss" scoped></style>
