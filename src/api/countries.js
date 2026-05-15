import api from './base.js'

export const countriesApi = {
  getCountries(params = {}) {
    return api.get('/countries', { params })
  },
  getCountryDetail(countryCode) {
    return api.get(`/countries/${encodeURIComponent(countryCode)}`)
  },
  getCountryMapPoints(countryCode, params = {}, config = {}) {
    return api.get(`/countries/${encodeURIComponent(countryCode)}/map-points`, { params, ...config })
  },
}