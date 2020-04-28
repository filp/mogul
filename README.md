# mogul

Barebones client for Elite Dangerous commodity information, through [eddb.io](https://eddb.io). No official API is provided, so this library relies partially on scraping.

---

## Available methods:

By example:

```js
import mogul from 'mogul'

async function myMethod () {
  const client = mogul.createClient()

  // Find details for a system:
  const system = await client.findSystemByName('Tiolce')
  
  // Check if we got a hit
  if (system.match) {
    // Get a list of all commodities:
    const commodities = await client.getCommodities()

    // Or filter the list to find a commodity by name:
    const ltd = await client.getCommodities('Low Temperature Diamonds')

    // Find the stations close to Tiolce buying Low Temperature Diamonds
    const commodityId = ltd.id
    const systemId = system.match.id

    const closest = await client.findClosestSystemToSell(ltd.id, system.match.id)

    console.log(closest)
    // => Results in something like: 
    // [
    //   {
    //     station: { id: 48885, name: 'Cortes Base', isPlanetary: true },
    //     system: { id: 3318, name: "Ch'iang Fei" },
    //     price: 437,
    //     amount: 15,
    //     padSize: 'L',
    //     lastUpdate: 2019-01-19T18:58:10.615Z,
    //     stationDistance: {
    //       distance: 46,
    //       unit: 'ls',
    //       raw: '46 ls'
    //     },
    //     systemDistance: {
    //       distance: 92,
    //       unit: 'ly',
    //       raw: '92 ly'
    //     }
    //   },
    //   ...
    // ]

    // You can also look for the top place to sell a commodity:
    const bestSell = await client.findTopSystemToSell(ltd.id)

  } else {
    throw new Error('Could not find a system with that name')
  }
}
```
