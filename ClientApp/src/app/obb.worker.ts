/// <reference lib="webworker" />

import * as JSZip from 'jszip';
import { IDialogAssetExport } from './core/interfaces/i-dialog-asset';
import { IOnMessage, ProgressState } from './core/interfaces/i-export-progress';

addEventListener('message', async ({ data }) => {
  var dialogs: IDialogAssetExport[] = [];
  const message: IOnMessage = { maxPg: 100, pg: 0, pgState: ProgressState.retrivingServerData };
  postMessage(message);

  var promise = fetch('dialogassets/export', {
    method: 'GET',
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });

  await promise.then(
    async res => {
      dialogs = await res.json();
      message.pgState = ProgressState.retrivingServerDataSucess;
      postMessage(message);
    },
    error => {
      message.pgState = ProgressState.retrivingServerDataError;
      postMessage(message);
    }
  );

  if (!(dialogs.length > 0)) {
    message.pgState = ProgressState.retrivingServerDataEmpty;
    postMessage(message);
    return;
  }

  const zip = new JSZip();
  message.pgState = ProgressState.replacingContent;
  postMessage(message);

  zip.loadAsync(data.file).then(() => {
    for (var index = 0; index < dialogs.length; index++) {
      var dialog = dialogs[index];
      var dialogFileName = dialog.OriginalFilename;

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
      message.pg = ((index + 1) * 100) / dialogs.length;
      postMessage(message);
    }

    message.pgState = ProgressState.generatingNewFile;
    message.maxPg = 100;
    message.pg = 0;

    postMessage(message);

    zip.generateAsync({ type: 'blob' }, (metadata) => {
      message.pg = metadata.percent;
      postMessage(message);
    }).then(zipBlob => {
      message.pgState = ProgressState.finish;
      message.blob = zipBlob;
      postMessage(message);
    });
  });

});
