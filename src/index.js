import axios from 'axios'
import qs from 'querystring'
import camelcaseKeys from 'camelcase-keys'
import { extractCommoditiesFromHtml, extractCommodityLocationsFromHtml, extractTopSellingLocationsFromHtml } from './scraper'

const axiosOptions = {
  baseURL: 'https://eddb.io/',
  timeout: 8000,
  withCredentials: true,
  headers: {
    post: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
}

const COMMODITY_OP_SELL = 10
const COMMODITY_OP_BUY = 20

async function getCommodityRoute (api, operationCode, commodityId, systemId, additionalOptions) {
  const args = commodityRouteParams({
    commodityId,
    systemId,
    operationCode: operationCode,
    ...additionalOptions
  })

  const result = await api.post('/route/closest', qs.stringify(args))
  return extractCommodityLocationsFromHtml(result.data)
}

function commodityRouteParams (options = {}) {
  const includePlanetary = typeof options.includePlanetary === 'undefined' ? true : options.includePlanetary

  return {
    'ClosestListingForm[buySell]': options.operationCode,
    'ClosestListingForm[commodityId]': options.commodityId,
    'ClosestListingForm[includePlanetary]': includePlanetary ? 1 : 0,
    'ClosestListingForm[minLandingPad]': options.minLandingPad || '',
    'ClosestListingForm[minSupply]': options.minSupply || 0,
    'ClosestListingForm[systemId]': options.systemId
  }
}

export function createClient (options = {}) {
  const api = axios.create(axiosOptions)
  const client = {
    options,
    axiosInstance: api,

    async findTopSystemToSell (commodityId) {
      const commodityPage = await api.get(`/commodity/${commodityId}`)
      return extractTopSellingLocationsFromHtml(commodityPage.data)
    },

    async findClosestSystemToSell (commodityId, systemId, additionalOptions = {}) {
      return getCommodityRoute(api, COMMODITY_OP_SELL, commodityId, systemId, additionalOptions)
    },

    async findClosestSystemToBuy (commodityId, systemId, additionalOptions = {}) {
      return getCommodityRoute(api, COMMODITY_OP_BUY, commodityId, systemId, additionalOptions)
    },

    async findSystemByName (systemName) {
      const searchParams = {
        'system[name]': systemName,
        'system[version]': 2 // No clue
      }

      const searchResult = camelcaseKeys((await api.get('/system/search', { params: searchParams })).data, { deep: true })
      const bestMatch = searchResult[0]

      return {
        match: bestMatch,
        allResults: searchResult
      }
    },

    async getCommodities (filterByName = null) {
      const commoditiesPage = await api.get('/commodity')
      const commodities = extractCommoditiesFromHtml(commoditiesPage.data)

      if (filterByName) {
        return commodities.find(c => c.name === filterByName)
      }

      return commodities
    }
  }

  return client
}

