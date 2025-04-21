import { lazy } from 'react';

const RecipesRoutes = [
  {
    path: 'recipes/categories',
    component: lazy(() => import('views/recipes/categories')),
  },
  {
    path: 'recipes/categories/add',
    component: lazy(() => import('views/recipes/categories/add')),
  },
  {
    path: 'recipes/categories/edit/:uuid',
    component: lazy(() => import('views/recipes/categories/edit')),
  },
  {
    path: 'recipes/categories/clone/:uuid',
    component: lazy(() => import('views/recipes/categories/clone')),
  },
  {
    path: 'recipes/categories/import',
    component: lazy(() => import('views/recipes/categories/import')),
  },
  // list
  {
    path: 'recipes/list',
    component: lazy(() => import('views/recipes/list')),
  },
  {
    path: 'recipes/list/add',
    component: lazy(() => import('views/recipes/list/add')),
  },
  {
    path: 'recipes/list/edit/:id',
    component: lazy(() => import('views/recipes/list/edit')),
  },
  {
    path: 'recipes/list/clone/:id',
    component: lazy(() => import('views/recipes/list/clone')),
  },
];

export default RecipesRoutes;
