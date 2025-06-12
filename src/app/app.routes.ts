import { Routes } from '@angular/router';
import {LoginComponent} from './bankCalc/auth/presentation/pages/sign_in/sign-in/sign-in';
import { SignUpComponent } from './bankCalc/auth/presentation/pages/sign_up/sign-up/sign-up';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent},
  { path: 'signup', component: SignUpComponent}
];
