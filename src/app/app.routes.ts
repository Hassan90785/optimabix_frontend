import { Routes } from '@angular/router';
import {LoginComponent} from './components/client/login/login.component';
import {AdminLoginComponent} from './components/admin/admin-login/admin-login.component';
import {AdminCompaniesComponent} from './components/admin/admin-companies/admin-companies.component';
import {AdminRolesComponent} from './components/admin/admin-roles/admin-roles.component';
import {AdminUsersComponent} from './components/admin/admin-users/admin-users.component';

export const routes: Routes = [   // Redirect to the login page initially
  { path: '', redirectTo: 'admin/login', pathMatch: 'full' },

  // Admin Routes
  {
    path: 'admin',
    children: [
      { path: 'login', component: AdminLoginComponent },
      { path: 'companies', component: AdminCompaniesComponent },
      { path: 'roles', component: AdminRolesComponent },
      { path: 'users', component: AdminUsersComponent }
    ]
  },

  // Client Routes
  {
    path: 'client',
    children: [
      { path: 'login', component: LoginComponent }
    ]
  },

  // Wildcard route for handling unknown paths
  { path: '**', redirectTo: 'client/login' }
];
