/// <reference lib="webworker" />

import * as JSZip from 'jszip';
import { IDialogAssetExport } from '../interfaces/i-dialog-asset';
import { IOnMessage, ProgressStatus } from '../interfaces/i-export-progress';
import { ExportPostMessage } from '../interfaces/i-export';
import { AppModes } from '../enums/app-modes';
import { ObjectStoreNames } from '../interfaces/i-indexed-db';

addEventListener('message', async ({ data }) => {
  let message: ExportPostMessage = data;

  let completeMessage: IOnMessage = { maxPg: 100, pg: 0, pgState: ProgressStatus.retrivingServerData };
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
  const transaction = db.transaction([ObjectStoreNames.DialogAsset]);

  transaction.oncomplete = (event) => {
    postMessage(completeMessage);
  };

  transaction.onerror = (event) => {
    //Do nothing
  };

  let dialogs: IDialogAssetExport[] = [];
  const request = transaction
    .objectStore(ObjectStoreNames.DialogAsset)
    .index("Language")
    .getAll("english");

  request.onsuccess = (event) => {
    dialogs = (event.target as IDBRequest).result;
    completeMessage.pgState = ProgressStatus.retrivingServerDataSucess;
    postMessage(completeMessage);

    onCreateNewObb(completeMessage, message, dialogs);
  };

  request.onerror = (event) => {
    completeMessage.pgState = ProgressStatus.retrivingServerDataError;
    postMessage(completeMessage);
  };

}

async function onExportOnline(completeMessage: IOnMessage, message: ExportPostMessage) {
  let dialogs: IDialogAssetExport[] = [];

  let promise = fetch(`${message.apiUrl}api/dialogassets/export`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "stt-api-key": message.apiKey,
      "Authorization": `Bearer ${message.token}`
    }
  });

  await promise.then(async res => {
    dialogs = await res.json();
    completeMessage.pgState = ProgressStatus.retrivingServerDataSucess;
    postMessage(completeMessage);
  }, error => {
    completeMessage.pgState = ProgressStatus.retrivingServerDataError;
    postMessage(completeMessage);
  }
  );

  onCreateNewObb(completeMessage, message, dialogs);
}

function onCreateNewObb(completeMessage: IOnMessage, message: ExportPostMessage, dialogs: IDialogAssetExport[]) {
  if (dialogs.length <= 0) {
    completeMessage.pgState = ProgressStatus.retrivingServerDataEmpty;
    postMessage(completeMessage);
    return;
  }



  if (message.exportMode == 'game-file') OnCreateNewObbGameFile(completeMessage, message, dialogs);
  else if (message.exportMode == 'file') OnCreateNewObbFile(completeMessage, message, dialogs);
  else null;


}

function OnCreateNewObbGameFile(completeMessage: IOnMessage, message: ExportPostMessage, dialogs: IDialogAssetExport[]) {
  const zip = new JSZip();
  completeMessage.pgState = ProgressStatus.replacingContent;
  postMessage(completeMessage);

  zip.loadAsync(message.file).then(() => {
    for (let index = 0; index < dialogs.length; index++) {
      let dialog = dialogs[index];
      let dialogFileName = dialog.OriginalFilename;

      delete (dialog.Id);
      delete (dialog.OriginalFilename);
      delete (dialog.Filename);
      delete (dialog.MainGroup);
      delete (dialog.Group);
      delete (dialog.Number);
      delete (dialog.Language);
      delete (dialog.Translated);

      (dialog.Model.$content as any[]).forEach(e => delete (e.OriginalText));

      zip.file(`assets/DialogAssets/${dialogFileName}`, JSON.stringify(dialog));
      completeMessage.pg = ((index + 1) * 100) / dialogs.length;
      postMessage(completeMessage);
    }

    completeMessage.pgState = ProgressStatus.generatingNewFile;
    completeMessage.maxPg = 100;
    completeMessage.pg = 0;

    postMessage(completeMessage);

    zip.generateAsync({ type: 'blob' }, (metadata) => {
      if (Math.abs(completeMessage.pg - metadata.percent) > 5 || metadata.percent === 100) {
        completeMessage.pg = metadata.percent;
        postMessage(completeMessage);
      }
    }).then(zipBlob => {
      completeMessage.pgState = ProgressStatus.finish;
      completeMessage.blob = zipBlob;
      postMessage(completeMessage);
    });
  });
}

function OnCreateNewObbFile(completeMessage: IOnMessage, message: ExportPostMessage, dialogs: IDialogAssetExport[]) {
  const zip = new JSZip();
  completeMessage.pgState = ProgressStatus.replacingContent;
  postMessage(completeMessage);

  for (let index = 0; index < dialogs.length; index++) {
    let dialog = dialogs[index];
    let dialogFileName = dialog.OriginalFilename;

    delete (dialog.Id);
    delete (dialog.OriginalFilename);
    delete (dialog.Filename);
    delete (dialog.MainGroup);
    delete (dialog.Group);
    delete (dialog.Number);
    delete (dialog.Language);
    delete (dialog.Translated);

    (dialog.Model.$content as any[]).forEach(e => delete (e.OriginalText));

    zip.file(`assets/DialogAssets/${dialogFileName}`, JSON.stringify(dialog));
    completeMessage.pg = ((index + 1) * 100) / dialogs.length;
    postMessage(completeMessage);
  }

  completeMessage.pgState = ProgressStatus.generatingNewFile;
  completeMessage.maxPg = 100;
  completeMessage.pg = 0;

  postMessage(completeMessage);

  zip.generateAsync({ type: 'blob' }, (metadata) => {
    if (Math.abs(completeMessage.pg - metadata.percent) > 5 || metadata.percent === 100) {
      completeMessage.pg = metadata.percent;
      postMessage(completeMessage);
    }
  }).then(zipBlob => {
    completeMessage.pgState = ProgressStatus.finish;
    completeMessage.blob = zipBlob;
    postMessage(completeMessage);
  });
}