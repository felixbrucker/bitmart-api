Bitmart API
======

[![Software License](https://img.shields.io/badge/license-GPL--3.0-brightgreen.svg?style=flat-square)](LICENSE)
[![npm](https://img.shields.io/npm/v/bitmart-api.svg?style=flat-square)](https://www.npmjs.com/package/bitmart-api)

## Usage

```javascript
const { BitmartRestApi } = require('bitmart-api');

(async () => {
  const client = new BitmartRestApi('my-api-name', 'my-api-key', 'my-api-secret');

  try {
    // Public api, works without api name, api key and api secret
    await client.ping();
    const time = await client.getTime();
    const steps = await client.getSteps();
    const currencies = await client.getCurrencies();
    const symbols = await client.getSymbols();
    const symbolsDetails = await client.getSymbolsDetails();
    const ticker = await client.getTicker();
    const tickerBHD = await client.getTicker('BHD_ETH');
    const kline = await client.getKLine('BHD_ETH', '1551989741215', '1552075987650');
    const orderBook = await client.getOrderBook('BHD_ETH');
    const tradeHistory = await client.getTradeHistory('BHD_ETH');

    // Private api, requires api name, api key and api secret
    const walletBalances = await client.getWalletBalances();
    const orderId = await client.placeOrder('BHD_ETH', 1, 0.05, 'sell');
    await client.cancelOrder(orderId);
    await client.cancelAllOrders('BHD_ETH', 'sell');
    const orders = await client.getOrders('BHD_ETH');
    const canceledOrders = await client.getOrders('BHD_ETH', BitmartRestApi.orderStates().canceled);
    const orderDetails = await client.getOrderDetails(canceledOrders.orders[0].entrust_id);
    const personalTradeHistory = await client.getPersonalTradeHistory('BHD_ETH');
  } catch (err) {
    console.error(err);
  }
  
  client.destroy();
})();
```

## License

GNU GPLv3 (see [LICENSE](https://github.com/felixbrucker/bitmart-api/blob/master/LICENSE))
