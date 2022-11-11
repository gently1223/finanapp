<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section v-if="modelValue.fb_id" class="q-gutter-md column">
        <div class="text-h5">Detalles del contacto</div>
        <q-input v-model="formModel['firstname']" label="Nombre" disable />
        <q-input v-model="formModel['lastname']" label="Apellidos" disable />
        <q-input v-model="formModel['email']" label="Email" disable />
        <q-btn
          label="Enviar correo recuperación contraseña"
          color="secondary"
          @click="handleSendResetEmail"
          :loading="loadingResetPass"
        />
        <div class="text-h5">Productos</div>
        <div v-if="addingProduct" class="row justify-center q-gutter-md">
          <div class="text-h6">
            {{ productModel.id ? 'Editando producto' : 'Nuevo producto' }}
          </div>
          <q-select
            class="col-11"
            :options="products"
            v-model="productSelected"
            option-value="id"
            option-label="name"
            label="Product"
          />
          <q-input
            label="Apex/Aportación inicial"
            v-model.number="productModel.apex"
            type="number"
          />
          <q-input
            label="Mensual"
            v-model.number="productModel.monthly"
            type="number"
          />
          <q-input
            class="col-11"
            v-model="productModel.date"
            aria-placeholder="DD/MM/YYYY"
            label="Fecha de contratación"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="productModel.date" mask="DD/MM/YYYY">
                    <div class="row items-center justify-end">
                      <q-btn
                        v-close-popup
                        label="Cerrar"
                        color="primary"
                        flat
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <!-- <q-date v-model="productModel.date" mask="DD/MM/YYYY" /> -->
          <q-input
            class="col-11"
            type="textarea"
            v-model="productModel.reason"
            label="Razón de la contratación"
          />
          <!-- transactions history -->
          <div class="col-11" v-if="productModel.id">
            <div class="text-h6 text-center">Historial de aportaciones</div>
            <div class="row q-gutter-md justify-center">
              <q-input
                v-model.number="transactionItem.amount"
                type="number"
                label="Cantidad de la aportación"
              >
              </q-input>
              <q-input
                v-model="transactionItem.date"
                aria-placeholder="DD/MM/YYYY"
                label="Fecha de aportacion"
              >
                <template v-slot:after>
                  <q-btn
                    round
                    dense
                    flat
                    icon="add_circle"
                    @click="handleAddTransaction()"
                  />
                </template>
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="transactionItem.date" mask="DD/MM/YYYY">
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Cerrar"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <dynamic-order-list
              v-if="productModel.transactions"
              :title="'Aportaciones'"
              :items="productModel.transactions"
            >
              <!-- TODO slot with item template bind -->
              <template v-slot:body="{ item }">
                {{ item.amount }}€ - {{ item.date }}
              </template>
            </dynamic-order-list>
          </div>
          <div class="col-12 row justify-center q-gutter-xs">
            <q-btn
              label="Aceptar cambios"
              color="secondary"
              class=""
              @click="handleAddUserProduct"
            />
            <q-btn
              label="Cancelar"
              class=""
              flat
              @click="handleCancelAddProduct"
            />
          </div>
        </div>
        <div v-else>
          <q-scroll-area style="height: 300px">
            <q-list>
              <q-item
                v-for="(userProd, i) in userProducts"
                :key="`product-${i}`"
                clickable
                @click="handleSelectUserProduct(userProd)"
              >
                <q-item-section>
                  <q-item-label
                    >{{ userProd.name }} {{ userProd.partner }}</q-item-label
                  >
                  <q-item-label caption lines="1">{{
                    userProd.date
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn icon="delete" flat round @click.stop="">
                    <q-popup-proxy cover :breakpoint="600">
                      <q-card>
                        <q-card-actions>
                          <q-card-section class="text-h6">
                            Estas seguro de que quieres borrarlo?
                          </q-card-section>
                        </q-card-actions>
                        <q-card-actions class="row justify-between">
                          <q-btn
                            flat
                            round
                            label="Si"
                            color="green"
                            @click.stop="handleDeleteUserProduct(userProd.id)"
                          />
                          <q-btn
                            flat
                            round
                            label="no"
                            color="red"
                            v-close-popup
                          />
                        </q-card-actions>
                      </q-card>
                    </q-popup-proxy>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
          <q-btn
            label="Agregar producto"
            icon="add"
            color="secondary"
            class="full-width"
            @click="addingProduct = true"
          />
        </div>
      </q-card-section>
      <q-card-section v-else>
        <p>
          {{ modelValue.firstname }} aún no está registrado en nuestro sistema,
          pulsa en el siguiente botón para crear un usuario y mandar un correo
          de recuperación de contraseña a {{ modelValue.email }}
        </p>
        <q-btn
          label="Crear usuario"
          @click="handleCreateUser"
          color="secondary"
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
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { Contact, Product, UserProduct } from '../models';
import { useUserApi } from 'src/factories/useUserApi';
import DynamicOrderList from '../DynamicOrderList.vue';

export default defineComponent({
  components: { DynamicOrderList },
  props: {
    title: {
      type: String,
      default: 'Seguro?',
    },
    modelValue: {
      type: Object as PropType<Contact>,
      default: () => ({}),
    },
    // userProducts: {
    //   type: Array as PropType<UserProduct[]>,
    //   default: () => [],
    // },
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
    const {
      getUserProducts,
      addUserProduct,
      updateUserProduct,
      createUser,
      resetPassByEmail,
      deleteUserProduct,
      products: userProducts,
    } = useUserApi();
    const addingProduct = ref(false);
    const loadingResetPass = ref(false);

    const formModel = ref<{ [key: string]: unknown }>(props.modelValue);
    const _initProduct: UserProduct = {
      apex: 0,
      monthly: 0,
      partner: '',
      name: '',
      date: '',
    };
    const productSelected = ref<Product>();
    const productModel = ref<UserProduct>(_initProduct);
    const transactionItem = ref({ amount: 0, date: '' });
    const userId = computed(() => {
      return props.modelValue.fb_id || '';
    });
    const save = () => {
      //TODO update the user(it can be updated in hubspot and firebase), in future emit save event to submit the form when is dynamic
      console.log(formModel.value);
      onDialogOK(formModel.value);
    };
    const handleCreateUser = () => {
      //TODO create user in db auth
      createUser(props.modelValue.email).catch(console.log);
      onDialogOK();
    };
    const handleAddUserProduct = async () => {
      const user_id = userId.value;
      if (user_id) {
        // console.log(productSelected.value);
        //If product contains id then existing product(update)
        if (productModel.value.id) {
          await updateUserProduct(
            productModel.value.id,
            user_id,
            productModel.value
          );
        } else {
          //No existing product so add
          await addUserProduct(user_id, productModel.value);
        }
        // console.log(productModel.value, user_id);
        //Reset user product model
        reset();
        await getUserProducts(user_id);
      }
    };
    const handleSelectUserProduct = (product: UserProduct) => {
      const _prodSelected = props.products.find(
        (p) => p.id === product.product_id
      );
      //Assign DB product selected to selector
      productSelected.value = _prodSelected;
      //Assign user product info
      productModel.value = product;
      addingProduct.value = true;
    };
    const handleSendResetEmail = async () => {
      loadingResetPass.value = true;
      await resetPassByEmail(props.modelValue.email);
      loadingResetPass.value = false;
    };
    const handleCancelAddProduct = async () => {
      reset();
      await getUserProducts(userId.value);
    };
    const handleDeleteUserProduct = async (product_id?: string) => {
      if (product_id) {
        await deleteUserProduct(userId.value, product_id);
        await getUserProducts(userId.value);
      }
    };
    const handleAddTransaction = () => {
      if (transactionItem.value.amount && transactionItem.value.date) {
        //Push transaction to product array
        if (!productModel.value.transactions) {
          productModel.value.transactions = [];
        }
        productModel.value.transactions.push(transactionItem.value);
        //reset transaction item
        transactionItem.value = { amount: 0, date: '' };
      } else {
        //alert no amount or date provided
      }
    };
    const reset = () => {
      productSelected.value = undefined;
      productModel.value = { ..._initProduct };
      addingProduct.value = false;
    };
    watch(
      () => productSelected.value,
      (value) => {
        if (value && value.id) {
          //set private details to user product
          productModel.value.product_id = value.id;
          productModel.value.name = value.private?.name || '';
          productModel.value.partner = value.private?.partner || '';
        }
      }
    );
    return {
      dialogRef,
      formModel,
      addingProduct,
      productModel,
      productSelected,
      userProducts,
      loadingResetPass,
      transactionItem,
      onDialogHide,
      onDialogOK,
      onDialogCancel,
      save,
      handleSendResetEmail,
      handleAddUserProduct,
      handleCreateUser,
      handleSelectUserProduct,
      handleCancelAddProduct,
      handleDeleteUserProduct,
      handleAddTransaction,
    };
  },
});
</script>

<style lang="scss" scoped></style>
