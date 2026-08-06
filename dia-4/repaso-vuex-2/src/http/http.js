import axios from 'axios';

export const http = axios.create({
  baseURL: 'http://localhost:3001/api/libre',
  timeout: 8000
});


http.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    // El servidor respondió, pero con un código de error.
    if (error.response) {
      return Promise.reject({
        estado: error.response.status,
        mensaje: error.response.data?.message ?? 'El servidor rechazó la petición.',
        errores: error.response.data?.errores ?? null
      })
    }

    // Nunca hubo respuesta: servidor caído o sin red.
    return Promise.reject({
      estado: 0,
      mensaje: 'No se pudo contactar al servidor. ¿Está corriendo en el 3001?',
      errores: null
    })
  }
)