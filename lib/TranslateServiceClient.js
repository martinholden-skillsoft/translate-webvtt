const { v4: uuidv4 } = require('uuid');
const validUrl = require('valid-url');
const _ = require('lodash');

const createAxiosInstance = require('./create-axios-instance');

/**
 * An Axios Client that provides a consistent approach for making Percipio API requests.
 * @category Percipio Client
 */
class TranslateServiceClient {
  /**
   * Creates an instance of TranslateServiceClient.
   * @param {Object} configuration - The configuration
   * @param {String} configuration.baseURL - The base URL for the API
   * @param {String} configuration.subscriptionId - The organization ID
   * @param {Object} [configuration.instance] - The Axios instance to use,
   *  defaults to using {@link createAxiosInstance}.
   * @param {Object} [configuration.resourcePlaceholders={}]
   *   Used to replace placeholders in the resource path.
   * @memberof TranslateServiceClient
   */
  constructor(configuration = {}) {
    this.configuration = _.merge({ resourcePlaceholders: {} }, _.cloneDeep(configuration));

    if (!('baseURL' in this.configuration)) {
      throw new Error('baseURL is a required configuration property');
    }

    if (!validUrl.isHttpsUri(this.configuration.baseURL)) {
      throw new Error('baseURL is invalid, it must be a valid https URL');
    }

    if (!('subscriptionKey' in this.configuration)) {
      throw new Error('subscriptionKey is a required configuration property');
    }

    if (!('subscriptionLocation' in this.configuration)) {
      throw new Error('subscriptionLocation is a required configuration property');
    }

    this.configuration = _.merge(this.configuration, {
      resourcePlaceholders: {},
    });

    this.id = uuidv4();

    this.defaultHeaders = {
      'Content-type': 'application/json',
      'Ocp-Apim-Subscription-Key': this.configuration.subscriptionKey,
      'Ocp-Apim-Subscription-Region': this.configuration.subscriptionLocation,
    };

    this.instance = this.configuration.instance || createAxiosInstance();

    const check =
      typeof this.instance.create === 'function' &&
      typeof this.instance.request === 'function' &&
      typeof this.instance.interceptors === 'object';

    if (!check) {
      throw new Error('instance is invalid, it must be an instance of Axios');
    }
  }

  /**
   * Builds the path for the resource, replacing any placeholders
   * with the values from configuration.resourcePlaceholders and the
   * extraPlaceholders. Values in configuration.resourcePlaceholders
   * take precedence.
   *
   * @param {String} resource - The resource path template
   * @param {Object} [extraPlaceholders = {}] - Additional placeholders to replace.
   * @return {String}
   * @throws {PropertyRequiredError} {placeHolder} is a required
   *                                 configuration.resourcePlaceholders property
   * @memberof TranslateServiceClient
   */
  buildPath(resource, extraPlaceholders = {}) {
    const placeholders = _.merge({}, extraPlaceholders, this.configuration.resourcePlaceholders);

    return resource.replace(/{([-_a-zA-Z0-9[\]]+)}/g, (original, placeHolder) => {
      if (placeHolder in placeholders) {
        return placeholders[placeHolder];
      }

      throw new Error(`${placeHolder} is a required configuration.resourcePlaceholders property`);
    });
  }

  /**
   * Builds the headers for the request, combining the default headers with the extra headers.
   * All keys are normalized to lowercase.
   *
   * @param {Object} headers - The extra headers to send with the request, as key/value pairs.
   * @return {Object}
   * @throws {PropertyInvalidError} The authorization header is not valid. Value: {authorization}
   *                                if the authorization header does not start with 'Bearer'
   * @memberof TranslateServiceClient
   */
  buildHeaders(headers) {
    const lowercaseKeys = (obj) =>
      Object.keys(obj).reduce((acc, key) => {
        acc[key.toLowerCase()] = obj[key];
        return acc;
      }, {});

    const result = _.merge({}, this.defaultHeaders, headers ? lowercaseKeys(headers) : {});

    if ('authorization' in result && !result.authorization.startsWith('Bearer ')) {
      throw new Error(`The authorization header is not valid. Value: ${result.authorization}`);
    }

    return result;
  }

  /**
   * Sends the request to the API.
   *
   * @param {Object} config
   * @param {String} config.resource - The resource path to send the request to.
   * @param {Object} [config.extraPlaceholders = {}] - Additional placeholders to replace.
   * @param {Object} [config.params={}] - The params to send with the request.
   * @param {Object} [config.data={}] - The data to send with the request.
   * @param {Object} [config.headers={}] - The headers to send with the request,
   *                                       these will be merged with the default
   *                                       headers (authorization and content-type)
   * @param {*} [config.other] - Any other Axios Request Config properties to pass to the request.
   *                      See {@link https://github.com/axios/axios#request-config|Axios Request Config}
   * @return {Promise}
   * @memberof TranslateServiceClient
   */
  sendRequest(config) {
    const { resource, extraPlaceholders = {}, params = {}, data = {}, headers, ...other } = config;

    if (!resource) {
      return Promise.reject(new Error('resource is a required configuration property'));
    }

    const requestConfig = {
      baseURL: this.configuration.baseURL,
      ...other,
    };

    try {
      requestConfig.url = this.buildPath(resource, extraPlaceholders);
    } catch (error) {
      return Promise.reject(error);
    }

    try {
      requestConfig.headers = this.buildHeaders(headers);
    } catch (error) {
      return Promise.reject(error);
    }

    requestConfig.data = data;

    requestConfig.params = params;

    return this.instance.request(requestConfig);
  }
}

module.exports = {
  TranslateServiceClient,
};
