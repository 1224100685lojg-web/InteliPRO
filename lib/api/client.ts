/**
 * Utilidades compartidas por la capa de API simulada.
 */

/** Error tipado lanzado por la API simulada. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    // Necesario para que instanceof funcione al compilar a ES5.
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

const LATENCIA_MIN = 350;
const LATENCIA_MAX = 600;

/** Simula la latencia de red de una petición real. */
export function delay(min = LATENCIA_MIN, max = LATENCIA_MAX): Promise<void> {
  const ms = Math.floor(min + Math.random() * (max - min + 1));
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clona datos para que los consumidores nunca muten los mocks originales.
 */
export function clonar<T>(valor: T): T {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(valor);
    } catch {
      // Continúa con el respaldo JSON.
    }
  }
  return JSON.parse(JSON.stringify(valor)) as T;
}

export function esApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** true para errores de sesión (401) o de permisos (403). */
export function esErrorDeSesion(error: unknown): boolean {
  return esApiError(error) && (error.status === 401 || error.status === 403);
}

const MENSAJES_POR_ESTADO: Record<number, string> = {
  400: "La solicitud no es válida.",
  401: "Tu sesión expiró. Inicia sesión de nuevo.",
  403: "No tienes permisos para realizar esta acción.",
  404: "No encontramos la información solicitada.",
  409: "No hay suficiente stock disponible.",
  500: "Ocurrió un error en el servidor. Intenta de nuevo.",
};

/**
 * Devuelve un mensaje listo para mostrar en la interfaz.
 */
export function mensajeDeError(error: unknown): string {
  if (esApiError(error)) {
    return error.message || MENSAJES_POR_ESTADO[error.status] || "Ocurrió un error inesperado.";
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Ocurrió un error inesperado. Intenta de nuevo.";
}
