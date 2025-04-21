import { lazy } from 'react';

const KitchenRoutes = [
  {
    path: 'kitchen',
    component: lazy(() => import('views/kitchen')),
  },
  {
    path: 'kitchen/create',
    component: lazy(() => import('views/kitchen/create')),
  },
  {
    path: 'kitchen/edit/:id',
    component: lazy(() => import('views/kitchen/edit')),
  },
];

export default KitchenRoutes;
