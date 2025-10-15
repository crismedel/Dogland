export interface User {
  id_usuario: number;
  nombre_usuario: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  email: string;
  fecha_nacimiento: string;
  fecha_creacion: string;
  activo: boolean;
  nombre_rol: string;
  nombre_ciudad: string;
  sexo: string;
  nombre_organizacion?: string;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  count: number;
}