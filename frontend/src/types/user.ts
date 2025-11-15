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
  id_sexo: number;
  nombre_rol: string;
  nombre_ciudad: string;
  sexo: string;
  nombre_organizacion?: string;
  has_2fa?: boolean;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  count: number;
}
