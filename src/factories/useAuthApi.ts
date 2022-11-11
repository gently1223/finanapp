import { reactive, toRefs, computed } from 'vue';
import { auth } from 'boot/firebase';
import FB from 'firebase';
// import { api } from 'boot/axios';
// import { analytics } from 'boot/firebase';

const state = reactive({
  user: <firebase.default.User | null>null,
});
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useAuthApi = () => {
  const loginAnonym = async () => {
    if (state.user?.email) return;

    try {
      console.log('no user, sign in again');
      const credentials = await auth().signInAnonymously();
      state.user = credentials.user;
      //console.log(credentials.user);
    } catch (error) {
      console.log(error);
    }
  };
  const loginWithPass = async (email: string, pass: string) => {
    try {
      const credentials = await auth().signInWithEmailAndPassword(email, pass);
      state.user = credentials.user;
      console.log(credentials.user);
      return state.user;
    } catch (e) {
      console.log(e);
      return e as firebase.default.auth.AuthError;
    }
  };
  const loginWithGoogle = async () => {
    try {
      const provider = new FB.auth.GoogleAuthProvider();
      const credentials = await auth().signInWithPopup(provider);
      state.user = credentials.user;
      console.log(credentials.user);
      return { user: credentials.user };
    } catch (e) {
      console.log(e);
      return { error: e as firebase.default.auth.AuthError };
    }
  };
  const resetEmailPass = async (email: string) => {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      return error as firebase.default.auth.AuthError;
    }
  };
  const isLoggedIn = () => {
    const user = auth().currentUser;
    if (user) {
      state.user = user;
      return true;
    } else {
      state.user = null;
      return false;
    }
  };
  const isAdmin = async () => {
    const a = await state.user?.getIdTokenResult(true);
    console.log(a?.claims.admin);
    return !!a?.claims.admin;
  };
  const logout = async () => {
    await auth().signOut();
    window.location.href = '/';
  };
  //Computed
  const userId = computed(() => {
    return state.user ? state.user.uid : '';
  });

  // onMounted(async () => await loginAnonym());
  return {
    ...toRefs(state),
    userId,
    isAdmin,
    loginAnonym,
    loginWithPass,
    loginWithGoogle,
    isLoggedIn,
    logout,
    resetEmailPass,
  };
};
