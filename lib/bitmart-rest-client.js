const crypto = require('crypto');
const axios = require('axios');
const qs = require('qs');

class BitmartRestClient {
  static getSignedMessage(message, secret) {
    return crypto.createHmac('sha256', secret).update(message).digest('hex');
  }

  constructor(apiName, apiAccessKey, apiSecretKey) {
    this.apiAccessKey = apiAccessKey;
    this.apiSecretKey = apiSecretKey;
    this.signedMessage = BitmartRestClient.getSignedMessage(`${apiAccessKey}:${apiSecretKey}:${apiName}`, apiSecretKey);
    this.accessToken = null;

    this.client = axios.create({
      baseURL: 'https://openapi.bitmart.com/v2',
      timeout: 2 * 60 * 1000,
    });

    this.addAuthenticationInterceptor();
  }

  async doPublicRequest(method, endpoint, payload = null) {
    const config = {
      method,
      url: endpoint,
      noToken: true,
    };
    if (payload) {
      config.data = payload;
    }

    const {data: result} = await this.client(config);

    return result;
  }

  async doPrivateRequest(method, endpoint, payload = null) {
    const config = {
      method,
      url: endpoint,
    };
    if (payload) {
      // Order keys for signature
      const ordered = {};
      Object.keys(payload).sort().forEach(key => {
        ordered[key] = payload[key];
      });
      config.data = ordered;
      config.headers = {
        'X-BM-SIGNATURE': BitmartRestClient.getSignedMessage(qs.stringify(ordered), this.apiSecretKey),
      };
    }

    const {data: result} = await this.client(config);

    return result;
  }

  addAuthenticationInterceptor() {
    this.client.interceptors.request.use(
      async config => {
        if (config.noToken) {
          return config;
        }

        if (!this.accessToken) {
          this.accessToken = await this.getAccessToken();
          // The accessToken expires after 15 minutes, clear it here so a new one is obtained on the next request
          this.accessTokenTimeout = setTimeout(() => {
            this.accessTokenTimeout = null;
            this.accessToken = null;
          }, 14 * 60 * 1000);
        }

        if (config.headers) {
          config.headers['X-BM-TIMESTAMP'] = new Date().getTime();
          config.headers['X-BM-AUTHORIZATION'] = `Bearer ${this.accessToken}`;
        } else {
          config.headers = {
            'X-BM-TIMESTAMP': new Date().getTime(),
            'X-BM-AUTHORIZATION': `Bearer ${this.accessToken}`,
          };
        }

        return config;
      },
      err => Promise.reject(err),
    );
  }

  async getAccessToken() {
    const {data: result} = await this.client.post('/authentication', qs.stringify({
      grant_type: 'client_credentials',
      client_id: this.apiAccessKey,
      client_secret: this.signedMessage,
    }), { noToken: true });

    return result.access_token;
  }

  destroy() {
    if (!this.accessTokenTimeout) {
      return;
    }
    clearTimeout(this.accessTokenTimeout);
  }
}

module.exports = BitmartRestClient;