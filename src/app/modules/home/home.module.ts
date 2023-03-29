import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';

export const homeRoutes = [
  {
    path: 'dashboard',
    component: DashboardComponent
  },
]

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    NgChartsModule,
    RouterModule.forChild(homeRoutes)
  ]
})
export class HomeModule { }
