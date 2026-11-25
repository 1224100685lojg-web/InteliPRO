import type { Usuario } from "../types";

/**
 * Usuario de mock con contraseña. La contraseña solo se usa para validar el
 * login simulado y nunca se expone en las respuestas de la API.
 */
export interface UsuarioMock extends Usuario {
  password: string;
}

export const usuarios: UsuarioMock[] = [
  {
    id: "u-01",
    nombre: "Ana López",
    email: "cliente@intelipro.com",
    rol: "cliente",
    avatarIniciales: "AL",
    password: "cliente123",
  },
  {
    id: "u-02",
    nombre: "Carlos Méndez",
    email: "gerente@intelipro.com",
    rol: "gerente",
    tiendaId: "t-01",
    avatarIniciales: "CM",
    password: "gerente123",
  },
  {
    id: "u-03",
    nombre: "Laura Ramírez",
    email: "gerente.norte@intelipro.com",
    rol: "gerente",
    tiendaId: "t-02",
    avatarIniciales: "LR",
    password: "gerente123",
  },
  {
    id: "u-04",
    nombre: "Jorge Castillo",
    email: "gerente.sur@intelipro.com",
    rol: "gerente",
    tiendaId: "t-03",
    avatarIniciales: "JC",
    password: "gerente123",
  },
];

export const credencialesDemo = [
  {
    rol: "cliente" as const,
    email: "cliente@intelipro.com",
    password: "cliente123",
    descripcion: "Cliente · puede comprar en cualquier tienda",
  },
  {
    rol: "gerente" as const,
    email: "gerente@intelipro.com",
    password: "gerente123",
    descripcion: "Gerente · InteliPro Centro (t-01)",
  },
];
