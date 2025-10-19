/// <reference lib="webworker" />

import { encode } from '@msgpack/msgpack';
import { ExportMessages, IOnMessage, ProgressStatus } from '../interfaces/i-export-progress';
import { ExportPostMessage } from '../interfaces/i-export';
import { AppModes } from '../enums/app-modes';
import { IGamedataValue } from '../interfaces/i-gamedata';
import { ObjectStoreNames } from '../interfaces/i-indexed-db';
import { IDialogAsset } from '../interfaces/i-dialog-asset';
import { ILocalizationKey } from '../interfaces/i-localizations';
import { ICommonWord } from '../interfaces/i-common-word';
import { IExportAll } from '../interfaces/i-export-all';

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

function onError(event: Event) {
  // console.log(`Database error: ${(event.target as IDBRequest).error?.message}`);
}

function onSuccessOpenDB(event: Event, completeMessage: IOnMessage, message: ExportPostMessage) {
  let db = (event.target as any).result;
  db.onerror = (event: Event) => onError(event);

  onExportOffline(db, completeMessage, message);
}

function onExportOffline(db: IDBDatabase, completeMessage: IOnMessage, message: ExportPostMessage) {
  const transaction = db.transaction([
    ObjectStoreNames.DialogAsset,
    ObjectStoreNames.GamedataValue,
    ObjectStoreNames.LocalizationKey,
    ObjectStoreNames.CommonWord
  ]);

  let valuesGV: IGamedataValue[] = [];
  let valuesDA: IDialogAsset[] = [];
  let valuesK: ILocalizationKey[] = [];
  let valuesC: ICommonWord[] = [];

  transaction.oncomplete = (event) => {
    let values: IExportAll = {
      L: message.lang,
      GV: valuesGV,
      DA: valuesDA,
      K: valuesK,
      C: valuesC
    };
    onCreate(completeMessage, message, values);
    postMessage(completeMessage);
  };

  transaction.onerror = (event) => {
    //Do nothing
  };

  const requestGV = transaction
    .objectStore(ObjectStoreNames.GamedataValue)
    .openCursor();

  postMessage(ExportMessages.retrivingServerDataGamedataValues);
  requestGV.onsuccess = (event) => {
    let cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
    if (cursor) {
      if ((cursor.value as IGamedataValue).Custom) {
        valuesGV.push(cursor.value);
      }
      cursor.continue();
    }
    else if (valuesGV.length === 0)
      postMessage(ExportMessages.retrivingServerDataGamedataValuesEmpty);
    else
      postMessage(ExportMessages.retrivingServerDataGamedataValuesSuccess);
  };

  requestGV.onerror = (event) => {
    postMessage(ExportMessages.retrivingServerDataGamedataValuesError);
  };

  let requestDA: IDBRequest<any[]>;
  let onsuccessDA: ((this: IDBRequest<any[]>, ev: Event) => any);
  if (isGeckoBased()) {
    requestDA = transaction
      .objectStore(ObjectStoreNames.DialogAsset)
      .index("Language")
      .getAll("english");

    onsuccessDA = (event) => {
      valuesDA = (event.target as IDBRequest).result;
      valuesDA = valuesDA.filter(d => d.Translated);

      if (valuesDA.length === 0)
        postMessage(ExportMessages.retrivingServerDataDialogsEmpty);
      else
        postMessage(ExportMessages.retrivingServerDataDialogsSuccess);
    };
  }
  else {
    requestDA = transaction
      .objectStore(ObjectStoreNames.DialogAsset)
      .index("Translated")
      .getAll(["english", true] as any);

    onsuccessDA = (event) => {
      valuesDA = (event.target as IDBRequest).result;

      if (valuesDA.length === 0)
        postMessage(ExportMessages.retrivingServerDataDialogsEmpty);
      else
        postMessage(ExportMessages.retrivingServerDataDialogsSuccess);
    };
  }

  postMessage(ExportMessages.retrivingServerDataDialogs);
  requestDA.onsuccess = onsuccessDA;

  requestDA.onerror = (event) => {
    postMessage(ExportMessages.retrivingServerDataDialogsError);
  };

  const requestK = transaction
    .objectStore(ObjectStoreNames.LocalizationKey)
    .openCursor();

  postMessage(ExportMessages.retrivingServerDataKeys);
  requestK.onsuccess = (event) => {
    let cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
    if (cursor) {
      if ((cursor.value as ILocalizationKey).Translated[message.lang]) {
        valuesK.push(cursor.value);
      }
      cursor.continue();
    }
    else if (valuesK.length === 0)
      postMessage(ExportMessages.retrivingServerDataKeysEmpty);
    else
      postMessage(ExportMessages.retrivingServerDataKeysSuccess);

  };

  requestK.onerror = (event) => {
    postMessage(ExportMessages.retrivingServerDataKeysError);
  };

  const requestC = transaction
    .objectStore(ObjectStoreNames.CommonWord)
    .getAll();

  postMessage(ExportMessages.retrivingServerDataCommonwords);
  requestC.onsuccess = (event) => {
    valuesC = (event.target as IDBRequest).result;

    if (valuesC.length === 0)
      postMessage(ExportMessages.retrivingServerDataCommonwordsEmpty);
    else
      postMessage(ExportMessages.retrivingServerDataCommonwordsSuccess);
  };

  requestC.onerror = (event) => {
    postMessage(ExportMessages.retrivingServerDataCommonwordsError);
  };

}

async function onExportOnline(completeMessage: IOnMessage, message: ExportPostMessage) {
  let valuesGV: IGamedataValue[] = [];
  let valuesDA: IDialogAsset[] = [];
  let valuesK: ILocalizationKey[] = [];
  let valuesC: ICommonWord[] = [];

  let fetchGV = fetch(`${message.apiUrl}api/gamedatavalues/export`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "stt-api-key": message.apiKey,
      "Authorization": `Bearer ${message.token}`
    }
  });

  postMessage(ExportMessages.retrivingServerDataGamedataValues);
  let promiseGV = fetchGV.then(
    async res => {
      valuesGV = await res.json();

      if (valuesGV.length === 0)
        postMessage(ExportMessages.retrivingServerDataGamedataValuesEmpty);
      else
        postMessage(ExportMessages.retrivingServerDataGamedataValuesSuccess);
    },
    _ => {
      postMessage(ExportMessages.retrivingServerDataGamedataValuesError);

    }
  );

  let fetchDA = fetch(`${message.apiUrl}api/dialogassets/export`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "stt-api-key": message.apiKey,
      "Authorization": `Bearer ${message.token}`
    }
  });

  postMessage(ExportMessages.retrivingServerDataDialogs);
  let promiseDA = fetchDA.then(async res => {
    valuesDA = await res.json();

    if (valuesDA.length === 0)
      postMessage(ExportMessages.retrivingServerDataDialogsEmpty);
    else
      postMessage(ExportMessages.retrivingServerDataDialogsSuccess);
  }, _ => {
    postMessage(ExportMessages.retrivingServerDataDialogsError);
  }
  );

  let fetchK = fetch(`${message.apiUrl}api/localizationkeys/export`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "stt-api-key": message.apiKey,
      "Authorization": `Bearer ${message.token}`,
      "language": message.lang
    }
  });

  postMessage(ExportMessages.retrivingServerDataKeys);
  let promiseK = fetchK.then(async res => {
    valuesK = await res.json();

    if (valuesK.length === 0)
      postMessage(ExportMessages.retrivingServerDataKeysEmpty);
    else
      postMessage(ExportMessages.retrivingServerDataKeysSuccess);
  }, _ => {
    postMessage(ExportMessages.retrivingServerDataKeysError);
  }
  );

  let fetchC = fetch(`${message.apiUrl}api/commonWords`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "stt-api-key": message.apiKey,
      "Authorization": `Bearer ${message.token}`,
      "language": message.lang
    }
  });

  postMessage(ExportMessages.retrivingServerDataCommonwords);
  let promiseC = fetchC.then(async res => {
    valuesC = await res.json();

    if (valuesC.length === 0)
      postMessage(ExportMessages.retrivingServerDataCommonwordsEmpty);
    else
      postMessage(ExportMessages.retrivingServerDataCommonwordsSuccess);

    return valuesC;
  }, _ => {
    postMessage(ExportMessages.retrivingServerDataCommonwordsError);
  }
  );

  await Promise.all([
    promiseGV,
    promiseDA,
    promiseK,
    promiseC
  ]).then(_ => {
    let values: IExportAll = {
      L: message.lang,
      GV: valuesGV,
      DA: valuesDA,
      K: valuesK,
      C: valuesC
    };
    onCreate(completeMessage, message, values);
    postMessage(completeMessage);
  });
}

async function onCreate(completeMessage: IOnMessage, message: ExportPostMessage, values: IExportAll) {
  completeMessage.pgState = ProgressStatus.generatingNewFile;
  completeMessage.maxPg = 100;
  completeMessage.pg = 0;

  postMessage(completeMessage);

  let encodeResult = encode(values) as any;

  const blob = new Blob([encodeResult], {
    type: 'application/octet-stream'
  });

  completeMessage.pgState = ProgressStatus.finish;
  completeMessage.blob = blob;
  completeMessage.pg = 100;
}

function isGeckoBased(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('firefox') || ua.includes('gecko');
}