import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import ResourceView from '../views/ResourceView.vue';
import ManifestView from '../views/ManifestView.vue';
import PermissionView from '../views/PermissionView.vue';
import MenuView from '../views/MenuView.vue';
import DependencyView from '../views/DependencyView.vue';
import ProcessView from '../views/ProcessView.vue';
import ConfigTableView from '../views/ConfigTableView.vue';
import BusinessManagementView from '../views/BusinessManagementView.vue';
import ModuleManagementView from '../views/ModuleManagementView.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/manifest',
    children: [
      { path: 'resource', component: ResourceView },
      { path: 'manifest', component: ManifestView },
      { path: 'permission', component: PermissionView },
      { path: 'config-table', component: ConfigTableView },
      { path: 'business', component: BusinessManagementView },
      { path: 'module', component: ModuleManagementView },
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
