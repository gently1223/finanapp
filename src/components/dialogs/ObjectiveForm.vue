<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section class="q-gutter-md column">
        <div class="text-h4">{{ title }}</div>
        <q-input v-model="formModel['name']" label="Nombre del objetivo" />
        <!-- <q-input
          type="textarea"
          v-model="formModel['description']"
          label="Descripción"
        /> -->
        <q-select
          :options="products"
          v-model="productSelected"
          label="Producto principal asociado"
          option-value="id"
          option-label="name"
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
import { defineComponent, onMounted, PropType, ref, watch } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { Objective, Product } from '../models';
// import { Product, UserProduct } from '../models';

export default defineComponent({
  components: {},
  props: {
    title: {
      type: String,
      default: 'Seguro?',
    },
    modelValue: {
      type: Object as PropType<Objective>,
      default: () => ({}),
    },
    products: {
      type: Array as PropType<Product[]>,
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
    const productSelected = ref<Product>();
    const addingObjective = ref(false);
    const formModel = ref<Objective>({
      ...props.modelValue,
    });
    const save = () => {
      console.log(formModel.value);
      onDialogOK({ ...formModel.value });
    };

    onMounted(() => {
      if (props.modelValue.main_product) {
        productSelected.value = props.products.find(
          (el) => el.id === props.modelValue.main_product
        );
      }
    });

    watch(
      () => productSelected.value,
      (value) => {
        if (value) {
          formModel.value.main_product = value.id;
        }
      }
    );

    return {
      dialogRef,
      formModel,
      addingObjective,
      productSelected,
      onDialogHide,
      onDialogOK,
      onDialogCancel,
      save,
    };
  },
});
</script>

<style lang="scss" scoped></style>
