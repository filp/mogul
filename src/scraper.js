import cheerio from 'cheerio'

const oneMinute = 60000
const oneDay = 86400000

const cheerioOptions = {
  normalizeWhitespace: true
}

function getIdFromHref (href) {
  const parts = href.split('/')
  return parseInt(parts[parts.length - 1])
}

function distanceObjectFromString (distanceString) {
  const parts = distanceString.split(' ')

  return {
    distance: parseFloat(parts[0]),
    unit: parts[1],
    raw: distanceString,
    toString: () => distanceString
  }
}

function timeStringToDate (timeString) {
  const parts = timeString.split(' ')
  const value = parseInt(parts[0])
  const unit = parts[1]
  const now = Date.now()

  if (unit === 'days') {
    return new Date(now - (value * oneDay))
  } else if (unit === 'mins') {
    return new Date(now - (value * oneMinute))
  } else {
    throw new Error(`Unexpected unit '${unit}' when trying to parse time '${timeString}'`)
  }
}

function toInt (numberString, allowNaN = true) {
  const intValue = parseInt(numberString.replace(/, %}{/g, ''))

  if (isNaN(intValue)) {
    if (!allowNaN) throw new Error(`Expected number from '${numberString}' but got NaN`)
    return null
  }

  return intValue
}

function extractCommodityLocationFromTable (tableId, html) {
  const p = cheerio.load(html, cheerioOptions)

  const locations = []

  p(`${tableId} tbody tr`).each((_, e) => {
    const $columns = p(e).children('td')

    const $nameParent = $columns.eq(0)
    const $nameEl = $nameParent.find('a')
    const stationName = $nameEl.text()

    const stationId = getIdFromHref($nameEl.attr('href'))

    const isPlanetary = $nameParent.find('i.icon-planet').length > 0

    const $systemEl = $columns.eq(1).find('a')
    const systemName = $systemEl.text()
    const systemId = getIdFromHref($systemEl.attr('href'))

    locations.push({
      station: {
        id: stationId,
        name: stationName,
        isPlanetary
      },

      system: {
        id: systemId,
        name: systemName
      },

      price: toInt($columns.eq(2).text(), false),
      amount: toInt($columns.eq(4).text(), false),
      padSize: $columns.eq(5).find('.number').text(),
      lastUpdate: timeStringToDate($columns.eq(6).find('.number').text()),
      stationDistance: distanceObjectFromString($columns.eq(7).find('.number').text()),
      systemDistance: distanceObjectFromString($columns.eq(8).find('.number').text())
    })
  })

  return locations
}

export function extractTopSellingLocationsFromHtml (html) {
  return extractCommodityLocationFromTable('#table-stations-max-sell', html)
}

export function extractCommodityLocationsFromHtml (html) {
  return extractCommodityLocationFromTable('#closestListingTable', html)
}

export function extractCommoditiesFromHtml (html) {
  const commodities = []
  const p = cheerio.load(html, cheerioOptions)

  p('#commodities-table tbody tr:not(.group)').each((_, e) => {
    const $el = p(e)
    const $nameEl = $el.find('td a')
    const commodityId = getIdFromHref($nameEl.attr('href'))

    const commodityValues = $el.find('td .number')

    commodities.push({
      name: $nameEl.text(),
      id: commodityId,
      bestBuyPrice: toInt(commodityValues.eq(0).text()),
      averagePrice: toInt(commodityValues.eq(1).text()),
      bestSellPrice: toInt(commodityValues.eq(2).text()),
      maximumProfit: toInt(commodityValues.eq(3).text()),
      coverageStationsBuying: toInt(commodityValues.eq(4).text(), false),
      coverageStationsSelling: toInt(commodityValues.eq(5).text(), false)
    })
  })

  return commodities
}
