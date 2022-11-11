import { db } from 'src/boot/firebase';
import { Partner } from 'src/components/models';
import { reactive, toRefs } from 'vue';

const state = reactive({
  partners: <Partner[]>[],
  products: <unknown[]>[],
});
export const usePartnersApi = () => {
  const getPartners = async () => {
    const partnersData = await db().collection('partners').get();
    state.partners = partnersData.docs.map((partnerData) => ({
      ...(partnerData.data() as Partner),
      id: partnerData.id,
    }));
  };
  const getPartnerProducts = async (partnerId: string) => {
    const partnersProductsData = await db()
      .collection('partners')
      .doc(partnerId)
      .collection('products')
      .get();
    state.products = partnersProductsData.docs.map((productData) => ({
      ...productData.data(),
      id: productData.id,
    }));
  };
  const addPartner = async (partner: Omit<Partner, 'id'>) => {
    await db()
      .collection('partners')
      .add({ ...partner });
  };
  const editPartner = async (id: string, partner: Omit<Partner, 'id'>) => {
    await db()
      .collection('partners')
      .doc(id)
      .set({ ...partner }, { merge: true });
  };
  const deletePartner = async (id: string) => {
    await db().collection('partners').doc(id).delete();
  };
  return {
    ...toRefs(state),
    getPartners,
    getPartnerProducts,
    addPartner,
    editPartner,
    deletePartner,
  };
};
