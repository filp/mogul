# mogul

Barebones client for Elite Dangerous commodity information, through [eddb.io](https://eddb.io). No official API is provided, so this library relies partially on scraping.

---

## methods

By example:

```js
import mogul from 'mogul'

async function myMethod () {
  const client = mogul.createClient()

  // Find details for a system:
  const system = await client.findSystemByName('Tiolce')
  
  // Check if we got a hit
  if (system.match) {
    // Find all available commodities:
    const commodities = await client.getCommodities()

    // Find 'Low Temperature Diamonds', and get its id:
    const ltd = commodities.find(commodity => commodity.name === 'Low Temperature Diamonds')

    // Find the stations close to Tiolce buying Low Temperature Diamonds
    const commodityId = ltd.id
    const systemId = system.match.id

    const results = await client.findClosestSystemToSell(ltd.id, system.match.id)

    console.log(results)
    // => Results in something like: 
    // [
    //   {
    //     station: { id: 63129, name: 'Black Hide', isPlanetary: true },
    //     system: { id: 19341, name: 'Wyrd' },
    //     price: 441,
    //     amount: 2,
    //     padSize: 'L',
    //     lastUpdate: '21 mins',
    //     stationDistance: 9,
    //     systemDistance: 75
    //   },
    //   {
    //     station: { id: 48885, name: 'Cortes Base', isPlanetary: true },
    //     system: { id: 3318, name: "Ch'iang Fei" },
    //     price: 437,
    //     amount: 15,
    //     padSize: 'L',
    //     lastUpdate: '487 days',
    //     stationDistance: 19,
    //     systemDistance: 92
    //   },
    //   ...
    // ]
  } else {
    throw new Error('Could not find a system with that name')
  }
}
```
