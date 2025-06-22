import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private apiService: ApiService) { }

  register(usuario: Usuario): Observable<Usuario> {
    return this.apiService.post('/usuarios/register', usuario);
  }

  login(credentials: { correo: string, password_virtual: string }): Observable<Usuario> {
    const loginPayload = {
      correo: credentials.correo,
      password: credentials.password_virtual
    };
    return this.apiService.post('/usuarios/login', loginPayload);
  }

  getById(id: number): Observable<Usuario> {
    return this.apiService.get(`/usuarios/${id}`);
  }
} 