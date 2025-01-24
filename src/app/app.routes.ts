import {Routes} from '@angular/router';
import {LoginComponent} from './components/client/login/login.component';
import {AdminLoginComponent} from './components/admin/admin-login/admin-login.component';
import {AdminComponent} from './components/admin/admin/admin.component';
import {AdminRolesComponent} from './components/admin/roles/admin-roles/admin-roles.component';
import {RoleComponent} from './components/admin/roles/role/role.component';
import {RoleListingComponent} from './components/admin/roles/role-listing/role-listing.component';
import {CompaniesListingComponent} from './components/admin/companies/companies-listing/companies-listing.component';
import {CompanyComponent} from './components/admin/companies/company/company.component';
import {AdminCompaniesComponent} from './components/admin/companies/admin-companies/admin-companies.component';
import {UserListingComponent} from './components/admin/users/user-listing/user-listing.component';
import {UserComponent} from './components/admin/users/user/user.component';
import {AdminUsersComponent} from './components/admin/users/admin-users/admin-users.component';
import {AdminModulesComponent} from './components/admin/modules/admin-modules/admin-modules.component';
import {ModuleListingComponent} from './components/admin/modules/module-listing/module-listing.component';
import {ModuleComponent} from './components/admin/modules/module/module.component';
import {ClientHomeComponent} from './components/client/client-home/client-home.component';
import {ClientDashboardComponent} from './components/client/dashboard/client-dashboard/client-dashboard.component';
import {ClientProductComponent} from './components/client/product/client-product/client-product.component';
import {ClientInvoicesComponent} from './components/client/client-invoices/client-invoices.component';
import {ClientSalesComponent} from './components/client/client-sales/client-sales.component';
import {ClientPosComponent} from './components/client/client-pos/client-pos.component';
import {ListProductsComponent} from './components/client/product/list-products/list-products.component';
import {ProductComponent} from './components/client/product/product/product.component';
import {ClientEntitiesComponent} from './components/client/entity/client-entities/client-entities.component';
import {EntitiesListComponent} from './components/client/entity/entities-list/entities-list.component';
import {EntityComponent} from './components/client/entity/entity/entity.component';
import {ClientInventoryComponent} from './components/client/inventory/client-inventory/client-inventory.component';
import {ListInventoryComponent} from './components/client/inventory/list-inventory/list-inventory.component';
import {InventoryComponent} from './components/client/inventory/inventory/inventory.component';
import {ClientLedgerComponent} from './components/client/ledger/client-ledger/client-ledger.component';

export const routes: Routes = [   // Redirect to the login page initially
  {path: '', redirectTo: 'app/login', pathMatch: 'full'},

  // Admin Routes
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {path: 'login', component: AdminLoginComponent},
      {
        path: 'companies', component: AdminCompaniesComponent,
        children: [
          {path: '', component: CompaniesListingComponent},
          {path: 'listing', component: CompaniesListingComponent},
          {path: 'add', component: CompanyComponent},
          {path: 'update', component: CompanyComponent},

        ]
      },
      {
        path: 'roles', component: AdminRolesComponent,
        children: [
          {path: '', component: RoleListingComponent},
          {path: 'listing', component: RoleListingComponent},
          {path: 'add', component: RoleComponent},
          {path: 'update', component: RoleComponent},

        ]
      },
      {
        path: 'users', component: AdminUsersComponent,
        children: [
          {path: '', component: UserListingComponent},
          {path: 'listing', component: UserListingComponent},
          {path: 'add', component: UserComponent},
          {path: 'update', component: UserComponent},

        ]
      },
      {
        path: 'modules', component: AdminModulesComponent,
        children: [
          {path: '', component: ModuleListingComponent},
          {path: 'listing', component: ModuleListingComponent},
          {path: 'add', component: ModuleComponent},
          {path: 'update', component: ModuleComponent},

        ]
      }
    ]
  },

  // Client Routes
  {
    path: 'app', component: ClientHomeComponent,
    children: [
      {path: 'login', component: LoginComponent},
      {path: 'dashboard', component: ClientDashboardComponent},
      {path: 'ledger', component: ClientLedgerComponent},
      {path: 'inventory', component: ClientInventoryComponent,
        children: [
          {path: '', component: ListInventoryComponent},
          {path: 'list', component: ListInventoryComponent},
          {path: 'add', component: InventoryComponent},
          {path: 'update', component: InventoryComponent},
          {path: 'view', component: InventoryComponent},

        ]},
      {path: 'product', component: ClientProductComponent,
        children: [
          {path: '', component: ListProductsComponent},
          {path: 'list', component: ListProductsComponent},
          {path: 'add', component: ProductComponent},
          {path: 'update', component: ProductComponent},
          {path: 'view', component: ProductComponent},

        ]},
      {path: 'invoice', component: ClientInvoicesComponent},
      {path: 'sales', component: ClientSalesComponent},
      {path: 'pos', component: ClientPosComponent},
      {path: 'entity', component: ClientEntitiesComponent,
        children: [
          {path: '', component: EntitiesListComponent},
          {path: 'list', component: EntitiesListComponent},
          {path: 'add', component: EntityComponent},
          {path: 'update', component: EntityComponent},
          {path: 'view', component: EntityComponent},

        ]},

    ]
  },

  // Wildcard route for handling unknown paths
  {path: '**', redirectTo: 'client/login'}
];
