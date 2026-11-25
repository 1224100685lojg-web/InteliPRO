/**
 * Validaciones puras para la simulación de pago con tarjeta.
 * No almacenan datos: solo reciben cadenas y devuelven resultados.
 */

export type MarcaTarjeta = "visa" | "mastercard" | "amex" | "otra";

/** Deja únicamente los dígitos de una cadena. */
export function soloDigitos(valor: string): string {
  return (valor ?? "").replace(/\D+/g, "");
}

/** Algoritmo de Luhn para validar el dígito verificador de una tarjeta. */
export function luhn(numero: string): boolean {
  const digitos = soloDigitos(numero);
  if (digitos.length < 12) return false;

  let suma = 0;
  let duplicar = false;

  for (let indice = digitos.length - 1; indice >= 0; indice -= 1) {
    let digito = Number(digitos[indice]);
    if (!Number.isFinite(digito)) return false;

    if (duplicar) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }

    suma += digito;
    duplicar = !duplicar;
  }

  return suma > 0 && suma % 10 === 0;
}

/** Detecta la marca a partir del número (sin importar espacios). */
export function detectarMarca(numero: string): MarcaTarjeta {
  const digitos = soloDigitos(numero);
  if (!digitos) return "otra";

  if (/^4/.test(digitos)) return "visa";
  if (/^3[47]/.test(digitos)) return "amex";

  const prefijo4 = Number(digitos.slice(0, 4));
  if (
    /^5[1-5]/.test(digitos) ||
    (digitos.length >= 4 && prefijo4 >= 2221 && prefijo4 <= 2720)
  ) {
    return "mastercard";
  }

  return "otra";
}

/** Formatea el número en grupos de 4 dígitos para mostrarlo en el campo. */
export function formatearNumeroTarjeta(numero: string): string {
  const digitos = soloDigitos(numero).slice(0, 19);
  return digitos.replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** Formatea el vencimiento como MM/AA mientras se escribe. */
export function formatearVencimiento(valor: string): string {
  const digitos = soloDigitos(valor).slice(0, 4);
  if (digitos.length <= 2) return digitos;
  return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
}

/**
 * Valida el número: longitud según la marca y algoritmo de Luhn.
 * Devuelve un mensaje de error o null si es válido.
 */
export function validarNumeroTarjeta(numero: string): string | null {
  const digitos = soloDigitos(numero);

  if (!digitos) return "Ingresa el número de la tarjeta.";
  if (digitos.length < 13 || digitos.length > 19) {
    return "El número debe tener entre 13 y 19 dígitos.";
  }

  const marca = detectarMarca(digitos);

  if (marca === "amex" && digitos.length !== 15) {
    return "American Express debe tener 15 dígitos.";
  }

  if (marca === "mastercard" && digitos.length !== 16) {
    return "Mastercard debe tener 16 dígitos.";
  }

  if (marca === "visa" && ![13, 16, 19].includes(digitos.length)) {
    return "Visa debe tener 13, 16 o 19 dígitos.";
  }

  if (!luhn(digitos)) {
    return "El número de tarjeta no es válido. Revisa los dígitos.";
  }

  return null;
}

/**
 * Valida un vencimiento MM/AA que no esté vencido.
 * Devuelve un mensaje de error o null si es válido.
 */
export function validarVencimiento(valor: string): string | null {
  const digitos = soloDigitos(valor);

  if (!digitos) return "Ingresa el vencimiento (MM/AA).";
  if (digitos.length !== 4) return "Usa el formato MM/AA.";

  const mes = Number(digitos.slice(0, 2));
  const anio = 2000 + Number(digitos.slice(2, 4));

  if (!Number.isFinite(mes) || mes < 1 || mes > 12) {
    return "El mes debe estar entre 01 y 12.";
  }

  const ahora = new Date();
  const anioActual = ahora.getFullYear();
  const mesActual = ahora.getMonth() + 1;

  if (anio < anioActual || (anio === anioActual && mes < mesActual)) {
    return "La tarjeta está vencida.";
  }

  if (anio > anioActual + 20) {
    return "El año del vencimiento no es válido.";
  }

  return null;
}

/**
 * Valida el CVV: se aceptan de 3 a 4 dígitos.
 * Devuelve un mensaje de error o null si es válido.
 */
export function validarCVV(cvv: string, _marca: MarcaTarjeta = "otra"): string | null {
  const digitos = soloDigitos(cvv);

  if (!digitos) return "Ingresa el CVV.";
  if (digitos.length < 3 || digitos.length > 4) {
    return "El CVV debe tener entre 3 y 4 dígitos.";
  }

  return null;
}
