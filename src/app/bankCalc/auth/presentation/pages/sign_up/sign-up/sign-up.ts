import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { MatError } from '@angular/material/form-field';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { Usuario } from '../../../../../core/models/usuario.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './sign-up.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatError,
    NgIf
  ],
  styleUrls: ['./sign-up.scss']
})
export class SignUpComponent implements OnInit {

  signUpForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router
  ) {
    this.signUpForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(255)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
  }

  get name(): AbstractControl {
    return this.signUpForm.get('name')!;
  }

  get email(): AbstractControl {
    return this.signUpForm.get('email')!;
  }

  get password(): AbstractControl {
    return this.signUpForm.get('password')!;
  }

  get confirmPassword(): AbstractControl {
    return this.signUpForm.get('confirmPassword')!;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
  }

  onSubmit(): void {
    if (this.signUpForm.valid) {
      const { name, email, password } = this.signUpForm.value;
      const usuarioData: Partial<Usuario> = {
        nombre: name,
        correo: email,
        contraseña: password,
        rol: 'usuario'
      };

      this.usuarioService.register(usuarioData as Usuario).subscribe({
        next: (response) => {
          console.log('Usuario registrado:', response);
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Error en el registro:', error);
        }
      });

    } else {
      this.signUpForm.markAllAsTouched();
    }
  }
} 