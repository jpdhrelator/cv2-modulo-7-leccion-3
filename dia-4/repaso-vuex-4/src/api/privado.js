import axios from 'axios'

import { router } from '../router'
import { store } from '../store'


export const privado = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 8000
})

/*
 * Interceptor de PETICIÓN: adjunta el token en cada llamada.
 * Sin esto tendrías que acordarte de poner la cabecera en cada action.
 */
privado.interceptors.request.use((config) => {
  const token = store.state.auth.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/*
 * Interceptor de RESPUESTA: acá vive la distinción que importa.
 */
privado.interceptors.response.use(
  (r) => r,
  (error) => {
    const estado = error.response?.status
    const datos  = error.response?.data

    // 401 → nunca hubo credencial. Al login.
    if (estado === 401) {
      store.commit('auth/CERRAR')
      router.push({ name: 'login' })
    }

    /*
     * 403 → hay credencial pero no sirve. Y hay que distinguir:
     *
     * Si el cuerpo trae `rolActual`, es un problema de PERMISOS: la
     * sesión está bien. Mandarlo al login sería un bug — volvería a
     * entrar y recibiría el mismo 403.
     *
     * Si no lo trae, el token está inválido o expiró: ahí sí, al login.
     */
    if (estado === 403 && !datos?.rolActual) {
      store.commit('auth/CERRAR')
      router.push({ name: 'login', query: { expirada: '1' } })
    }

    return Promise.reject({
      estado,
      mensaje: datos?.message ?? 'Error de red',
      errores: datos?.errores ?? null,
      esPermiso: Boolean(datos?.rolActual)
    })
  }
)