import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: '',
        loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
            },
            {
                path: 'users',
                loadComponent: () => import('./users/users-list/users-list.component').then(m => m.UsersListComponent),
            },
            {
                path: 'users/new',
                loadComponent: () => import('./users/user-form/user-form.component').then(m => m.UserFormComponent),
            },
            {
                path: 'users/:id/profile',
                loadComponent: () => import('./users/user-profile/user-profile.component').then(m => m.UserProfileComponent),
            },
            {
                path: 'users/:id/edit',
                loadComponent: () => import('./users/user-form/user-form.component').then(m => m.UserFormComponent),
            },
            {
                path: 'users/:id',
                loadComponent: () => import('./users/user-profile/user-profile.component').then(m => m.UserProfileComponent),
            },
            {
                path: 'attendance',
                loadComponent: () => import('./attendance/attendance.component').then(m => m.AttendanceComponent),
            },
            {
                path: 'items',
                loadComponent: () => import('./masters/items/items-list.component').then(m => m.ItemsListComponent),
            },
            {
                path: 'suppliers',
                loadComponent: () => import('./masters/suppliers/suppliers-list.component').then(m => m.SuppliersListComponent),
            },
            {
                path: 'suppliers/:id',
                loadComponent: () => import('./masters/suppliers/supplier-detail.component').then(m => m.SupplierDetailComponent),
            },
            {
                path: 'customers',
                loadComponent: () => import('./masters/customers/customers-list.component').then(m => m.CustomersListComponent),
            },
            {
                path: 'customers/:id',
                loadComponent: () => import('./masters/customers/customer-detail.component').then(m => m.CustomerDetailComponent),
            },
            {
                path: 'purchases',
                loadComponent: () => import('./purchasing/purchases-list/purchases-list.component').then(m => m.PurchasesListComponent),
            },
            {
                path: 'purchases/new',
                loadComponent: () => import('./purchasing/purchase-form/purchase-form.component').then(m => m.PurchaseFormComponent),
            },
            {
                path: 'purchases/:id',
                loadComponent: () => import('./purchasing/purchase-detail/purchase-detail.component').then(m => m.PurchaseDetailComponent),
            },
            {
                path: 'purchases/:id/edit',
                loadComponent: () => import('./purchasing/purchase-form/purchase-form.component').then(m => m.PurchaseFormComponent),
            },
            {
                path: 'inventory',
                loadComponent: () => import('./inventory/inventory.component').then(m => m.InventoryComponent),
            },
            {
                path: 'sales',
                loadComponent: () => import('./sales/sales-list/sales-list.component').then(m => m.SalesListComponent),
            },
            {
                path: 'sales/new',
                loadComponent: () => import('./sales/sales-form/sales-form.component').then(m => m.SalesFormComponent),
            },
            {
                path: 'sales/:id',
                loadComponent: () => import('./sales/sales-detail/sales-detail.component').then(m => m.SalesDetailComponent),
            },
            {
                path: 'sales/:id/edit',
                loadComponent: () => import('./sales/sales-form/sales-form.component').then(m => m.SalesFormComponent),
            },
            {
                path: 'dispatches',
                loadComponent: () => import('./sales/dispatch-list/dispatch-list.component').then(m => m.DispatchListComponent),
            },
            {
                path: 'production',
                loadComponent: () => import('./production/production-list/production-list.component').then(m => m.ProductionListComponent),
            },
            {
                path: 'invoices',
                loadComponent: () => import('./invoices/invoices-list/invoices-list.component').then(m => m.InvoicesListComponent),
            },
            {
                path: 'invoices/:id',
                loadComponent: () => import('./invoices/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent),
            },
            {
                path: 'expenses',
                loadComponent: () => import('./finance/expenses/expenses-list.component').then(m => m.ExpensesListComponent),
            },
            {
                path: 'payments',
                loadComponent: () => import('./finance/payments/payments-list.component').then(m => m.PaymentsListComponent),
            },
            {
                path: 'reports',
                loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent),
            },
        ],
    },
    { path: '**', redirectTo: 'dashboard' },
];
