import { Routes } from '@angular/router';
import {LoginComponent} from './bankCalc/auth/presentation/pages/sign_in/sign-in/sign-in';
import { SignUpComponent } from './bankCalc/auth/presentation/pages/sign_up/sign-up/sign-up';
import { Dashboard } from './bankCalc/dashboard/presentation/pages/dashboard/dashboard';
import { BonoRegisterComponent } from './bankCalc/dashboard/presentation/pages/bono_register/bono-register';
import { BonoResultado } from './bankCalc/dashboard/presentation/pages/bono_resultado/bono-resultado/bono-resultado';
import { BonoHistory } from './bankCalc/dashboard/presentation/pages/bono_history/bono-history';
import { HelpComponente } from './bankCalc/dashboard/presentation/pages/help-componente/help-componente';
import { DashboardLayoutComponent } from './bankCalc/dashboard/presentation/layout/dashboard-layout/dashboard-layout';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent},
  { path: 'signup', component: SignUpComponent},
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    children: [
      { path: '', component: Dashboard, pathMatch: 'full' },
      { path: 'bond/register', component: BonoRegisterComponent},
      { path: 'bond/resultado', component: BonoResultado},
      { path: 'bond/resultado/:id', component: BonoResultado},
      { path: 'bond/history', component: BonoHistory},
      { path: 'bond/help', component: HelpComponente},
    ]
  },
];
