// ** React Imports
import { lazy } from 'react';

const SellerFoodRoutes = [
  {
    path: 'seller/product',
    component: lazy(() => import('views/seller-views/product')),
  },
  {
    path: 'seller/product/add',
    component: lazy(() => import('views/seller-views/product/products-add')),
  },
  {
    path: 'seller/product/:uuid',
    component: lazy(() => import('views/seller-views/product/product-edit')),
  },
  {
    path: 'seller/product/import',
    component: lazy(() => import('views/seller-views/product/product-import')),
  },
];

export default SellerFoodRoutes;
