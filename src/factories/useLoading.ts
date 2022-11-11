import { reactive, toRefs } from 'vue';

const state = reactive({
  loading: false,
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useLoading = () => {
  const showLoading = () => {
    state.loading = true;
  };
  const hideLoading = () => {
    state.loading = false;
  };
  return { ...toRefs(state), showLoading, hideLoading };
};
