# translate-webvtt

Demonstrates using the [Azure Translate Service](https://docs.microsoft.com/en-gb/azure/cognitive-services/translator/reference/v3-0-translate) to translate WEBVTT file.

The code will find all files that match the SOURCE glob specifed, and translate to all the LOCALES specfied.

Translated files will be written to:

```
output/{basename}.{locale}.{extension}
```

So for example if the source file is `captions.vtt`, and we translate into German (de), French (fr) and Italian (it) we would get:

```
output/captions.de.vtt
output/captions.ft.vtt
output/captions.it.vtt
```

# Configuration

## Environment Configuration

Set the following environment variables, or create a .env file by copying [.env.example](.env.example) to .env and populating the values.

| ENV                  | Required | Description                                                                                                                                                                                                                                                                                                           |
| -------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BASE_URL             | Required | This is set to the base URL for the translator. Use [https://api.cognitive.microsofttranslator.com/translate](https://api.cognitive.microsofttranslator.com/translate)                                                                                                                                                |
| SUBSCRIPTIONKEY      | Required | This is the Azure subscriptionKey. See [Create a Translator Resource](https://docs.microsoft.com/en-gb/azure/cognitive-services/translator/translator-how-to-signup)                                                                                                                                                  |
| SUBSCRIPTIONLOCATION | Required | This is the Azure subscription location. See [Create a Translator Resource](https://docs.microsoft.com/en-gb/azure/cognitive-services/translator/translator-how-to-signup)                                                                                                                                            |
| SOURCE               | Required | This is glob for the source WEBVTT files in English to translate.                                                                                                                                                                                                                                                     |
| LOCALES              | Required | This is a comma delimited list of the locales to translate the WBVTT files to. Must be supported languages see [https://docs.microsoft.com/en-gb/azure/cognitive-services/translator/language-support#translation](https://docs.microsoft.com/en-gb/azure/cognitive-services/translator/language-support#translation) |

<br/>

# Running the application

After ensuring the configuration is complete, and **npm install** has been run you can simply run the app:

```bash
npm start
```

or

```bash
node ./index.js
```

# Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

# License

MIT © martinholden-skillsoft
