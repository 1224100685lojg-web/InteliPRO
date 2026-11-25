import type { Tienda } from "../types";

// El gerenteId es el código de gerente asignado a la sucursal; los usuarios
// con rol "gerente" se vinculan a su tienda mediante Usuario.tiendaId.
export const tiendas: Tienda[] = [
  {
    id: "t-01",
    nombre: "InteliPro Centro",
    ciudad: "Ciudad de México",
    direccion: "Av. Paseo de la Reforma 222, Col. Juárez, Cuauhtémoc, CDMX",
    telefono: "55 5123 4567",
    gerenteId: "g-01",
  },
  {
    id: "t-02",
    nombre: "InteliPro Norte",
    ciudad: "Monterrey",
    direccion: "Av. Constitución 850, Centro, Monterrey, Nuevo León",
    telefono: "81 8345 6789",
    gerenteId: "g-02",
  },
  {
    id: "t-03",
    nombre: "InteliPro Sur",
    ciudad: "Puebla",
    direccion: "Blvd. Héroes del 5 de Mayo 1120, Centro, Puebla, Puebla",
    telefono: "22 2456 7890",
    gerenteId: "g-03",
  },
];
