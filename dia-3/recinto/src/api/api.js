import axios from 'axios';

export const http= axios.create({
    baseURL: 'http://localhost:3001/api/libre',
    timeout:8000
});
/*
 * Un interceptor de respuesta para no repetir el mismo try/catch
 * en cada action. Devuelve un objeto de error con FORMA CONOCIDA,
 * y eso es lo que hace que el store quede limpio después.
 */
http.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    // El servidor respondió, pero con un código de error.
    if (error.response) {
      return Promise.reject({
        estado: error.response.status,
        mensaje: error.response.data?.message ?? 'El servidor rechazó la petición.',
        errores: error.response.data?.errores ?? null,
        conflicto: error.response.data?.conflicto ?? null
      })
    }

    // Nunca hubo respuesta: el servidor está caído o no hay red.
    return Promise.reject({
      estado: 0,
      mensaje: 'No se pudo contactar al servidor. ¿Está corriendo en el 3001?',
      errores: null,
      conflicto: null
    })
  }
)