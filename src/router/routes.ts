import { RouteRecordRaw } from 'vue-router';
import { isLoggedIn } from 'src/guards/auth';
import { isNewUser } from 'src/guards/user';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: [isLoggedIn, isNewUser],
    children: [
      {
        path: '',
        name: 'Finanfox',
        beforeEnter: [isNewUser],
        component: () => import('pages/Index.vue'),
      },
      {
        path: 'account',
        name: 'Mi cuenta',
        component: () => import('pages/Account.vue'),
      },
      {
        path: 'onboarding',
        name: 'Onboarding',
        component: () => import('pages/Onboarding.vue'),
      },
      {
        path: 'investments',
        name: 'Inversiones',
        component: () => import('pages/Investments.vue'),
      },
      {
        path: 'objectives',
        name: 'Objetivos',
        component: () => import('pages/Objectives.vue'),
      },
      {
        path: 'banks',
        name: 'Bancos',
        component: () => import('pages/Banks.vue'),
      },
      {
        path: 'meetings',
        name: 'Reuniones',
        component: () => import('pages/Meetings.vue'),
      },
      {
        path: 'referral',
        name: 'Referral',
        component: () => import('pages/Referral.vue'),
      },
    ],
  },
  {
    path: '/calculator',
    name: 'Calculator',
    component: () => import('src/pages/Calculator.vue'),
  },
  {
    path: '/admin',
    beforeEnter: [isLoggedIn],
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'Admin',
        component: () => import('pages/admin/Index.vue'),
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('pages/Login.vue'),
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    name: 'Error404',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
