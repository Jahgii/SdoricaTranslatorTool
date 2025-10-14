/// <reference lib="webworker" />

import { encode } from '@msgpack/msgpack';
import { IOnMessage, ProgressStatus } from '../interfaces/i-export-progress';
import { ILocalization, ILocalizationKey } from '../interfaces/i-localizations';
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
  const transaction = db.transaction([ObjectStoreNames.LocalizationKey]);

  transaction.oncomplete = (event) => {
    postMessage(completeMessage);
  };

  transaction.onerror = (event) => {
    //Do nothing
  };

  let keys: ILocalizationKey[] = [];
  const request = transaction
    .objectStore(ObjectStoreNames.LocalizationKey)
    .openCursor();

  request.onsuccess = (event) => {
    let cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
    if (cursor) {
      if ((cursor.value as ILocalizationKey).Translated[message.lang]) {
        keys.push(cursor.value);
      }
      cursor.continue();
    }
    else {
      completeMessage.pgState = ProgressStatus.retrivingServerDataSucess;
      postMessage(completeMessage);
      onCreateNewLoc(completeMessage, message, keys);
    }
  };

  request.onerror = (event) => {
    completeMessage.pgState = ProgressStatus.retrivingServerDataError;
    postMessage(completeMessage);
  };
}

async function onExportOnline(completeMessage: IOnMessage, message: ExportPostMessage) {
  let keys: ILocalizationKey[] = [];

  let promise = fetch(`${message.apiUrl}api/localizationkeys/export`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "stt-api-key": message.apiKey,
      "Authorization": `Bearer ${message.token}`,
      "language": message.lang
    }
  });

  await promise.then(
    async res => {
      keys = await res.json();
      completeMessage.pgState = ProgressStatus.retrivingServerDataSucess;
      postMessage(completeMessage);
    },
    error => {
      completeMessage.pgState = ProgressStatus.retrivingServerDataError;
      postMessage(completeMessage);
    }
  );

  await onCreateNewLoc(completeMessage, message, keys);
}

async function onCreateNewLoc(completeMessage: IOnMessage, message: ExportPostMessage, keys: ILocalizationKey[]) {
  if (keys.length <= 0) {
    completeMessage.pgState = ProgressStatus.retrivingServerDataEmpty;
    postMessage(completeMessage);
    return;
  }

  completeMessage.pgState = ProgressStatus.replacingContent;
  postMessage(completeMessage);

  let decodeResult = message.decodeResult as ILocalization;
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

    let languageIndex = decodeResult.C[key.Category].K.findIndex(e => e === message.lang);
    decodeResult.C[key.Category].D[keyIndex][languageIndex] = key.Translations[message.lang];
  }

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
}