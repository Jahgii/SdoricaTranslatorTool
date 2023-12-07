/// <reference lib="webworker" />

import { encode } from '@msgpack/msgpack';
import { IOnMessage, ProgressStatus } from '../interfaces/i-export-progress';
import { ILocalization, ILocalizationKey } from '../interfaces/i-localizations';

addEventListener('message', async ({ data }) => {
  var keys: ILocalizationKey[] = [];
  var decodeResult = data.decodeResult as ILocalization;
  const message: IOnMessage = { maxPg: 100, pg: 0, blob: undefined, pgState: ProgressStatus.retrivingServerData };
  postMessage(message);

  var promise = fetch('api/localizationkeys/export', {
    method: 'GET',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Bearer ${data.token}`,
      "language": data.lang
    }
  });

  await promise.then(
    async res => {
      keys = await res.json();
      message.pgState = ProgressStatus.retrivingServerDataSucess;
      postMessage(message);
    },
    error => {
      message.pgState = ProgressStatus.retrivingServerDataError;
      postMessage(message);
    }
  );

  if (!(keys.length > 0)) {
    message.pgState = ProgressStatus.retrivingServerDataEmpty;
    postMessage(message);
    return;
  }

  message.pgState = ProgressStatus.replacingContent;
  postMessage(message);
  for (let key of keys) {
    let keyIndexPosition = decodeResult.C[key.Category].K.findIndex(e => e === 'Key');
    let keyIndex = decodeResult.C[key.Category].D.findIndex(e => e[keyIndexPosition] === key.Name);

    if (keyIndex == -1) {
      let customLocalizationKey: string[] = [];

      decodeResult.C[key.Category].K.forEach((keys, index) => {
        if (index != keyIndexPosition)
          customLocalizationKey.push(key.Translations[keys]);
        else
          customLocalizationKey.push(key.Name);
      });

      decodeResult.C[key.Category].D.push(customLocalizationKey);
      keyIndex = decodeResult.C[key.Category].D.length - 1;
    }

    let languageIndex = decodeResult.C[key.Category].K.findIndex(e => e === data.lang);
    decodeResult.C[key.Category].D[keyIndex][languageIndex] = key.Translations[data.lang];
  }

  message.pgState = ProgressStatus.generatingNewFile;
  message.maxPg = 100;
  message.pg = 0;

  postMessage(message);

  var encodeResult = encode(decodeResult);

  const blob = new Blob([encodeResult], {
    type: ''
  });

  message.pgState = ProgressStatus.finish;
  message.blob = blob;
  message.pg = 100;
  postMessage(message);
});
