/// <reference lib="webworker" />

import { encode } from '@msgpack/msgpack';
import { IOnMessage, ProgressStatus } from './core/interfaces/i-export-progress';
import { IGamedata, IGamedataValue } from './core/interfaces/i-gamedata';

addEventListener('message', async ({ data }) => {
  var values: IGamedataValue[] = [];
  var decodeResult = data.decodeResult as IGamedata;
  const message: IOnMessage = { maxPg: 100, pg: 0, blob: undefined, pgState: ProgressStatus.retrivingServerData };
  postMessage(message);

  var promise = fetch('gamedatavalues/export', {
    method: 'GET',
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });

  await promise.then(
    async res => {
      values = await res.json();
      message.pgState = ProgressStatus.retrivingServerDataSucess;
      postMessage(message);
    },
    error => {
      message.pgState = ProgressStatus.retrivingServerDataError;
      postMessage(message);
    }
  );

  if (!(values.length > 0)) {
    message.pgState = ProgressStatus.retrivingServerDataEmpty;
    postMessage(message);
    return;
  }

  message.pgState = ProgressStatus.replacingContent;
  postMessage(message);

  let category = 'BuffInfo';

  values.forEach(v => {
    let finalExportValue: any[] = [];
    for (let keyIndex = 0; keyIndex < decodeResult.C[category].K.length; keyIndex++) {
      let keyName = decodeResult.C[category].K[keyIndex];
      finalExportValue.push(v.Content[keyName]);
    }
    decodeResult.C[category].D.push(finalExportValue);
  });

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
