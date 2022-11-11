<template>
  <q-page class="q-ma-md">
    <div class="text-primary text-h6 text-center q-my-md">
      Admin: {{ userEmail }}
    </div>
    <div class="q-gutter-xs row justify-center">
      <q-card class="my-card col-11 col-md-5">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Mis clientes</div>
          <q-input
            type="text"
            label="Buscar"
            bg-color="white"
            filled
            :loading="loading"
            v-model="contactsQuery"
            clearable
          />
        </q-card-section>
        <q-separator />
        <q-linear-progress indeterminate v-if="loading" />
        <q-card-section>
          <q-scroll-area style="height: 400px">
            <q-list>
              <q-item
                v-for="client in contacts"
                :key="client.email"
                clickable
                @click="openEditUser(client)"
              >
                <q-item-section>
                  <q-item-label
                    >{{ client.firstname }} {{ client.lastname }}</q-item-label
                  >
                  <q-item-label caption lines="1">{{
                    client.email
                  }}</q-item-label>
                </q-item-section>
                <q-item-section v-if="client.fb_id" side top>
                  <q-icon name="sentiment_satisfied" color="green" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </q-card-section>
      </q-card>
      <q-card class="my-card col-11 col-md-5">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Nuestros Productos</div>
        </q-card-section>

        <q-separator />
        <q-linear-progress
          indeterminate
          v-if="loadingSubmitProduct || loadingData"
        />

        <q-card-section>
          <q-btn
            fab
            color="secondary"
            icon="add"
            class="absolute"
            style="bottom: 15px; right: 15px; z-index: 9"
            @click="openProductForm()"
          />
          <q-scroll-area style="height: 400px">
            <q-list>
              <q-item
                v-for="product in products"
                :key="product.id"
                @click="openProductForm(product)"
                clickable
                :disable="loadingSubmitProduct"
              >
                <q-item-section>
                  <q-item-label>{{ product.name }} </q-item-label>
                  <q-item-label caption lines="1">{{
                    product.ranges
                  }}</q-item-label>
                  <q-item-label caption lines="1">{{
                    product.types
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </q-card-section>
      </q-card>
      <!-- Partners -->
      <q-card class="my-card col-11 col-md-5">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Partners</div>
        </q-card-section>

        <q-separator />
        <q-linear-progress
          indeterminate
          v-if="loadingSubmitPartner || loadingData"
        />

        <q-card-section>
          <q-btn
            fab
            color="secondary"
            icon="add"
            class="absolute"
            style="bottom: 15px; right: 15px; z-index: 9"
          >
            <q-popup-proxy :ref="popupEditPartner">
              <q-input v-model="newPartner" label="Nombre">
                <template v-slot:after>
                  <q-btn
                    flat
                    dense
                    color="negative"
                    icon="cancel"
                    @click.stop.prevent="handlePartnerEvent()"
                  />

                  <q-btn
                    flat
                    dense
                    color="positive"
                    icon="check_circle"
                    @click.stop.prevent="
                      handlePartnerEvent({ name: newPartner })
                    "
                    :disable="!newPartner.length"
                  />
                </template>
              </q-input>
            </q-popup-proxy>
          </q-btn>
          <q-scroll-area style="height: 400px">
            <q-list>
              <q-item
                v-for="partner in partners"
                :key="partner.id"
                clickable
                :disable="loadingSubmitPartner"
              >
                <q-item-section>
                  <q-item-label
                    >{{ partner.name }}
                    <q-popup-edit v-model="partner.name" v-slot="scope">
                      <q-input
                        autofocus
                        dense
                        v-model="scope.value"
                        :model-value="scope.value"
                        hint="Cambiar nombre"
                      >
                        <template v-slot:after>
                          <q-btn
                            flat
                            dense
                            color="negative"
                            icon="cancel"
                            @click.stop.prevent="scope.cancel"
                          />

                          <q-btn
                            flat
                            dense
                            color="positive"
                            icon="check_circle"
                            @click.stop.prevent="
                              handlePartnerEvent(
                                { name: scope.value },
                                partner.id
                              )
                            "
                            :disable="scope.initialValue === scope.value"
                          />
                        </template>
                      </q-input>
                    </q-popup-edit>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon
                    name="delete"
                    @click="handleDeletePartner(partner.id)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </q-card-section>
      </q-card>
      <!-- Objectives -->
      <q-card class="my-card col-11 col-md-5">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Objetivos</div>
        </q-card-section>

        <q-separator />
        <q-linear-progress
          indeterminate
          v-if="loadingSubmitObjective || loadingData"
        />

        <q-card-section>
          <q-btn
            fab
            color="secondary"
            icon="add"
            class="absolute"
            style="bottom: 15px; right: 15px; z-index: 9"
            @click="openObjectiveForm()"
          />
          <q-scroll-area style="height: 400px">
            <q-list>
              <q-item
                v-for="objective in objectives"
                :key="objective.id"
                @click="openObjectiveForm(objective)"
                clickable
                :disable="loadingSubmitObjective"
              >
                <q-item-section>
                  <q-item-label>{{ objective.name }} </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { QPopupProxy, useQuasar } from 'quasar';
import ProductFormVue from 'src/components/dialogs/ProductForm.vue';
import UserFormVue from 'src/components/dialogs/UserForm.vue';
import { Contact, Objective, Partner, Product } from 'src/components/models';
import { useHubspotApi } from 'src/factories/useHubspotApi';
import { useProductsApi } from 'src/factories/useProductsApi';
import { useUserApi } from 'src/factories/useUserApi';
import { usePartnersApi } from 'src/factories/usePartnersApi';
import { useObjectivesApi } from 'src/factories/useObjectivesApi';
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { useAuthApi } from 'src/factories/useAuthApi';
import ObjectiveFormVue from 'src/components/dialogs/ObjectiveForm.vue';

export default defineComponent({
  name: 'AdminIndex',
  components: {},
  setup() {
    const { getAllProducts, products, addProduct, updateProduct } =
      useProductsApi();
    const { addObjective, editObjective, getObjectives, objectives } =
      useObjectivesApi();
    const { getOwnerContacts, contacts, loading } = useHubspotApi();
    const { getUserProducts, products: userProducts } = useUserApi();
    const { getPartners, addPartner, editPartner, deletePartner, partners } =
      usePartnersApi();
    const { user } = useAuthApi();
    const loadingSubmitProduct = ref(false);
    const loadingSubmitPartner = ref(false);
    const loadingData = ref(false);
    const loadingSubmitObjective = ref(false);
    const $q = useQuasar();
    const contactsQuery = ref('');
    const searchBouncer = ref<NodeJS.Timeout>();
    const newPartner = ref('');
    const popupEditPartner = ref<QPopupProxy>();
    onMounted(async () => {
      loadingData.value = true;
      await getAllProducts();
      await getOwnerContacts();
      await getPartners();
      await getObjectives();
      loadingData.value = false;
      console.log(user.value);
    });
    const userEmail = computed(() => {
      return user.value?.email;
    });
    const onProductSubmit = async (product: Product) => {
      //add product if no produtc.id
      loadingSubmitProduct.value = true;
      if (product.id) {
        await updateProduct(product);
      } else {
        await addProduct(product);
      }
      console.log(product);
      await getAllProducts();
      loadingSubmitProduct.value = false;
    };
    const onObjectiveSubmit = async (objective: Objective) => {
      //add product if no produtc.id
      loadingSubmitObjective.value = true;
      if (objective.id) {
        await editObjective(objective.id, objective);
      } else {
        await addObjective(objective);
      }
      await getObjectives();
      loadingSubmitObjective.value = false;
    };
    const openEditUser = async (contact: Contact) => {
      if (contact.fb_id) {
        await getUserProducts(contact.fb_id);
      }
      $q.dialog({
        component: UserFormVue,
        componentProps: {
          modelValue: contact,
          title: 'Editar usuario',
          userProducts: userProducts.value,
          products: products.value,
        },
      }).onOk((form: unknown) => {
        console.log(form);
        if (!form) {
          //then is creating a new user just refresh the contacts
        }
        getOwnerContacts(contactsQuery.value).catch(console.log);
      });
    };
    const openProductForm = (product?: Product) => {
      const title = product ? 'Editar producto' : 'Añadir nuevo producto';
      $q.dialog({
        component: ProductFormVue,
        componentProps: {
          modelValue: product,
          title,
          partners: partners.value,
        },
      }).onOk((product: Product) => {
        onProductSubmit(product).catch(console.log);
      });
    };
    const openObjectiveForm = (objective?: Objective) => {
      const title = objective ? 'Editar objetivo' : 'Añadir nuevo objetivo';
      $q.dialog({
        component: ObjectiveFormVue,
        componentProps: {
          modelValue: objective,
          title,
          products: products.value,
        },
      }).onOk((objective: Objective) => {
        onObjectiveSubmit(objective).catch(console.log);
      });
    };
    const handlePartnerEvent = async (
      partner?: Omit<Partner, 'id'>,
      partnerId?: string
    ) => {
      if (partner) {
        loadingSubmitPartner.value = true;
        //save partner
        if (partnerId) {
          await editPartner(partnerId, partner);
        } else {
          await addPartner(partner);
        }
        await getPartners();
        loadingSubmitPartner.value = false;
      }
      popupEditPartner.value?.hide();
      newPartner.value = '';
    };
    const handleDeletePartner = async (partnerId: string) => {
      //TODO refactor to use a functions that expects a promise and call the loading partners
      loadingSubmitPartner.value = true;
      await deletePartner(partnerId);
      await getPartners();
      loadingSubmitPartner.value = false;
    };

    const search = async (query: string) => {
      //   const query = el?.target.value;
      if (searchBouncer.value) {
        clearTimeout(searchBouncer.value);
      }
      if (query && query.length > 2) {
        console.log('bouncing');
        searchBouncer.value = setTimeout(() => {
          console.log('qerying', query);

          getOwnerContacts(query).catch(console.log);
        }, 200);
      } else if (!query) {
        await getOwnerContacts();
      }
    };

    watch(
      () => contactsQuery.value,
      async (value) => {
        await search(value);
      }
    );

    return {
      products,
      contacts,
      partners,
      objectives,
      loading,
      contactsQuery,
      userProducts,
      loadingSubmitProduct,
      loadingSubmitPartner,
      loadingSubmitObjective,
      loadingData,
      userEmail,
      newPartner,
      search,
      openEditUser,
      openProductForm,
      openObjectiveForm,
      popupEditPartner,
      handlePartnerEvent,
      handleDeletePartner,
      onObjectiveSubmit,
    };
  },
});
</script>

<style></style>
