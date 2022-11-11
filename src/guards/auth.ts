import { RouteLocationNormalized, NavigationGuard } from 'vue-router';
import { useAuthApi } from 'src/factories/useAuthApi';
export const isLoggedIn: NavigationGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next
) => {
  const { isLoggedIn, isAdmin } = useAuthApi();
  const logged = isLoggedIn();

  if (logged) {
    //redirect to admin if admin role
    const admin = await isAdmin();
    if (admin) {
      if (to.path === '/admin') {
        //If admin and going to admin avoid loop
        next();
      } else {
        //If admin and not going to admin then redirect always to admin
        next({ path: '/admin' });
      }
    } else {
      //If not admin but is logged then navigate
      next();
    }
  } else {
    next({ path: '/login' });
  }
};
