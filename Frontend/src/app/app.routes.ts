import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { ProductManager } from './product-manager/product-manager';
import { Webpage } from './webpage/webpage';
import { Storefront } from './storefront/storefront';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Webpage },
  { path: 'dashboard', component: Dashboard },
  { path: 'products/manage', component: ProductManager },
  { path: 'page/:id', component: Webpage },
  { path: 'store/:id', component: Storefront }
];
