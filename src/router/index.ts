import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import ResourceView from '../views/ResourceView.vue';
import ManifestView from '../views/ManifestView.vue';
import PermissionView from '../views/PermissionView.vue';
import MenuView from '../views/MenuView.vue';
import DependencyView from '../views/DependencyView.vue';
import ProcessView from '../views/ProcessView.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/resource',
    children: [
      { path: 'resource', component: ResourceView },
      { path: 'manifest', component: ManifestView },
      { path: 'permission', component: PermissionView },
      { path: 'menu', component: MenuView },
      { path: 'dependency', component: DependencyView },
      { path: 'process', component: ProcessView },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
