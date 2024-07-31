/// <reference lib="webworker" />

import { encode } from '@msgpack/msgpack';
import { IOnMessage, ProgressStatus } from '../interfaces/i-export-progress';
import { IGamedata, IGamedataValue } from '../interfaces/i-gamedata';
import { ExportPostMessage } from '../interfaces/i-export';
import { AppModes } from '../enums/app-modes';
import { ObjectStoreNames } from '../interfaces/i-indexed-db';

addEventListener('message', async ({ data }) => {
  let message: ExportPostMessage = data;

  const completeMessage: IOnMessage = { maxPg: 100, pg: 0, blob: undefined, pgState: ProgressStatus.retrivingServerData };
  postMessage(completeMessage);

  if (message.appMode === AppModes.Offline) {
    let request = indexedDB.open(message.dbName, message.dbVersion);
    request.onerror = (event) => onErrorOpenDB(event);
    request.onsuccess = (event) => onSuccessOpenDB(event, completeMessage, message);
  }
  else if (message.appMode === AppModes.Online) {
    await onExportOnline(completeMessage, message);
  }
});

function onErrorOpenDB(event: Event) {
  postMessage("CANT OPEN DB ON WEB WORKER");
}

function onSuccessOpenDB(event: Event, completeMessage: IOnMessage, message: ExportPostMessage) {
  let db = (event.target as any).result;
  db.onerror = (event: Event) => onError(event);

  onExportOffline(db, completeMessage, message);
}

function onError(event: Event) {
  // console.log(`Database error: ${(event.target as IDBRequest).error?.message}`);
}

function onExportOffline(db: IDBDatabase, completeMessage: IOnMessage, message: ExportPostMessage) {
  const transaction = db.transaction([ObjectStoreNames.GamedataValue]);

  transaction.oncomplete = (event) => {
    postMessage(completeMessage);
  };

  transaction.onerror = (event) => {
    //Do nothing
  };

  let values: IGamedataValue[] = [];
  const request = transaction
    .objectStore(ObjectStoreNames.GamedataValue)
    .openCursor();

  request.onsuccess = (event) => {
    let cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
    if (cursor) {
      if ((cursor.value as IGamedataValue).Custom) {
        values.push(cursor.value);
      }
      cursor.continue();
    }
    else {
      completeMessage.pgState = ProgressStatus.retrivingServerDataSucess;
      postMessage(completeMessage);
      onCreateNewGam(completeMessage, message, values);
    }
  };

  request.onerror = (event) => {
    completeMessage.pgState = ProgressStatus.retrivingServerDataError;
    postMessage(completeMessage);
  };
}

async function onExportOnline(completeMessage: IOnMessage, message: ExportPostMessage) {
  let values: IGamedataValue[] = [];

  let promise = fetch(`${message.apiUrl}api/gamedatavalues/export`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "stt-api-key": message.apiKey,
      "Authorization": `Bearer ${message.token}`
    }
  });

  await promise.then(
    async res => {
      values = await res.json();
      completeMessage.pgState = ProgressStatus.retrivingServerDataSucess;
      postMessage(completeMessage);
    },
    error => {
      completeMessage.pgState = ProgressStatus.retrivingServerDataError;
      postMessage(completeMessage);
    }
  );

  await onCreateNewGam(completeMessage, message, values);
}

async function onCreateNewGam(completeMessage: IOnMessage, message: ExportPostMessage, values: IGamedataValue[]) {
  if (values.length <= 0) {
    completeMessage.pgState = ProgressStatus.retrivingServerDataEmpty;
    postMessage(completeMessage);
    return;
  }

  completeMessage.pgState = ProgressStatus.replacingContent;
  postMessage(completeMessage);

  let category = 'BuffInfo';
  let decodeResult = message.decodeResult as IGamedata;

  values.forEach(v => {
    let finalExportValue: any[] = [];
    for (const element of decodeResult.C[category].K) {
      let keyName = element;
      finalExportValue.push(v.Content[keyName]);
    }
    decodeResult.C[category].D.push(finalExportValue);
  });

  completeMessage.pgState = ProgressStatus.generatingNewFile;
  completeMessage.maxPg = 100;
  completeMessage.pg = 0;

  postMessage(completeMessage);

  let encodeResult = encode(decodeResult);

  const blob = new Blob([encodeResult], {
    type: ''
  });

  completeMessage.pgState = ProgressStatus.finish;
  completeMessage.blob = blob;
  completeMessage.pg = 100;
  postMessage(completeMessage);
}