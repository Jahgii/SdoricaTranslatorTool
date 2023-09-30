/// <reference lib="webworker" />

import * as JSZip from 'jszip';
import { IDialogAssetExport } from './core/interfaces/i-dialog-asset';
import { IOnMessage, ProgressStatus } from './core/interfaces/i-export-progress';

addEventListener('message', async ({ data }) => {
  var dialogs: IDialogAssetExport[] = [];
  const message: IOnMessage = { maxPg: 100, pg: 0, pgState: ProgressStatus.retrivingServerData };
  postMessage(message);

  var promise = fetch('api/dialogassets/export', {
    method: 'GET',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Bearer ${data.token}`
    }
  });

  await promise.then(
    async res => {
      dialogs = await res.json();
      message.pgState = ProgressStatus.retrivingServerDataSucess;
      postMessage(message);
    },
    error => {
      message.pgState = ProgressStatus.retrivingServerDataError;
      postMessage(message);
    }
  );

  if (!(dialogs.length > 0)) {
    message.pgState = ProgressStatus.retrivingServerDataEmpty;
    postMessage(message);
    return;
  }

  const zip = new JSZip();
  message.pgState = ProgressStatus.replacingContent;
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

    message.pgState = ProgressStatus.generatingNewFile;
    message.maxPg = 100;
    message.pg = 0;

    postMessage(message);

    zip.generateAsync({ type: 'blob' }, (metadata) => {
      message.pg = metadata.percent;
      postMessage(message);
    }).then(zipBlob => {
      message.pgState = ProgressStatus.finish;
      message.blob = zipBlob;
      postMessage(message);
    });
  });

});
