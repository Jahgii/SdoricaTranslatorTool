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
  } catch (error) {
    response.message = 'file-error';
    postMessage(response);
    return;
  }

  let dialogFolder = zipObb.files['assets/DialogAssets/'];

  response.message = 'file-verifying-complete';
  postMessage(response);
  if (!dialogFolder) {
    response.message = 'file-error';
    postMessage(response);
    return;
  }

  response = {
    message: 'file-verified',
    dialogAssets: dialogAssets,
    dialogAssetsInclude: dialogAssetsInclude,
    dialogAssetsMainGroups: dialogAssetsMainGroups,
    dialogAssetsGroups: dialogAssetsGroups
  };

  postMessage(response);
});
