import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { MatError } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './sign-in.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatError,
    NgIf
  ],
  styleUrls: ['./sign-in.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
  }

  get email(): AbstractControl {
    return this.loginForm.get('email')!;
  }

  get password(): AbstractControl {
    return this.loginForm.get('password')!;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.usuarioService.login({ correo: email, password_virtual: password }).subscribe({
        next: (response) => {
          this.authService.login(response);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login failed:', error);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  navigateToSignUp(): void {
    this.router.navigate(['/signup']);
  }
}
