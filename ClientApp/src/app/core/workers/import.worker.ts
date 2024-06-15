/// <reference lib="webworker" />

import { IndexDBErrors, IndexDBSucess, ObjectStoreNames } from "../interfaces/i-indexed-db";
import { ILanguage } from "../interfaces/i-dialog-group";
import { AppModes } from "../enums/app-modes";
import { IDialogAsset, LanguageType } from "../interfaces/i-dialog-asset";
import { ImportPostMessage, WorkerImportPostMessage } from "../interfaces/i-worker";
import { ApiErrors, ApiSucess as ApiSuccess } from "../interfaces/i-api";

addEventListener('message', async ({ data }) => {
  let message: ImportPostMessage = data;

  if (message.appMode === AppModes.Offline) {
    let request = indexedDB.open(message.dbName, message.dbVersion);
    request.onerror = (event) => onErrorOpenDB(event);
    request.onsuccess = (event) => onSuccessOpenDB(event, message);
  }
  else if (message.appMode === AppModes.Online) {
    onUploadDataServer(message);
  }
});

//#region Offline
function onErrorOpenDB(event: Event) {
  postMessage("CANT OPEN DB ON WEB WORKER");
}

function onSuccessOpenDB(event: Event, message: ImportPostMessage) {
  let db = (event.target as any).result;

  if (!message.obbSkip) onUploadObbOffline(db, message);
  if (!message.localizationSkip) onUploadLocalizationOffline(db, message);
  if (!message.gamedataSkip) onUploadGamedataOffline(db, message);

  db.onerror = (event: Event) => onError(event);
}

function onError(event: Event) {
  // console.log(`Database error: ${(event.target as IDBRequest).error?.message}`);
}

function onUploadObbOffline(db: IDBDatabase, message: ImportPostMessage) {
  const transaction = db.transaction([ObjectStoreNames.DialogAsset, ObjectStoreNames.Languages, ObjectStoreNames.MainGroup, ObjectStoreNames.Group], "readwrite");

  transaction.oncomplete = (event) => {
    let completeMessage: WorkerImportPostMessage<undefined> = {
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

  onUploadDialogAssetsOffline(db, message, transaction);
  onUploadGroupsOffline(db, message, transaction);
}

function onUploadDialogAssetsOffline(db: IDBDatabase, message: ImportPostMessage, transaction: IDBTransaction) {
  let dialogAssetsLang: IDialogAsset[] = [];
  for (let lang of message.dialogAssetsUploading) {
    dialogAssetsLang = [...dialogAssetsLang, ...message.dialogAssets[lang]];
  }

  const objectStore = transaction.objectStore(ObjectStoreNames.DialogAsset);

  dialogAssetsLang.forEach((d) => {
    const request = objectStore.add(d);
    request.onsuccess = (event) => {
      // SEND SUCCESS MESSAGE
    };

    request.onerror = (event) => {
      let req = event.target as IDBRequest;
      let error: WorkerImportPostMessage<typeof d> = {
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

function onUploadGroupsOffline(db: IDBDatabase, message: ImportPostMessage, transaction: IDBTransaction) {
  let parse = parseLanguagesAndMainGroups(message);

  const oSLang = transaction.objectStore(ObjectStoreNames.Languages);
  const oSMainGroup = transaction.objectStore(ObjectStoreNames.MainGroup);
  const oSGroup = transaction.objectStore(ObjectStoreNames.Group);

  parse.languages.forEach((l) => {
    const request = oSLang.add(l);
    request.onsuccess = (event) => {
      // SEND SUCCESS MESSAGE
    };

    request.onerror = (event) => {
      let req = event.target as IDBRequest;
      let error: WorkerImportPostMessage<typeof l> = {
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

  parse.mainGroups.forEach((mG) => {
    const request = oSMainGroup.add(mG);
    request.onsuccess = (event) => {
      // SEND SUCCESS MESSAGE
    };

    request.onerror = (event) => {
      let req = event.target as IDBRequest;
      let error: WorkerImportPostMessage<typeof mG> = {
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

  parse.groups.forEach((g) => {
    const request = oSGroup.add(g);
    request.onsuccess = (event) => {
      // SEND SUCCESS MESSAGE
    };

    request.onerror = (event) => {
      let req = event.target as IDBRequest;
      let error: WorkerImportPostMessage<typeof g> = {
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

function onUploadLocalizationOffline(db: IDBDatabase, message: ImportPostMessage) {
  const transaction = db.transaction([ObjectStoreNames.LocalizationCategory, ObjectStoreNames.LocalizationKey], "readwrite");

  transaction.oncomplete = (event) => {
    let completeMessage: WorkerImportPostMessage<undefined> = {
      file: 'localization',
      translateKey: IndexDBSucess.FileCompleted,
      message: undefined,
      data: undefined
    };
    postMessage(completeMessage);
  };
  transaction.onerror = (event) => {
    //Do nothing
  };

  const oSLC = transaction.objectStore(ObjectStoreNames.LocalizationCategory);
  const oSLK = transaction.objectStore(ObjectStoreNames.LocalizationKey);

  message.localizationCategories.forEach((c) => {
    const request = oSLC.add(c);
    request.onsuccess = (event) => {
      // SEND SUCCESS MESSAGE
    };

    request.onerror = (event) => {
      let req = event.target as IDBRequest;
      let error: WorkerImportPostMessage<typeof c> = {
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
      let resMessage: WorkerImportPostMessage<typeof k> = {
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

function onUploadGamedataOffline(db: IDBDatabase, message: ImportPostMessage) {
  const transaction = db.transaction([ObjectStoreNames.GamedataCategory, ObjectStoreNames.GamedataValue], "readwrite");

  transaction.oncomplete = (event) => {
    let completeMessage: WorkerImportPostMessage<undefined> = {
      file: 'gamedata',
      translateKey: IndexDBSucess.FileCompleted,
      message: undefined,
      data: undefined
    };
    postMessage(completeMessage);
  };
  transaction.onerror = (event) => {
    //Do nothing
  };

  const oSGC = transaction.objectStore(ObjectStoreNames.GamedataCategory);
  const oSGV = transaction.objectStore(ObjectStoreNames.GamedataValue);

  message.gamedataCategories.forEach((gC) => {
    const request = oSGC.add(gC);
    request.onsuccess = (event) => {
      // SEND SUCCESS MESSAGE
    };

    request.onerror = (event) => {
      let req = event.target as IDBRequest;
      let error: WorkerImportPostMessage<typeof gC> = {
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
      let error: WorkerImportPostMessage<typeof gV> = {
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

//#endregion

//#region Online
function onUploadDataServer(message: ImportPostMessage) {
  if (!message.obbSkip) onUploadObbServer(message);
  if (!message.localizationSkip) onUploadLocalizationServer(message);
  if (!message.gamedataSkip) onUploadGamedataServer(message);
}

async function onUploadObbServer(message: ImportPostMessage) {
  for (let lang of message.dialogAssetsUploading) await onUploadDialogAssetsServer(message, lang);
  await onUploadGroupsServer(message);

  let completeMessage: WorkerImportPostMessage<any> = {
    file: 'obb',
    message: undefined,
    translateKey: ApiSuccess.DataUpdated,
    data: undefined
  };

  postMessage(completeMessage);
}

async function onUploadDialogAssetsServer(message: ImportPostMessage, lang: string) {
  let dialogAssets = message.dialogAssets[lang];

  while (dialogAssets.length > 0) {
    let dialogsSet = dialogAssets.splice(0, 100);

    let promise = fetch(message.apiUrl + "api/dialogassets", {
      method: 'POST',
      body: JSON.stringify(dialogsSet),
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });

    await promise.then(
      async res => {
        let r: { FileSkip: number } = await res.json();

        let completeMessage: WorkerImportPostMessage<any> = {
          file: 'obb-main',
          message: lang,
          translateKey: r.FileSkip > 0 ? ApiSuccess.SkipFiles : ApiSuccess.DialogUpdated,
          data: r.FileSkip
        }

        postMessage(completeMessage);
      },
      error => {
        console.log("ERRROR -> ", error);
      }
    );
  }
}

async function onUploadGroupsServer(message: ImportPostMessage) {
  let parse = parseLanguagesAndMainGroups(message);

  let promise = fetch(message.apiUrl + "api/languages", {
    method: 'POST',
    body: JSON.stringify(parse.languages),
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });

  await promise.then(_ => {
    let completeMessage: WorkerImportPostMessage<any> = {
      file: 'obb-lang',
      message: undefined,
      translateKey: ApiSuccess.LanguagesUpdated,
      data: undefined
    };

    postMessage(completeMessage);
  }, error => {
    let completeMessage: WorkerImportPostMessage<any> = {
      file: 'obb-lang',
      message: undefined,
      translateKey: ApiErrors.LanguagesError,
      data: undefined
    };

    postMessage(completeMessage);
  });

  promise = fetch(message.apiUrl + "api/maingroups", {
    method: 'POST',
    body: JSON.stringify(parse.mainGroups),
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });

  await promise.then(_ => {
    let completeMessage: WorkerImportPostMessage<any> = {
      file: 'obb-lang',
      message: undefined,
      translateKey: ApiSuccess.MainGroupsUpdated,
      data: undefined
    };

    postMessage(completeMessage);
  }, error => {
    let completeMessage: WorkerImportPostMessage<any> = {
      file: 'obb-lang',
      message: undefined,
      translateKey: ApiErrors.MainGroupsError,
      data: undefined
    };

    postMessage(completeMessage);
  });

  promise = fetch(message.apiUrl + "api/groups", {
    method: 'POST',
    body: JSON.stringify(parse.groups),
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });

  await promise.then(_ => {
    let completeMessage: WorkerImportPostMessage<any> = {
      file: 'obb-lang',
      message: undefined,
      translateKey: ApiSuccess.GroupsUpdated,
      data: undefined
    };

    postMessage(completeMessage);
  }, error => {
    let completeMessage: WorkerImportPostMessage<any> = {
      file: 'obb-lang',
      message: undefined,
      translateKey: ApiErrors.GroupsError,
      data: undefined
    };

    postMessage(completeMessage);
  });
}

async function onUploadLocalizationServer(message: ImportPostMessage) {
  let promise = fetch(message.apiUrl + "api/languages", {
    method: 'POST',
    body: JSON.stringify(message.localizationCategories),
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });

  await promise.then(_ => {
    let completeMessage: WorkerImportPostMessage<any> = {
      file: 'localization-categories',
      message: undefined,
      translateKey: ApiSuccess.CategoriesUpdated,
      data: undefined
    };

    postMessage(completeMessage);
  }, error => {
    let completeMessage: WorkerImportPostMessage<any> = {
      file: 'localization-categories',
      message: undefined,
      translateKey: ApiErrors.CategoriesError,
      data: undefined
    };

    postMessage(completeMessage);
  });

  while (message.localizationKeys.length > 0) {
    let keysSet = message.localizationKeys.splice(0, 1000);
    promise = fetch(message.apiUrl + "api/" + message.uploadKeysUrl, {
      method: 'POST',
      body: JSON.stringify(keysSet),
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });

    await promise.then(_ => {
      let completeMessage: WorkerImportPostMessage<any> = {
        file: 'localization-keys',
        message: undefined,
        translateKey: ApiSuccess.KeysUpdated,
        data: undefined
      };

      postMessage(completeMessage);
    }, error => {
      let completeMessage: WorkerImportPostMessage<any> = {
        file: 'localization-keys',
        message: undefined,
        translateKey: ApiErrors.KeysError,
        data: undefined
      };

      postMessage(completeMessage);
    });
  }

  let completeMessage: WorkerImportPostMessage<any> = {
    file: 'localization',
    message: undefined,
    translateKey: ApiSuccess.DataUpdated,
    data: undefined
  };

  postMessage(completeMessage);
}

async function onUploadGamedataServer(message: ImportPostMessage) {
  let promise = fetch(message.apiUrl + "api/gamedatacategories", {
    method: 'POST',
    body: JSON.stringify(message.gamedataCategories),
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });

  await promise.then(_ => {
    let completeMessage: WorkerImportPostMessage<any> = {
      file: 'gamedata-categories',
      message: undefined,
      translateKey: ApiSuccess.GDCategoriesSuccess,
      data: undefined
    };

    postMessage(completeMessage);
  }, error => {
    let completeMessage: WorkerImportPostMessage<any> = {
      file: 'gamedata-categories',
      message: undefined,
      translateKey: ApiErrors.GDCategoriesError,
      data: undefined
    };

    postMessage(completeMessage);
  });

  // let gDValuesSet = message.gamedataValues.splice(0, 100);
  promise = fetch(message.apiUrl + "api/gamedatavalues/import", {
    method: 'POST',
    body: JSON.stringify(message.gamedataValues),
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });

  await promise.then(_ => {
    let completeMessage: WorkerImportPostMessage<any> = {
      file: 'gamedata-values',
      message: undefined,
      translateKey: ApiSuccess.GDValuesSuccess,
      data: undefined
    };

    postMessage(completeMessage);
  }, error => {
    let completeMessage: WorkerImportPostMessage<any> = {
      file: 'gamedata-values',
      message: undefined,
      translateKey: ApiErrors.GDValuesError,
      data: undefined
    };

    postMessage(completeMessage);
  });

  let completeMessage: WorkerImportPostMessage<any> = {
    file: 'gamedata',
    message: undefined,
    translateKey: ApiSuccess.DataUpdated,
    data: undefined
  };

  postMessage(completeMessage);
}

//#endregion

function parseLanguagesAndMainGroups(message: ImportPostMessage) {
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

  return { languages, mainGroups, groups };
}