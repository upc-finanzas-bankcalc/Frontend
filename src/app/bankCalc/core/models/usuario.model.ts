export interface Usuario {
  idUsuario: number;
  nombre: string;
  correo: string;
  contraseña?: string; // It is optional as it will not always be sent
  rol: 'admin' | 'usuario';
  fechaRegistro: Date;
} 