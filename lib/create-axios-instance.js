const { Agent: HttpAgent } = require('http');
const { Agent: HttpsAgent } = require('https');
const axios = require('axios');

const httpAgent = new HttpAgent({ keepAlive: true });
const httpsAgent = new HttpsAgent({ keepAlive: true });

/**
 * Create an axios instance with the http and https agents set for keepAlive
 *
 * @return {Axios} A new instance of Axios
 * See {@link https://github.com/axios/axios#creating-an-instance|Axios Creating an Instance}
 */
const createAxiosInstance = () => {
  const axiosInstance = axios.create({ httpAgent, httpsAgent });
  return axiosInstance;
};

module.exports = createAxiosInstance;
