/// <reference lib="webworker" />

import { encode } from '@msgpack/msgpack';
import { IOnMessage, ProgressStatus } from '../interfaces/i-export-progress';
import { IGamedata, IGamedataValue } from '../interfaces/i-gamedata';

addEventListener('message', async ({ data }) => {
  let values: IGamedataValue[] = [];
  let decodeResult = data.decodeResult as IGamedata;
  const message: IOnMessage = { maxPg: 100, pg: 0, blob: undefined, pgState: ProgressStatus.retrivingServerData };
  postMessage(message);

  let promise = fetch('api/gamedatavalues/export', {
    method: 'GET',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Bearer ${data.token}`
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

  if (values.length <= 0) {
    message.pgState = ProgressStatus.retrivingServerDataEmpty;
    postMessage(message);
    return;
  }

  message.pgState = ProgressStatus.replacingContent;
  postMessage(message);

  let category = 'BuffInfo';

  values.forEach(v => {
    let finalExportValue: any[] = [];
    for (const element of decodeResult.C[category].K) {
      let keyName = element;
      finalExportValue.push(v.Content[keyName]);
    }
    decodeResult.C[category].D.push(finalExportValue);
  });

  message.pgState = ProgressStatus.generatingNewFile;
  message.maxPg = 100;
  message.pg = 0;

  postMessage(message);

  let encodeResult = encode(decodeResult);

  const blob = new Blob([encodeResult], {
    type: ''
  });

  message.pgState = ProgressStatus.finish;
  message.blob = blob;
  message.pg = 100;
  postMessage(message);
});
