/// <reference lib="webworker" />

import * as JSZip from 'jszip';
import { onReadFileDialogFromObb } from 'src/app/import/import-logic';

addEventListener('message', async ({ data }) => {
  let message = data;
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
    postMessage({ message: 'file-error' });
    return;
  }

  let dialogFolder = zipObb.files['assets/DialogAssets/'];

  postMessage({ message: 'file-verifying-complete' });
  if (!dialogFolder) {
    postMessage({ message: 'file-error' });
    return;
  }

  let response = {
    message: 'file-verified',
    dialogAssets: dialogAssets,
    dialogAssetsInclude: dialogAssetsInclude,
    dialogAssetsMainGroups: dialogAssetsMainGroups,
    dialogAssetsGroups: dialogAssetsGroups
  };

  postMessage(response);

});
