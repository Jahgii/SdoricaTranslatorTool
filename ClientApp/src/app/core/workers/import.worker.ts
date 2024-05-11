/// <reference lib="webworker" />

import { ImportPostMessage } from "../interfaces/i-import";
import { IndexDBErrors, IndexDBSucess, IndexedDBbCustomRequestErrorWorker, ObjectStoreNames } from "../interfaces/i-indexed-db";
import { ILanguage } from "../interfaces/i-dialog-group";
import { AppModes } from "../enums/app-modes";
import { LanguageType } from "../interfaces/i-dialog-asset";

addEventListener('message', async ({ data }) => {
  let message: ImportPostMessage = data;

  if (message.appMode === AppModes.Offline) {
    let request = indexedDB.open(message.dbName, message.dbVersion);
    request.onerror = (event) => onErrorOpenDB(event);
    request.onsuccess = (event) => onSuccessOpenDB(event, message);
  }
  else if (message.appMode === AppModes.Online) {
    await onUploadDialogAssetsServer();
  }
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

  if (!message.localizationSkip)
    onUploadLocalizationOffline(db, message);

  if (!message.gamedataSkip)
    onUploadGamedataOffline(db, message);

  db.onerror = (event: Event) => onError(event);
}

function onError(event: Event) {
  // console.log(`Database error: ${(event.target as IDBRequest).error?.message}`);
}

function onUploadDialogAssetSelectedLanguages(db: IDBDatabase, message: ImportPostMessage) {
  for (let lang of message.dialogAssetsUploading) {
    onUploadDialogAssetsOffline(db, message, lang);
  }
}

function onUploadDialogAssetsOffline(db: IDBDatabase, message: ImportPostMessage, language: string) {
  let dialogAssetsLang = message.dialogAssets[language];
  let storeName = ObjectStoreNames.DialogAsset;
  const transaction = db.transaction([storeName], "readwrite");

  transaction.oncomplete = (event) => {
    let completeMessage: IndexedDBbCustomRequestErrorWorker<undefined> = {
      file: 'obb',
      translateKey: IndexDBSucess.FileCompleted,
      message: undefined,
      data: undefined
    };
    postMessage(completeMessage);
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
        file: 'obb',
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
    let completeMessage: IndexedDBbCustomRequestErrorWorker<undefined> = {
      file: 'obb-lang',
      translateKey: IndexDBSucess.FileCompleted,
      message: undefined,
      data: undefined
    };
    postMessage(completeMessage);
  };
  transactionL.onerror = (event) => {
    //Do nothing
  };

  transactionMG.oncomplete = (event) => {
    let completeMessage: IndexedDBbCustomRequestErrorWorker<undefined> = {
      file: 'obb-main',
      translateKey: IndexDBSucess.FileCompleted,
      message: undefined,
      data: undefined
    };
    postMessage(completeMessage);
  };
  transactionMG.onerror = (event) => {
    //Do nothing
  };

  transactionG.oncomplete = (event) => {
    let completeMessage: IndexedDBbCustomRequestErrorWorker<undefined> = {
      file: 'obb-group',
      translateKey: IndexDBSucess.FileCompleted,
      message: undefined,
      data: undefined
    };
    postMessage(completeMessage);
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
        file: 'obb-lang',
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
        file: 'obb-main',
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
        file: 'obb-group',
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

function onUploadLocalizationOffline(db: IDBDatabase, message: ImportPostMessage) {
  const transactionLC = db.transaction([ObjectStoreNames.LocalizationCategory], "readwrite");
  const transactionLK = db.transaction([ObjectStoreNames.LocalizationKey], "readwrite");

  transactionLC.oncomplete = (event) => {
    let completeMessage: IndexedDBbCustomRequestErrorWorker<undefined> = {
      file: 'localization-categories',
      translateKey: IndexDBSucess.FileCompleted,
      message: undefined,
      data: undefined
    };
    postMessage(completeMessage);
  };
  transactionLC.onerror = (event) => {
    //Do nothing
  };

  transactionLK.oncomplete = (event) => {
    let completeMessage: IndexedDBbCustomRequestErrorWorker<undefined> = {
      file: 'localization-keys',
      translateKey: IndexDBSucess.FileCompleted,
      message: undefined,
      data: undefined
    };
    postMessage(completeMessage);
  };
  transactionLK.onerror = (event) => {
    //Do nothing
  };

  const oSLC = transactionLC.objectStore(ObjectStoreNames.LocalizationCategory);
  const oSLK = transactionLK.objectStore(ObjectStoreNames.LocalizationKey);

  message.localizationCategories.forEach((c) => {
    const request = oSLC.add(c);
    request.onsuccess = (event) => {
      // SEND SUCCESS MESSAGE
    };

    request.onerror = (event) => {
      let req = event.target as IDBRequest;
      let error: IndexedDBbCustomRequestErrorWorker<typeof c> = {
        file: 'localization-categories',
        translateKey: IndexDBErrors.UnknownError,
        message: req.error?.message,
        data: c
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

  message.localizationKeys.forEach((k) => {
    const request = oSLK.add(k);
    request.onsuccess = (event) => {
      // SEND SUCCESS MESSAGE
    };

    request.onerror = (event) => {
      let req = event.target as IDBRequest;
      let resMessage: IndexedDBbCustomRequestErrorWorker<typeof k> = {
        file: 'localization-keys',
        translateKey: IndexDBErrors.UnknownError,
        message: req.error?.message,
        data: k
      };

      if (req.error?.name === 'ConstraintError') {
        resMessage.translateKey = IndexDBErrors[req.error?.name];

        let getRequest = oSLK
          .index("Name")
          .get([k.Category, k.Name]);

        getRequest
          .onsuccess = (event) => {
            let keyOnDB = (event.target as IDBRequest).result;
            if (k.Original[LanguageType.english] != keyOnDB.Original[LanguageType.english]) {
              keyOnDB.Original = k.Original;
              keyOnDB.Translated = k.Translated;

              let putRequest = oSLK.put(keyOnDB);

              putRequest
                .onsuccess = (event) => {
                  resMessage.translateKey = IndexDBSucess.KeyUpdated;
                  postMessage(resMessage);
                };
            }
          };

        event.preventDefault();
      }
      else if (req.error?.name === 'AbortError') {
        resMessage.translateKey = IndexDBErrors[req.error?.name];
        postMessage(resMessage);
      }
      else if (req.error?.name === 'QuotaExceededError') {
        resMessage.translateKey = IndexDBErrors[req.error?.name];
        postMessage(resMessage);
      }
      else if (req.error?.name === 'UnknownError') {
        resMessage.translateKey = IndexDBErrors[req.error?.name];
        postMessage(resMessage);
      }
      else if (req.error?.name === 'VersionError') {
        resMessage.translateKey = IndexDBErrors[req.error?.name];
        postMessage(resMessage);
      }
    };
  });
}

async function onUploadLocatlizationServer() {
  // await firstValueFrom(this.api.post('localizationcategories', this.localizationCategories))
  //   .then(
  //     (result) => {

  //     },
  //     (error) => {

  //     }
  //   );

  // if (typeof Worker !== 'undefined') {
  //   let spliceCount = Math.ceil(this.localizationKeys.length / this.maxThreads);
  //   let workers: Worker[] = [];
  //   for (let threadIndex = 0; threadIndex < this.maxThreads; threadIndex++) {
  //     workers.push(new Worker(new URL('../keys.worker', import.meta.url)));
  //     workers[threadIndex].onmessage = ({ data }) => {
  //       if (data.finish)
  //         workers[data.i].terminate();
  //     };

  //     let keys = this.localizationKeys.splice(0, spliceCount);
  //     let uploadStackSize = this.uploadStackSize;
  //     let url = this.uploadKeysUrl;
  //     workers[threadIndex].postMessage({ keys, uploadStackSize, url, threadIndex, token: this.lStorage.getToken() });
  //   }
  // }
  // else
  //   while (this.localizationKeys.length > 0) {
  //     let keysSet = this.localizationKeys.splice(0, this.uploadStackSize);
  //     await firstValueFrom(this.api.post<string[]>(this.uploadKeysUrl, keysSet))
  //       .then(
  //         (result) => {
  //           // this.fileProgressBar$.next(this.fileProgressBar$.value + this.uploadStackSize);
  //           // if (this.fileProgressBar$.value >= this.fileProgressBarMax$.value) this.fileProgressState$.next('finish');
  //         },
  //         (error) => {
  //         }
  //       );
  //   }
}

function onUploadGamedataOffline(db: IDBDatabase, message: ImportPostMessage) {
  const transactionGC = db.transaction([ObjectStoreNames.GamedataCategory], "readwrite");
  const transactionGV = db.transaction([ObjectStoreNames.GamedataValue], "readwrite");

  transactionGC.oncomplete = (event) => {
    let completeMessage: IndexedDBbCustomRequestErrorWorker<undefined> = {
      file: 'gamedata-categories',
      translateKey: IndexDBSucess.FileCompleted,
      message: undefined,
      data: undefined
    };
    postMessage(completeMessage);
  };
  transactionGC.onerror = (event) => {
    //Do nothing
  };

  transactionGV.oncomplete = (event) => {
    let completeMessage: IndexedDBbCustomRequestErrorWorker<undefined> = {
      file: 'gamedata-values',
      translateKey: IndexDBSucess.FileCompleted,
      message: undefined,
      data: undefined
    };
    postMessage(completeMessage);
  };
  transactionGV.onerror = (event) => {
    //Do nothing
  };

  const oSGC = transactionGC.objectStore(ObjectStoreNames.GamedataCategory);
  const oSGV = transactionGV.objectStore(ObjectStoreNames.GamedataValue);

  message.gamedataCategories.forEach((gC) => {
    const request = oSGC.add(gC);
    request.onsuccess = (event) => {
      // SEND SUCCESS MESSAGE
    };

    request.onerror = (event) => {
      let req = event.target as IDBRequest;
      let error: IndexedDBbCustomRequestErrorWorker<typeof gC> = {
        file: 'gamedata-categories',
        translateKey: IndexDBErrors.UnknownError,
        message: req.error?.message,
        data: gC
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

  message.gamedataValues.forEach((gV) => {
    const request = oSGV.add(gV);
    request.onsuccess = (event) => {
      // SEND SUCCESS MESSAGE
    };

    request.onerror = (event) => {
      let req = event.target as IDBRequest;
      let error: IndexedDBbCustomRequestErrorWorker<typeof gV> = {
        file: 'gamedata-values',
        translateKey: IndexDBErrors.UnknownError,
        message: req.error?.message,
        data: gV
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

async function onUploadGamedataServer() {
  // await firstValueFrom(this.api.post('gamedatacategories', this.gamedataCategories))
  //   .then(
  //     (result) => {

  //     },
  //     (error) => {

  //     }
  //   );

  // while (this.gamedataValues.length > 0) {
  //   let keysSet = this.gamedataValues.splice(0, this.uploadStackSize);
  //   await firstValueFrom(this.api.post<string[]>('gamedatavalues/import', keysSet))
  //     .then(
  //       (result) => {
  //         // this.fileProgressBar$.next(this.fileProgressBar$.value + this.uploadStackSize);
  //         // if (this.fileProgressBar$.value >= this.fileProgressBarMax$.value) this.fileProgressState$.next('finish');
  //       },
  //       (error) => {
  //       }
  //     );
  // }
}