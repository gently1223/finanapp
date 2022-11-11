import { useHubspotApi } from 'src/factories/useHubspotApi';
import { useLoading } from 'src/factories/useLoading';
import { RouteLocationNormalized, NavigationGuard } from 'vue-router';
export const isNewUser: NavigationGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next
) => {
  const { getContact } = useHubspotApi();
  const { showLoading, hideLoading } = useLoading();
  showLoading();
  //TODO pass getContact to useLoading so we can execute getContact and show/hide in useLoading
  const contact = await getContact();
  hideLoading();
  if (to.path === '/onboarding') {
    next();
  } else {
    if (contact) {
      next();
    } else {
      next({ path: '/onboarding' });
    }
  }
};
