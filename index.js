const consola = require('consola');
const webvtt = require('node-webvtt');
const fs = require('fs');
const _ = require('lodash');
const glob = require('glob');
const path = require('path');

require('dotenv').config();

const { TranslateServiceClient } = require('./lib/TranslateServiceClient');

// Check the environment variables are configured in the .env file
if (
  !process.env.BASEURL ||
  !process.env.SUBSCRIPTIONKEY ||
  !process.env.SUBSCRIPTIONLOCATION ||
  !process.env.SOURCE ||
  !process.env.LOCALES
) {
  consola.error(
    'Missing critical env vars. Make sure all variables are defined in .env file. Aborting. '
  );
  process.exit(1);
}

const getTranslateClient = () => {
  return new TranslateServiceClient({
    baseURL: process.env.BASEURL,
    subscriptionKey: process.env.SUBSCRIPTIONKEY,
    subscriptionLocation: process.env.SUBSCRIPTIONLOCATION,
  });
};

const getCaptions = (filepath) => {
  return new Promise((resolve, reject) => {
    try {
      const captionFile = fs.readFileSync(filepath, { encoding: 'utf8', flag: 'r' });
      const captions = webvtt.parse(captionFile, { meta: true });
      consola.info(`Read captions from ${filepath}`);
      resolve(captions);
    } catch (error) {
      consola.error(error);
      reject(error);
    }
  });
};

const saveCaptions = (filepath, captions) => {
  return new Promise((resolve, reject) => {
    try {
      fs.writeFileSync(filepath, captions, { encoding: 'utf8', flag: 'w' });
      consola.info(`Written captions to ${filepath}`);
      resolve();
    } catch (error) {
      consola.error(error);
      reject(error);
    }
  });
};

const getTranslation = (text, to = 'it', client = getTranslateClient()) => {
  return client.sendRequest({
    method: 'post',
    resource: 'translate',
    params: {
      'api-version': '3.0', // This is an additional custom query parameter
      from: 'en',
      to,
    },
    data: [{ text }],
  });
};

const translateAllCues = async (sourceCaptions, to = 'it', client = getTranslateClient()) => {
  consola.info(`Translating cues to ${to}`);
  const translated = _.cloneDeep(sourceCaptions);

  const promises = await sourceCaptions.cues.map(async (cue) => {
    const translatedCue = _.cloneDeep(cue);
    const translatedText = await getTranslation(cue.text, to, client);
    translatedCue.text = translatedText.data[0].translations[0].text;
    return translatedCue;
  });

  const translatedCues = await Promise.all(promises);
  translated.cues = translatedCues;
  return translated;
};

/**
 * Translate captions from a source WEBVTT object to a destination file
 *
 * @param {*} sourceCaptions
 * @param {*} destination
 * @param {string} [to='it']
 * @param {*} [client=getTranslateClient()]
 * @return {*}
 */
const translateCaptions = (
  sourceCaptions,
  destination,
  to = 'it',
  client = getTranslateClient()
) => {
  return translateAllCues(sourceCaptions, to, client).then((translated) => {
    const newCaptions = webvtt.compile(translated);
    return saveCaptions(destination, newCaptions);
  });
};

/**
 * Load and translate captions from a source file to destination files
 *
 * @param {*} source
 * @param {*} destination
 * @param {string} [to='it']
 * @param {*} [client=getTranslateClient()]
 * @return {*}
 */
const translateFile = (source, destination, to = 'it', client = getTranslateClient()) => {
  return getCaptions(source).then((sourceCaptions) => {
    return translateCaptions(sourceCaptions, destination, to, client);
  });
};

const getCaptionFiles = (pattern) => {
  return new Promise((resolve, reject) => {
    glob(pattern, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
};

const main = async () => {
  const client = getTranslateClient();
  const locales = process.env.LOCALES.split(',');
  const translatePromises = [];

  await getCaptionFiles(process.env.SOURCE).then((files) => {
    files.forEach((file) => {
      // Get the source filename
      const xtension = path.extname(file);
      const basename = path.basename(file, xtension);
      locales.forEach((locale) => {
        translatePromises.push(
          translateFile(file, `./output/${basename}.${locale}${xtension}`, locale, client)
        );
      });
    });
  });

  await Promise.all(translatePromises);
};

main();
