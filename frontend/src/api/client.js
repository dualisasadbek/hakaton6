import axios from 'axios'
import { BASE_URL } from '../utils/format.js'

// Vite proxy orqali ishlayotgan bo'lsa (development) - same-origin cookie'larni saqlash oson
const apiBaseURL = import.meta.env.DEV ? '/api' : `${BASE_URL}/api`

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  timeout: 15000,
})

let refreshPromise = null
let onUnauthorized = null

export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn
}

export const clearUnauthorizedHandler = () => {
  onUnauthorized = null
}

// Javobni {success, message, data, meta} shaklida qaytaradi
api.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    const { config, response } = error

    // 401 bo'lsa refresh qilamiz (login/me/refresh so'rovlari bundan mustasno)
    if (
      response?.status === 401 &&
      !config?._retry &&
      !config?.skipRefresh &&
      !config?._isRefresh
    ) {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(apiBaseURL + '/auth/refresh', null, { withCredentials: true })
          .then((r) => r.data)
          .catch(() => null)
          .finally(() => {
            refreshPromise = null
          })
      }

      const refreshed = await refreshPromise
      if (refreshed?.success) {
        config._retry = true
        return api(config)
      }

      if (onUnauthorized) onUnauthorized()
    }

    return Promise.reject(error)
  }
)

export default api
