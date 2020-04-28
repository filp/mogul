import cheerio from 'cheerio'

const cheerioOptions = {
  normalizeWhitespace: true
}

function getIdFromHref (href) {
  const parts = href.split('/')
  return parseInt(parts[parts.length - 1])
}

function toInt (numberString, allowNaN = true) {
  const intValue = parseInt(numberString.replace(/, %}{/g, ''))

  if (isNaN(intValue)) {
    if (!allowNaN) throw new Error(`Expected number from '${numberString}' but got NaN`)
    return null
  }

  return intValue
}

export function extractCommodityLocationFromHtml (html) {
  const p = cheerio.load(html, cheerioOptions)

  const locations = []

  p('#closestListingTable tbody tr').each((_, e) => {
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
      lastUpdate: $columns.eq(6).find('.number').text(),
      stationDistance: toInt($columns.eq(7).find('.number').text()),
      systemDistance: toInt($columns.eq(8).find('.number').text())
    })
  })

  return locations
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
