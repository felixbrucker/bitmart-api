const qs = require('qs');
const BitmartRestClient = require('./bitmart-rest-client');

class BitmartRestApi {
  static orderStates() {
    return {
      pending: 1,
      partially_filled: 2,
      filled: 3,
      canceled: 4,
      pending_and_partially_filled: 5,
      filled_and_canceled: 6,
    };
  };

  constructor(apiName, apiAccessKey, apiSecretKey) {
    this.client = new BitmartRestClient(apiName, apiAccessKey, apiSecretKey);
  }

  ping() {
    return this.client.doPublicRequest('get', 'ping');
  }

  getTime() {
    return this.client.doPublicRequest('get', 'time');
  }

  getSteps() {
    return this.client.doPublicRequest('get', 'steps');
  }

  getCurrencies() {
    return this.client.doPublicRequest('get', 'currencies');
  }

  getSymbols() {
    return this.client.doPublicRequest('get', 'symbols');
  }

  getSymbolsDetails() {
    return this.client.doPublicRequest('get', 'symbols_details');
  }

  getTicker(symbol = null) {
    const endpoint = symbol ? `ticker?symbol=${symbol}` : 'ticker';
    return this.client.doPublicRequest('get', endpoint);
  }

  getKLine(symbol, from, to, step = null) {
    if (!symbol) {
      throw new Error('No symbol provided!');
    }
    if (!from) {
      throw new Error('No start timestamp provided!');
    }
    if (!to) {
      throw new Error('No end timestamp provided!');
    }

    let endpoint = `symbols/${symbol}/kline`;
    const params = {};
    if (from) {
      params.from = from;
    }
    if (to) {
      params.to = to;
    }
    if (step) {
      params.step = step;
    }
    if (Object.keys(params).length > 0) {
      endpoint += qs.stringify(params, { addQueryPrefix: true });
    }

    return this.client.doPublicRequest('get', endpoint);
  }

  getOrderBook(symbol, precision = null) {
    if (!symbol) {
      throw new Error('No symbol provided!');
    }

    let endpoint = `symbols/${symbol}/orders`;
    if (precision) {
      endpoint += `?precision=${precision}`;
    }
    return this.client.doPublicRequest('get', endpoint);
  }

  getTradeHistory(symbol) {
    if (!symbol) {
      throw new Error('No symbol provided!');
    }

    return this.client.doPublicRequest('get', `symbols/${symbol}/trades`);
  }

  getWalletBalances() {
    return this.client.doPrivateRequest('get', 'wallet');
  }

  async placeOrder(symbol, amount, price, side) {
    if (!symbol) {
      throw new Error('No symbol provided!');
    }
    if (!amount) {
      throw new Error('No amount provided!');
    }
    if (!price) {
      throw new Error('No price provided!');
    }
    if (!side) {
      throw new Error('No side provided!');
    }

    const { entrust_id } = await this.client.doPrivateRequest('post', 'orders', {
      symbol,
      amount,
      price,
      side,
    });

    return entrust_id;
  }

  async cancelOrder(orderId) {
    if (!orderId) {
      throw new Error('No orderId provided!');
    }

    return this.client.doPrivateRequest('delete', `orders/${orderId}`, {
      entrust_id: orderId,
    });
  }

  async cancelAllOrders(symbol, side) {
    if (!symbol) {
      throw new Error('No symbol provided!');
    }
    if (!side) {
      throw new Error('No side provided!');
    }

    try {
      await this.client.doPrivateRequest('delete', `orders?symbol=${symbol}&side=${side}`);
    } catch (err) {
      if (err.response.status === 400) {
        // No orders to delete
        return {};
      }
      throw err;
    }
  }

  getOrders(symbol, status = BitmartRestApi.orderStates().pending_and_partially_filled, offset = 0, limit = 100) {
    if (!symbol) {
      throw new Error('No symbol provided!');
    }

    return this.client.doPrivateRequest('get', `orders?symbol=${symbol}&status=${status}&offset=${offset}&limit=${limit}`);
  }

  getOrderDetails(orderId) {
    if (!orderId) {
      throw new Error('No orderId provided!');
    }

    return this.client.doPrivateRequest('get', `orders/${orderId}`);
  }

  getPersonalTradeHistory(symbol, offset = 0, limit = 10) {
    if (!symbol) {
      throw new Error('No symbol provided!');
    }

    return this.client.doPrivateRequest('get', `trades?symbol=${symbol}&offset=${offset}&limit=${limit}`);
  }

  destroy() {
    this.client.destroy();
  }
}

module.exports = BitmartRestApi;
