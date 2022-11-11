<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div v-if="products.length" class="col-11 col-sm-8 col-xl-11">
        <div class="text-h5">
          Desde esta sección verás todos tus productos contratados
        </div>
        <!-- <q-card class="q-my-md">
          <pie-chart
            v-if="productsPieLabels.length"
            ref="chartRef"
            :labels="productsPieLabels"
            :chartData="chartData"
          />
        </q-card> -->
        <q-card class="q-my-md">
          <q-card-actions class="row justify-center">
            <q-btn-toggle
              rounded
              v-model="slide"
              :options="
                (productsByPartner &&
                  productsByPartner.map((p) => ({
                    label: p.partner,
                    value: p.partner,
                  }))) ||
                []
              "
            />
          </q-card-actions>
          <q-card-section>
            <!-- TODO incluude carousel of cards with products -->
            <q-carousel
              animated
              v-model="slide"
              swipeable
              transition-prev="slide-right"
              transition-next="slide-left"
              ref="carousel"
              height="300px"
              class=""
            >
              <q-carousel-slide
                v-for="client in productsByPartner"
                :key="client.partner"
                :name="client.partner"
              >
                <q-btn
                  :label="`Area de clientes ${client.partner}`"
                  @click="goToClientArea(client.partner)"
                  color="accent"
                />
                <div
                  class=""
                  v-for="product in client.products"
                  :key="product.product_id"
                >
                  <div class="text-primary text-h4">
                    {{ product.name }}
                  </div>
                  <div v-if="product.date" class="column">
                    <span class="text-grey">Fecha contratación:</span
                    >{{ product.date }}
                  </div>
                  <div
                    v-if="product.transactions || product.monthly"
                    class="row q-gutter-md"
                  >
                    <div class="col-4 column">
                      <span class="text-grey">Total invertido:</span
                      >{{ getProductTotal(product) }}€
                    </div>
                    <!-- <div class="col-4 column">
                    <span class="text-grey">Número de póliza:</span
                    >{{ product.product_id || '-' }}
                  </div> -->
                    <div class="col-4 column">
                      <span class="text-grey">Aportación mensual:</span
                      >{{ product.monthly || '-' }}€
                    </div>
                    <div v-if="product.apex" class="col-4 column">
                      <span class="text-grey">Aportación inicial:</span
                      >{{ product.apex || '-' }}€
                    </div>
                  </div>
                </div>
              </q-carousel-slide>
            </q-carousel>
          </q-card-section>
        </q-card>
        <!-- template for buttons with product short names -->
      </div>
      <div v-else class="col-11 col-sm-8 col-xl-11">
        <card-avatar
          :title="meetingCard.title"
          :subtitle="meetingCard.subtitle"
          :avatar="ownerPic"
        >
          <template #body>
            <div class="text-h6">"Bienvenid@ a finanfox,</div>
            <div class="text-grey-7">
              Crea tu primera reunión para ver los productos más interesantes
              para tu perfil"
            </div>
          </template>
          <template #ctas
            ><div class="flex flex-center">
              <q-btn
                v-for="cta in meetingCard.ctas"
                :key="cta.label"
                :label="cta.label"
                @click="cta.exec"
                :color="cta.color"
              />
            </div>
          </template>
        </card-avatar>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { date } from 'quasar';
import { analytics } from 'src/boot/firebase';
import CardAvatar from 'src/components/CardAvatar.vue';
import { UserProduct } from 'src/components/models';
// import PieChart from 'src/components/PieChart.vue';
import { useAuthApi } from 'src/factories/useAuthApi';
import { useHubspotApi } from 'src/factories/useHubspotApi';
import { ClientAreaUrls } from 'src/factories/useProductsApi';
import { useUserApi } from 'src/factories/useUserApi';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  components: { CardAvatar },
  name: 'Investments',
  // components: { PieChart },
  setup() {
    // const chartRef = ref<typeof PieChart>();
    const { formatDate, getDateDiff, buildDate } = date;
    const { userId } = useAuthApi();
    //User products
    const { products, getUserProducts } = useUserApi();
    //Slide model
    const slide = ref('');
    const { contact, ownerPic } = useHubspotApi();
    const router = useRouter();
    const chartOptions = { responsive: true };
    const meetingCard = ref({
      title: contact.value?.hubspot_owner_name,
      subtitle: 'Tu planificador financiero',
      ctas: [
        {
          label: 'Agenda una reunión',
          color: 'secondary',
          exec: async () => {
            analytics.logEvent('investments_page_click_meeting');
            await router.push('/meetings');
          },
        },
      ],
    });
    //TODO Construct slides and buttons
    const productsGroupById = computed(() => {
      return products.value.reduce((result: UserProduct[], product) => {
        const existingProductI = result.findIndex(
          (uniqueProd) => uniqueProd.product_id === product.product_id
        );
        if (existingProductI > -1 && result[existingProductI].apexs?.length) {
          //edit current product and add and array of apexs with date
          result[existingProductI].apexs?.push({
            amount: product.apex,
            date: product.date,
          });
        } else {
          result.push({
            ...product,
            apexs: [
              {
                amount: product.apex,
                date: product.date,
              },
            ],
          });
        }
        return result;
      }, []);
    });

    const productsByPartner = computed(() => {
      return products.value.reduce(
        (result: { products: UserProduct[]; partner: string }[], product) => {
          const existingProductI = result.findIndex(
            (uniqueProd) => uniqueProd.partner === product.partner
          );
          if (existingProductI > -1) {
            result[existingProductI].products.push(product);
          } else {
            result.push({ partner: product.partner, products: [product] });
          }
          return result;
        },
        []
      );
    });
    const productsPieLabels = computed(() => {
      return productsGroupById.value.map((p) => `${p.name} ${p.partner}`);
    });
    const chartData = computed(() => {
      return {
        labels: productsPieLabels.value,
        datasets: [
          {
            backgroundColor: [
              '#CD6A41',
              '#41A4CD',
              '#DEB24A',
              '#1d1d1d',
              '#70b452',
              '#CD4152',
              '#3EAFFE',
              '#CD8D41',
            ],
            data: productsGroupById.value.map((p) => getProductTotal(p)),
          },
        ],
      };
    });
    onMounted(async () => {
      await getUserProducts(userId.value);
      console.log(productsGroupById.value);
      if (productsGroupById.value.length) {
        slide.value = productsGroupById.value[0].partner;
      }
    });
    const getProductTotal = (product: UserProduct) => {
      //Not in used atm
      // if (product.apexs && product.apexs.length > 0) {
      //   return product.apexs.reduce((res, apex) => (res += apex.amount), 0);
      // }
      let total = product.apex;
      if (product.monthly && product.date) {
        //calculate months from date and multiply by monthly
        const months = getDateDiff(
          new Date().getTime(),
          product.date,
          'months'
        );
        console.log(months);
        total += months * product.monthly;
      }
      if (product.transactions) {
        //TODO sum all transactions
        const transactionSum = product.transactions.reduce(
          (total, value) => (total += value.amount),
          0
        );
        console.log(transactionSum);
        total += transactionSum;
      }
      return total;
    };
    const goToClientArea = (client: string) => {
      window.open(ClientAreaUrls[client], '_blank');
    };
    return {
      products,
      slide,
      productsGroupById,
      productsByPartner,
      chartOptions,
      // chartRef,
      chartData,
      ownerPic,
      meetingCard,
      productsPieLabels,
      getProductTotal,
      formatDate,
      goToClientArea,
    };
  },
});
</script>
