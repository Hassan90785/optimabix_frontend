import { Component } from '@angular/core';
import {Card} from 'primeng/card';
import {CommonModule} from '@angular/common';
import {UIChart} from 'primeng/chart';
import {TableModule} from 'primeng/table';

@Component({
  selector: 'app-client-dashboard',
  imports: [
    CommonModule,
    Card,
    UIChart,
    TableModule
  ],
  templateUrl: './client-dashboard.component.html',
  standalone: true,
  styleUrl: './client-dashboard.component.scss'
})
export class ClientDashboardComponent {
  // Sample Data for KPIs
  kpis = {
    totalSales: 150000,
    totalPayments: 140000,
    totalVendors: 25,
    topProduct: 'Wireless Headphones'
  };

  // Sample Chart Data for Sales Overview
  salesChartData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Sales',
        data: [12000, 19000, 30000, 25000, 32000],
        borderColor: '#42A5F5',
        fill: false,
      },
    ],
  };

  // Sample Chart Data for Payment Insights
  paymentChartData = {
    labels: ['Cash', 'Credit Card', 'Bank Transfer'],
    datasets: [
      {
        data: [55, 25, 20],
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
      },
    ],
  };

  // Sample Inventory Data
  inventoryData = [
    { product: 'Laptop', quantity: 10, value: 15000 },
    { product: 'Monitor', quantity: 5, value: 5000 },
    { product: 'Keyboard', quantity: 15, value: 3000 },
  ];


  // Sample Top Products
  topProducts = ['Wireless Headphones', 'Gaming Laptop', 'Smartphone'];
}
