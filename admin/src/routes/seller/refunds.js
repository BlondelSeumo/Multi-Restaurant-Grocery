import { lazy } from 'react';

const SellerRefundsRoutes = [
  {
    path: 'refunds',
    component: lazy(() => import('views/refund')),
  },
  {
    path: 'refund/details/:id',
    component: lazy(() => import('views/refund/details')),
  },
];

export default SellerRefundsRoutes;
