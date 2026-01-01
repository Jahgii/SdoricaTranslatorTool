/// <reference lib="webworker" />

import JSZip from 'jszip';
import { onReadFileDialogFromObb } from 'src/app/import/import-logic';
import { ImportOBBVerificationPostMessage, WorkerImportOBBVerificationPostMessage } from '../interfaces/i-worker';

addEventListener('message', async ({ data }) => {
  let message: ImportOBBVerificationPostMessage = data;
  let response: WorkerImportOBBVerificationPostMessage = {
    message: 'file-verified'
  };

  let file = message.file;
  let dialogAssets = {};
  let dialogAssetsInclude = {};
  let dialogAssetsMainGroups = {};
  let dialogAssetsGroups = {};

  let zipObb = new JSZip();
  try {
    await zipObb.loadAsync(file, {});

    let files = zipObb.filter((relativePath, file) => relativePath.includes("assets/DialogAssets/") && !file.dir);

    if (files.length === 0) {
      response.message = 'file-error';
      postMessage(response);
      return;
    }

    for (const dF of files) {
      let dialogFile = dF;
      const content = await dialogFile.async("string");
      onReadFileDialogFromObb(
        dialogAssets,
        dialogAssetsInclude,
        dialogAssetsMainGroups,
        dialogAssetsGroups,
        content,
        dialogFile.name
      );
    }
  } catch {
    response.message = 'file-error';
    postMessage(response);
    return;
  }

  response.message = 'file-verifying-complete';
  postMessage(response);

  response = {
    message: 'file-verified',
    dialogAssets: dialogAssets,
    dialogAssetsInclude: dialogAssetsInclude,
    dialogAssetsMainGroups: dialogAssetsMainGroups,
    dialogAssetsGroups: dialogAssetsGroups
  };

  postMessage(response);
});
