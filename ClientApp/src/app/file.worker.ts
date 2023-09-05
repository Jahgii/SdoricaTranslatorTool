/// <reference lib="webworker" />

import * as JSZip from 'jszip';

addEventListener('message', ({ data }) => {
  const message = { maxPg: 100, pg: 0, zipBlob: undefined, pgState: 'loading' };
  postMessage(message);

  const zip = new JSZip();
  zip.loadAsync(data.file).then(() => {
    for (var index = 0; index < data.dialogs.length; index++) {
      var dialog = data.dialogs[index];
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
      message.pg = ((index + 1) * 100) / data.dialogs.length;
      postMessage(message);
    }

    message.pgState = 'generating-new-file';
    message.maxPg = 100;
    message.pg = 0;

    postMessage(message);

    zip.generateAsync({ type: 'blob' }, (metadata) => {
      message.pg = metadata.percent;
      postMessage(message);
    }).then(zipBlob => {
      message.zipBlob = zipBlob as any;
      postMessage(message);
    });
  });

});
