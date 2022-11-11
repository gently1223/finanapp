import { reactive, toRefs } from 'vue';
import { Bank, UserProduct, User } from 'src/components/models';
import { db } from 'boot/firebase';
import { auth } from 'firebase-admin';
import { api } from 'src/boot/axios';
// import firebase from 'firebase';

const state = reactive({
  user: <User | null>null,
  loading: false,
  linkedBanks: <Bank[]>[],
  products: <UserProduct[]>[
    // {
    //   apex: 20500,
    //   client: 'Neowintech',
    //   date: new firebase.firestore.Timestamp(123123, 123123),
    //   product_id: 'someProdId',
    //   name: 'Cuenta',
    //   apexs: [],
    //   monthly: 0,
    // },
    // {
    //   apex: 2500,
    //   client: 'Neowintech',
    //   date: new firebase.firestore.Timestamp(123123, 123123),
    //   product_id: 'someProdId2',
    //   name: 'Uno',
    //   apexs: [],
    //   monthly: 0,
    // },
    // {
    //   apex: 8000,
    //   client: 'Aegon',
    //   date: new firebase.firestore.Timestamp(123123, 123123),
    //   product_id: 'someProdId3',
    //   name: 'PIAS',
    //   apexs: [],
    //   monthly: 200,
    // },
  ],
});
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useUserApi = () => {
  const udpateUser = async (user: User) => {
    if (state.user?.uid) {
      //Update user
      await db()
        .collection('users')
        .doc(state.user.uid)
        .set({ ...user }, { merge: true });
    }
  };

  const getUser = async (user_id: string) => {
    try {
      const userData = await db().collection('users').doc(user_id).get();
      state.user = { ...userData.data(), uid: userData.id } as User;
      console.log(userData.data());
      return state.user;
    } catch (e) {
      console.log(e);
      return null;
    }
  };
  const getUserBanks = async (user_id: string) => {
    state.loading = true;

    const banksResponse = await db()
      .collection('users')
      .doc(user_id)
      .collection('banks')
      .get();
    state.linkedBanks = banksResponse.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as [];
    console.log(state.linkedBanks);
    state.loading = false;
  };

  const getUserProducts = async (user_id: string) => {
    state.loading = true;

    const productsResponse = await db()
      .collection('users')
      .doc(user_id)
      .collection('products')
      .get();
    state.products = productsResponse.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as [];
    state.loading = false;
  };
  //Deletes logged in user bank or specific user bank
  const deleteUserBank = async (bankId: string, userId?: string) => {
    let _userId;
    if (userId) {
      _userId = userId;
    } else {
      _userId = state.user?.uid;
    }
    // console.log(_userId, state.user);
    try {
      await db()
        .collection('users')
        .doc(_userId)
        .collection('banks')
        .doc(bankId)
        .delete();
    } catch (error) {
      console.log(error);
    }
  };
  const addUserProduct = async (user_id: string, product: UserProduct) => {
    try {
      await db()
        .collection('users')
        .doc(user_id)
        .collection('products')
        .add(product);
    } catch (error) {
      console.log(error);
    }
  };
  const updateUserProduct = async (
    id: string,
    user_id: string,
    product: UserProduct
  ) => {
    try {
      await db()
        .collection('users')
        .doc(user_id)
        .collection('products')
        .doc(id)
        .set(product, { merge: true });
    } catch (error) {
      console.log(error);
    }
  };
  const deleteUserProduct = async (user_id: string, product_id: string) => {
    try {
      await db()
        .collection('users')
        .doc(user_id)
        .collection('products')
        .doc(product_id)
        .delete();
    } catch (error) {
      console.log(error);
    }
  };
  const createUser = async (email: string) => {
    await api.post('/user/', { email });
  };
  const resetPassByEmail = async (email: string) => {
    await api.post('/reset/', { email });
  };
  const isUserProduct = (productId: string) => {
    return state.products.find((prod) => prod.product_id === productId);
  };

  return {
    ...toRefs(state),
    getUser,
    udpateUser,
    getUserBanks,
    getUserProducts,
    isUserProduct,
    deleteUserBank,
    deleteUserProduct,
    addUserProduct,
    updateUserProduct,
    createUser,
    resetPassByEmail,
  };
};
