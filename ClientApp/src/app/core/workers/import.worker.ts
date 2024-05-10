/// <reference lib="webworker" />

import { ImportPostMessage } from "../interfaces/i-import";
import { IndexDBErrors, IndexedDBbCustomRequestErrorWorker, ObjectStoreNames } from "../interfaces/i-indexed-db";
import { ILanguage } from "../interfaces/i-dialog-group";
import { AppModes } from "../enums/app-modes";

addEventListener('message', async ({ data }) => {
  let message: ImportPostMessage = data;
  const response = `worker response to ${data}`;

  if (message.appMode === AppModes.Offline) {
    let request = indexedDB.open(message.dbName, message.dbVersion);
    request.onerror = (event) => onErrorOpenDB(event);
    request.onsuccess = (event) => onSuccessOpenDB(event, message);
  }
  else if (message.appMode === AppModes.Online) {
    await onUploadDialogAssetsServer();
  }

  postMessage(response);
});

function onErrorOpenDB(event: Event) {
  postMessage("CANT OPEN DB ON WEB WORKER");
}

function onSuccessOpenDB(event: Event, message: ImportPostMessage) {
  let db = (event.target as any).result;

  if (!message.obbSkip) {
    onUploadDialogAssetSelectedLanguages(db, message);
    onUploadGroupsOffline(db, message);
  };


  db.onerror = (event: Event) => onError(event);
}

function onError(event: Event) {
  console.log(`Database error: ${(event.target as IDBRequest).error?.message}`);
}

function onUploadDialogAssetSelectedLanguages(db: IDBDatabase, message: ImportPostMessage) {
  for (let lang of message.dialogAssetsUploading) {
    onUploadDialogAssetsOffline(db, message, lang);
  }
}

function onUploadDialogAssetsOffline(db: IDBDatabase, message: ImportPostMessage, language: string) {
  // this.dialogAssetsUploading[language].Uploading.next(true);

  let dialogAssetsLang = message.dialogAssets[language];
  let storeName = ObjectStoreNames.DialogAsset;
  const transaction = db.transaction([storeName], "readwrite");

  transaction.oncomplete = (event) => {
    //Do nothing
  };

  transaction.onerror = (event) => {
    //Do nothing
  };

  const objectStore = transaction.objectStore(storeName);

  dialogAssetsLang.forEach((d) => {
    const request = objectStore.add(d);
    request.onsuccess = (event) => {
      // SEND SUCCESS MESSAGE
    };

    request.onerror = (event) => {
      let req = event.target as IDBRequest;
      let error: IndexedDBbCustomRequestErrorWorker<typeof d> = {
        translateKey: IndexDBErrors.UnknownError,
        message: req.error?.message,
        data: d
      };

      if (req.error?.name === 'ConstraintError') {
        error.translateKey = IndexDBErrors[req.error?.name];
        event.preventDefault();
      }
      else if (req.error?.name === 'AbortError') {
        error.translateKey = IndexDBErrors[req.error?.name];
      }
      else if (req.error?.name === 'QuotaExceededError') {
        error.translateKey = IndexDBErrors[req.error?.name];
      }
      else if (req.error?.name === 'UnknownError') {
        error.translateKey = IndexDBErrors[req.error?.name];
      }
      else if (req.error?.name === 'VersionError') {
        error.translateKey = IndexDBErrors[req.error?.name];
      }

      postMessage(error);
    };
  });


  // this.dialogAssetsUploading[language].Uploading.next(false);
}

async function onUploadDialogAssetsServer() {
  // this.api.post<{ FileSkip: number }>('dialogassets', dialogsSet))
  //   .then(
  //   (result) => {
  //     this.dialogAssetsUploading[language].FileSkip
  //       .next(this.dialogAssetsUploading[language].FileSkip.value + result.FileSkip);
  //   },
  //   (error) => {

  //   }
  // );
}

function onUploadGroupsOffline(db: IDBDatabase, message: ImportPostMessage) {
  let languages = [];
  let mainGroups = [];
  let groups = [];

  for (let language in message.dialogAssetsInclude) {
    if (message.dialogAssetsInclude[language] === true) {
      //Populate Main Groups
      for (let key in message.dialogAssetsMainGroups[language]) {
        mainGroups.push(message.dialogAssetsMainGroups[language][key]);
      }

      //Populate Groups
      for (let keyMainGroup in message.dialogAssetsGroups[language]) {
        for (let keyGroup in message.dialogAssetsGroups[language][keyMainGroup]) {
          groups.push(message.dialogAssetsGroups[language][keyMainGroup][keyGroup]);
        }
      }

      //Populate Languages
      let languageO: ILanguage = { Name: language };
      languages.push(languageO);
    }
  }

  const transactionL = db.transaction([ObjectStoreNames.Languages], "readwrite");
  const transactionMG = db.transaction([ObjectStoreNames.MainGroup], "readwrite");
  const transactionG = db.transaction([ObjectStoreNames.Group], "readwrite");

  transactionL.oncomplete = (event) => {
    //Do nothing
  };
  transactionL.onerror = (event) => {
    //Do nothing
  };

  transactionMG.oncomplete = (event) => {
    //Do nothing
  };
  transactionMG.onerror = (event) => {
    //Do nothing
  };

  transactionG.oncomplete = (event) => {
    //Do nothing
  };
  transactionG.onerror = (event) => {
    //Do nothing
  };

  const oSLang = transactionL.objectStore(ObjectStoreNames.Languages);
  const oSMainGroup = transactionMG.objectStore(ObjectStoreNames.MainGroup);
  const oSGroup = transactionG.objectStore(ObjectStoreNames.Group);

  languages.forEach((l) => {
    const request = oSLang.add(l);
    request.onsuccess = (event) => {
      // SEND SUCCESS MESSAGE
    };

    request.onerror = (event) => {
      let req = event.target as IDBRequest;
      let error: IndexedDBbCustomRequestErrorWorker<typeof l> = {
        translateKey: IndexDBErrors.UnknownError,
        message: req.error?.message,
        data: l
      };

      if (req.error?.name === 'ConstraintError') {
        error.translateKey = IndexDBErrors[req.error?.name];
        event.preventDefault();
      }
      else if (req.error?.name === 'AbortError') {
        error.translateKey = IndexDBErrors[req.error?.name];
      }
      else if (req.error?.name === 'QuotaExceededError') {
        error.translateKey = IndexDBErrors[req.error?.name];
      }
      else if (req.error?.name === 'UnknownError') {
        error.translateKey = IndexDBErrors[req.error?.name];
      }
      else if (req.error?.name === 'VersionError') {
        error.translateKey = IndexDBErrors[req.error?.name];
      }

      postMessage(error);
    };
  });

  mainGroups.forEach((mG) => {
    const request = oSMainGroup.add(mG);
    request.onsuccess = (event) => {
      // SEND SUCCESS MESSAGE
    };

    request.onerror = (event) => {
      let req = event.target as IDBRequest;
      let error: IndexedDBbCustomRequestErrorWorker<typeof mG> = {
        translateKey: IndexDBErrors.UnknownError,
        message: req.error?.message,
        data: mG
      };

      if (req.error?.name === 'ConstraintError') {
        error.translateKey = IndexDBErrors[req.error?.name];
        event.preventDefault();
      }
      else if (req.error?.name === 'AbortError') {
        error.translateKey = IndexDBErrors[req.error?.name];
      }
      else if (req.error?.name === 'QuotaExceededError') {
        error.translateKey = IndexDBErrors[req.error?.name];
      }
      else if (req.error?.name === 'UnknownError') {
        error.translateKey = IndexDBErrors[req.error?.name];
      }
      else if (req.error?.name === 'VersionError') {
        error.translateKey = IndexDBErrors[req.error?.name];
      }

      postMessage(error);
    };
  });

  groups.forEach((g) => {
    const request = oSGroup.add(g);
    request.onsuccess = (event) => {
      // SEND SUCCESS MESSAGE
    };

    request.onerror = (event) => {
      let req = event.target as IDBRequest;
      let error: IndexedDBbCustomRequestErrorWorker<typeof g> = {
        translateKey: IndexDBErrors.UnknownError,
        message: req.error?.message,
        data: g
      };

      if (req.error?.name === 'ConstraintError') {
        error.translateKey = IndexDBErrors[req.error?.name];
        event.preventDefault();
      }
      else if (req.error?.name === 'AbortError') {
        error.translateKey = IndexDBErrors[req.error?.name];
      }
      else if (req.error?.name === 'QuotaExceededError') {
        error.translateKey = IndexDBErrors[req.error?.name];
      }
      else if (req.error?.name === 'UnknownError') {
        error.translateKey = IndexDBErrors[req.error?.name];
      }
      else if (req.error?.name === 'VersionError') {
        error.translateKey = IndexDBErrors[req.error?.name];
      }

      postMessage(error);
    };
  });

}

async function onUploadGroupsServer() {
  // await firstValueFrom(this.api.post('languages', languages))
  //   .then(
  //     (result) => {
  //     },
  //     (error) => {
  //     }
  //   );

  // await firstValueFrom(this.api.post('maingroups', mainGroups))
  //   .then(
  //     (result) => {
  //     },
  //     (error) => {
  //     }
  //   );

  // await firstValueFrom(this.api.post('groups', groups))
  //   .then(
  //     (result) => {
  //     },
  //     (error) => {
  //     }
  //   );
}