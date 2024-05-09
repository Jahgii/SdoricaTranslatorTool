import { Injectable } from '@angular/core';
import { error } from 'console';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IndexDBService {
  private dbName = "Translations";
  private dbVersion = 1;
  private db!: IDBDatabase;

  constructor() {
    this.openDB();
  }

  private openDB() {
    let request = indexedDB
      .open(this.dbName, this.dbVersion);

    request.onerror = (event) => this.onErrorOpenDB(event);
    request.onsuccess = (event) => this.onSuccessOpenDB(event);
    request.onupgradeneeded = (event) => this.onUpgradeNeededOpenDB(event);
  }

  private onErrorOpenDB(event: Event) {
  }

  private onSuccessOpenDB(event: Event) {
    this.db = (event.target as any).result;
    this.db.onerror = (event) => this.onError(event);
  }

  private onUpgradeNeededOpenDB(event: Event) {
    this.db = (event.target as any).result;

    this.db.createObjectStore(ObjectStoreNames.CommonWord, { keyPath: "Id", autoIncrement: true });

    const storeDA: IDBObjectStore = this.db
      .createObjectStore(ObjectStoreNames.DialogAsset, { keyPath: "Id", autoIncrement: true });

    storeDA.createIndex("Filename", "Filename", { unique: true })

    const storeGC = this.db
      .createObjectStore(ObjectStoreNames.GamedataCategory, { keyPath: "Id", autoIncrement: true });

    storeGC.createIndex("Name", "Name", { unique: true });

    const storeGV = this.db
      .createObjectStore(ObjectStoreNames.GamedataValue, { keyPath: "Id", autoIncrement: true });

    storeGV.createIndex("Name", ["Category", "Name"], { unique: true });

    const storeG = this.db
      .createObjectStore(ObjectStoreNames.Group, { keyPath: "Id", autoIncrement: true });

    storeG.createIndex("Name", ["Language", "MainGroup", "OriginalName"], { unique: true });

    const storeL = this.db
      .createObjectStore(ObjectStoreNames.Languages, { keyPath: "Id", autoIncrement: true });

    storeL.createIndex("Name", "Name", { unique: true });

    const storeLC = this.db
      .createObjectStore(ObjectStoreNames.LocalizationCategory, { keyPath: "Id", autoIncrement: true });

    storeLC.createIndex("Name", "Name", { unique: true });

    const storeLK: IDBObjectStore = this.db
      .createObjectStore(ObjectStoreNames.LocalizationKey, { keyPath: "Id", autoIncrement: true });

    storeLK.createIndex("Name", ["Category", "Name"], { unique: true });

    const storeMG = this.db
      .createObjectStore(ObjectStoreNames.MainGroup, { keyPath: "Id", autoIncrement: true });

    storeMG.createIndex("Name", ["Language", "OriginalName"], { unique: true });
  }

  private onError(event: Event) {
    console.log(`Database error: ${(event.target as IDBRequest).error?.message}`);
  }

  public post<T>(storeName: ObjectStoreNames, data: T) {
    let obsSuccess$ = new Subject<any>();
    let obsError$ = new Subject<IndexedDBbCustomRequestError<T>>();
    let dataLength = 1;
    let operationCompleted = 0;

    const transaction = this.db.transaction([storeName], "readwrite");

    transaction.oncomplete = (event) => {
      obsSuccess$.complete();
      obsError$.complete();
    };

    transaction.onerror = (event) => {
      if (dataLength === operationCompleted) {
        obsSuccess$.complete();
        obsError$.complete();
      }
    };

    const objectStore = transaction.objectStore(storeName);

    const request = objectStore.add(data);
    request.onsuccess = (event) => {
      operationCompleted += 1;
      obsSuccess$.next(data);
    };

    request.onerror = (event) => {
      operationCompleted += 1;
      let error: IndexedDBbCustomRequestError<T> = {
        request: event.target as IDBRequest,
        translateKey: IndexDBErrors.UnknownError,
        data: data
      };

      if (error.request.error?.name === 'ConstraintError') {
        error.translateKey = IndexDBErrors[error.request.error?.name];
        event.preventDefault();
      }
      else if (error.request.error?.name === 'AbortError') {
        error.translateKey = IndexDBErrors[error.request.error?.name];
      }
      else if (error.request.error?.name === 'QuotaExceededError') {
        error.translateKey = IndexDBErrors[error.request.error?.name];
      }
      else if (error.request.error?.name === 'UnknownError') {
        error.translateKey = IndexDBErrors[error.request.error?.name];
      }
      else if (error.request.error?.name === 'VersionError') {
        error.translateKey = IndexDBErrors[error.request.error?.name];
      }

      obsError$.next(error);
    };

    return { obsSuccess$, obsError$ };
  }

  public postMany<T>(storeName: ObjectStoreNames, data: T[]) {
    let obsSuccess$ = new Subject<any>();
    let obsError$ = new Subject<IndexedDBbCustomRequestError<T>>();
    let dataLength = 1;
    let operationCompleted = 0;

    const transaction = this.db.transaction([storeName], "readwrite");

    transaction.oncomplete = (event) => {
      obsSuccess$.complete();
      obsError$.complete();
    };

    transaction.onerror = (event) => {
      if (dataLength === operationCompleted) {
        obsSuccess$.complete();
        obsError$.complete();
      }
    };

    const objectStore = transaction.objectStore(storeName);

    dataLength = data.length;
    data.forEach((d) => {
      const request = objectStore.add(d);
      request.onsuccess = (event) => {
        operationCompleted += 1;
        obsSuccess$.next(d);
      };

      request.onerror = (event) => {
        operationCompleted += 1;
        let error: IndexedDBbCustomRequestError<T> = {
          request: event.target as IDBRequest,
          translateKey: IndexDBErrors.UnknownError,
          data: d
        };

        if (error.request.error?.name === 'ConstraintError') {
          error.translateKey = IndexDBErrors[error.request.error?.name];
          event.preventDefault();
        }
        else if (error.request.error?.name === 'AbortError') {
          error.translateKey = IndexDBErrors[error.request.error?.name];
        }
        else if (error.request.error?.name === 'QuotaExceededError') {
          error.translateKey = IndexDBErrors[error.request.error?.name];
        }
        else if (error.request.error?.name === 'UnknownError') {
          error.translateKey = IndexDBErrors[error.request.error?.name];
        }
        else if (error.request.error?.name === 'VersionError') {
          error.translateKey = IndexDBErrors[error.request.error?.name];
        }

        obsError$.next(error);
      };
    });

    return { obsSuccess$, obsError$ };
  }
}

export interface IndexedDBbCustomRequestError<T> {
  request: IDBRequest;
  translateKey: IndexDBErrors;
  data: T;
}

enum IndexDBErrors {
  ConstraintError = "constraint-error",
  AbortError = "abort-error",
  QuotaExceededError = "quota-exceeded-error",
  UnknownError = "unknown-error",
  VersionError = "version-error"
}

export enum ObjectStoreNames {
  CommonWord = "CommonWord",
  DialogAsset = "DialogAsset",
  GamedataCategory = "GamedataCategory",
  GamedataValue = "GamedataValue",
  Group = "Group",
  Languages = "Languages",
  LocalizationCategory = "LocalizationCategory",
  LocalizationKey = "LocalizationKey",
  MainGroup = "MainGroup",
  User = "User"
}