import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ObjectStoreNames, IndexedDBbCustomRequestError, IndexDBErrors, Indexes } from '../interfaces/i-indexed-db';

@Injectable({
  providedIn: 'root'
})
export class IndexDBService {
  public dbLoaded$ = new BehaviorSubject<boolean>(false);
  public dbName = "Translations";
  public dbVersion = 1;
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
    this.dbLoaded$.next(true);
  }

  private onUpgradeNeededOpenDB(event: Event) {
    this.db = (event.target as any).result;

    const storeC: IDBObjectStore = this.db.objectStoreNames.contains(ObjectStoreNames.CommonWord) ?
      (event.target as any).transaction.objectStore(ObjectStoreNames.CommonWord) :
      this.db.createObjectStore(ObjectStoreNames.CommonWord, { keyPath: "Id", autoIncrement: true });

    if (!storeC.indexNames.contains(Indexes.CommonWord.Original))
      storeC.createIndex(Indexes.CommonWord.Original, "Original", { unique: true });

    const storeDA: IDBObjectStore = this.db.objectStoreNames.contains(ObjectStoreNames.DialogAsset) ?
      (event.target as any).transaction.objectStore(ObjectStoreNames.DialogAsset) :
      this.db.createObjectStore(ObjectStoreNames.DialogAsset, { keyPath: "Id", autoIncrement: true });

    if (!storeDA.indexNames.contains(Indexes.DialogAsset.Filename))
      storeDA.createIndex(Indexes.DialogAsset.Filename, "Filename", { unique: true });
    if (!storeDA.indexNames.contains(Indexes.DialogAsset.Group))
      storeDA.createIndex(Indexes.DialogAsset.Group, ["Language", "MainGroup", "Group"], { unique: false });
    if (!storeDA.indexNames.contains(Indexes.DialogAsset.Content))
      storeDA.createIndex(Indexes.DialogAsset.Content, ["MainGroup", "Group", "Number"], { unique: false });
    if (!storeDA.indexNames.contains(Indexes.DialogAsset.Dialog))
      storeDA.createIndex(Indexes.DialogAsset.Dialog, ["Language", "MainGroup", "Group", "Number"], { unique: false });
    if (!storeDA.indexNames.contains(Indexes.DialogAsset.Language))
      storeDA.createIndex(Indexes.DialogAsset.Language, "Language", { unique: false });
    if (!storeDA.indexNames.contains(Indexes.DialogAsset.Translated))
      storeDA.createIndex(Indexes.DialogAsset.Translated, ["Language", "Translated"], { unique: false });

    const storeGC = this.db.objectStoreNames.contains(ObjectStoreNames.GamedataCategory) ?
      (event.target as any).transaction.objectStore(ObjectStoreNames.GamedataCategory) :
      this.db.createObjectStore(ObjectStoreNames.GamedataCategory, { keyPath: "Id", autoIncrement: true });

    if (!storeGC.indexNames.contains(Indexes.GamedataCategory.Name))
      storeGC.createIndex(Indexes.GamedataCategory.Name, "Name", { unique: true });

    const storeGV = this.db.objectStoreNames.contains(ObjectStoreNames.GamedataValue) ?
      (event.target as any).transaction.objectStore(ObjectStoreNames.GamedataValue) :
      this.db.createObjectStore(ObjectStoreNames.GamedataValue, { keyPath: "Id", autoIncrement: true });

    if (!storeGV.indexNames.contains(Indexes.GamedataValue.Name))
      storeGV.createIndex(Indexes.GamedataValue.Name, ["Category", "Name"], { unique: true });

    const storeG = this.db.objectStoreNames.contains(ObjectStoreNames.Group) ?
      (event.target as any).transaction.objectStore(ObjectStoreNames.Group) :
      this.db.createObjectStore(ObjectStoreNames.Group, { keyPath: "Id", autoIncrement: true });

    if (!storeG.indexNames.contains(Indexes.Group.Name))
      storeG.createIndex(Indexes.Group.Name, ["Language", "MainGroup", "OriginalName"], { unique: true });
    if (!storeG.indexNames.contains(Indexes.Group.MainGroup))
      storeG.createIndex(Indexes.Group.MainGroup, ["Language", "MainGroup"], { unique: false });

    const storeL = this.db.objectStoreNames.contains(ObjectStoreNames.Languages) ?
      (event.target as any).transaction.objectStore(ObjectStoreNames.Languages) :
      this.db.createObjectStore(ObjectStoreNames.Languages, { keyPath: "Id", autoIncrement: true });

    if (!storeL.indexNames.contains(Indexes.Languages.Name))
      storeL.createIndex(Indexes.Languages.Name, "Name", { unique: true });

    const storeLC = this.db.objectStoreNames.contains(ObjectStoreNames.LocalizationCategory) ?
      (event.target as any).transaction.objectStore(ObjectStoreNames.LocalizationCategory) :
      this.db.createObjectStore(ObjectStoreNames.LocalizationCategory, { keyPath: "Id", autoIncrement: true });

    if (!storeLC.indexNames.contains(Indexes.LocalizationCategory.Name))
      storeLC.createIndex(Indexes.LocalizationCategory.Name, "Name", { unique: true });

    const storeLK: IDBObjectStore = this.db.objectStoreNames.contains(ObjectStoreNames.LocalizationKey) ?
      (event.target as any).transaction.objectStore(ObjectStoreNames.LocalizationKey) :
      this.db.createObjectStore(ObjectStoreNames.LocalizationKey, { keyPath: "Id", autoIncrement: true });

    if (!storeLK.indexNames.contains(Indexes.LocalizationKey.Name))
      storeLK.createIndex(Indexes.LocalizationKey.Name, ["Category", "Name"], { unique: true });
    if (!storeLK.indexNames.contains(Indexes.LocalizationKey.Category))
      storeLK.createIndex(Indexes.LocalizationKey.Category, "Category", { unique: false });
    if (!storeLK.indexNames.contains(Indexes.LocalizationKey.Key))
      storeLK.createIndex(Indexes.LocalizationKey.Key, "Name", { unique: false });

    const storeMG = this.db.objectStoreNames.contains(ObjectStoreNames.MainGroup) ?
      (event.target as any).transaction.objectStore(ObjectStoreNames.MainGroup) :
      this.db.createObjectStore(ObjectStoreNames.MainGroup, { keyPath: "Id", autoIncrement: true });

    if (!storeMG.indexNames.contains(Indexes.MainGroup.Name))
      storeMG.createIndex(Indexes.MainGroup.Name, ["Language", "OriginalName"], { unique: true });
    if (!storeMG.indexNames.contains(Indexes.MainGroup.Language))
      storeMG.createIndex(Indexes.MainGroup.Language, "Language", { unique: false });

    const storeP = this.db.objectStoreNames.contains(ObjectStoreNames.UserDirectories) ?
      (event.target as any).transaction.objectStore(ObjectStoreNames.UserDirectories) :
      this.db.createObjectStore(ObjectStoreNames.UserDirectories, { keyPath: "Id", autoIncrement: true });

    if (!storeP.indexNames.contains(Indexes.UserDirectories.Name))
      storeP.createIndex(Indexes.UserDirectories.Name, "Name", { unique: true });
  }

  private onError(event: Event) {
    console.log(`Database error: ${(event.target as IDBRequest).error?.message}`);
  }

  public post<T>(storeName: ObjectStoreNames, data: T, propIdToSet?: keyof T) {
    let success$ = new Subject<T>();
    let error$ = new Subject<IndexedDBbCustomRequestError<T>>();
    let dataLength = 1;
    let operationCompleted = 0;

    const transaction = this.db.transaction([storeName], "readwrite");

    transaction.oncomplete = (event) => {
      success$.complete();
      error$.complete();
    };

    transaction.onerror = (event) => {
      if (dataLength === operationCompleted) {
        success$.complete();
        error$.complete();
      }
    };

    const objectStore = transaction.objectStore(storeName);

    const request = objectStore.add(data);
    request.onsuccess = (event) => {
      operationCompleted += 1;
      if (propIdToSet) {
        let id = (event.target as IDBRequest).result;
        data[propIdToSet] = id;
      }
      success$.next(data);
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

      error$.next(error);
    };

    return { success$, error$ };
  }

  public postMany<T>(storeName: ObjectStoreNames, data: T[], propIdToSet?: keyof T) {
    let success$ = new Subject<any>();
    let error$ = new Subject<IndexedDBbCustomRequestError<T>>();
    let dataLength = 1;
    let operationCompleted = 0;

    const transaction = this.db.transaction([storeName], "readwrite");

    transaction.oncomplete = (event) => {
      success$.complete();
      error$.complete();
    };

    transaction.onerror = (event) => {
      if (dataLength === operationCompleted) {
        success$.complete();
        error$.complete();
      }
    };

    const objectStore = transaction.objectStore(storeName);

    dataLength = data.length;
    for (const d of data) {
      const request = objectStore.add(d);
      request.onsuccess = (event) => {
        operationCompleted += 1;
        if (propIdToSet) {
          let id = (event.target as IDBRequest).result;
          d[propIdToSet] = id;
        }
        success$.next(d);
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

        error$.next(error);
      };
    }

    return { success$, error$ };
  }

  public getCursor<T>(storeName: ObjectStoreNames, filter: (d: T) => boolean) {
    let success$ = new Subject<T[]>();
    let error$ = new Subject<IndexedDBbCustomRequestError<T>>();

    const transaction = this.db.transaction([storeName]);

    transaction.oncomplete = (event) => {
      success$.complete();
      error$.complete();
    };

    transaction.onerror = (event) => {
      success$.complete();
      error$.complete();
    };

    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.openCursor();

    let result: any = [];

    request.onsuccess = (event) => {
      let cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
      if (cursor) {
        if (filter(cursor.value)) {
          result.push(cursor.value);
        }
        cursor.continue();
      }
      else {
        success$.next(result);
      }
    };

    request.onerror = (event) => {
      let error: IndexedDBbCustomRequestError<T> = {
        request: event.target as IDBRequest,
        translateKey: IndexDBErrors.UnknownError,
        data: [] as any
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

      error$.next(error);
    };

    return { success$: success$, error$: error$ };
  }

  public getCursorCount<T>(storeName: ObjectStoreNames, filter: (d: T) => boolean) {
    let success$ = new Subject<number>();
    let error$ = new Subject<IndexedDBbCustomRequestError<T>>();

    const transaction = this.db.transaction([storeName]);

    transaction.oncomplete = (event) => {
      success$.complete();
      error$.complete();
    };

    transaction.onerror = (event) => {
      success$.complete();
      error$.complete();
    };

    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.openCursor();

    let result: number = 0;

    request.onsuccess = (event) => {
      let cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
      if (cursor) {
        if (filter(cursor.value)) {
          result += 1;
        }
        cursor.continue();
      }
      else {
        success$.next(result);
      }
    };

    request.onerror = (event) => {
      let error: IndexedDBbCustomRequestError<T> = {
        request: event.target as IDBRequest,
        translateKey: IndexDBErrors.UnknownError,
        data: [] as any
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

      error$.next(error);
    };

    return { success$: success$, error$: error$ };
  }

  public getIndex<T>(storeName: ObjectStoreNames, index: string, searchValue: any, onlyOne: boolean = false) {
    let success$ = new Subject<T>();
    let error$ = new Subject<IndexedDBbCustomRequestError<T>>();

    const transaction = this.db.transaction([storeName]);

    transaction.oncomplete = (event) => {
      success$.complete();
      error$.complete();
    };

    transaction.onerror = (event) => {
      success$.complete();
      error$.complete();
    };

    const objectStore = transaction.objectStore(storeName);
    let request = objectStore.index(index).getAll(searchValue);

    if (onlyOne) request = objectStore.index(index).get(searchValue);


    request.onsuccess = (event) => {
      success$.next((event.target as IDBRequest).result);
    };

    request.onerror = (event) => {
      let error: IndexedDBbCustomRequestError<T> = {
        request: event.target as IDBRequest,
        translateKey: IndexDBErrors.UnknownError,
        data: [] as any
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

      error$.next(error);
    };

    return { success$: success$, error$: error$ };
  }

  public getIndexCursor<T>(storeName: ObjectStoreNames, index: string, filter: (d: T) => boolean) {
    let success$ = new Subject<T[]>();
    let error$ = new Subject<IndexedDBbCustomRequestError<T>>();

    const transaction = this.db.transaction([storeName]);

    transaction.oncomplete = (event) => {
      success$.complete();
      error$.complete();
    };

    transaction.onerror = (event) => {
      success$.complete();
      error$.complete();
    };

    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.index(index).openCursor();

    let result: any = [];

    request.onsuccess = (event) => {
      let cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
      if (cursor) {
        if (filter(cursor.value)) {
          result.push(cursor.value);
        }
        cursor.continue();
      }
      else {
        success$.next(result);
      }
    };

    request.onerror = (event) => {
      let error: IndexedDBbCustomRequestError<T> = {
        request: event.target as IDBRequest,
        translateKey: IndexDBErrors.UnknownError,
        data: [] as any
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

      error$.next(error);
    };

    return { success$: success$, error$: error$ };
  }

  public getAll<T>(storeName: ObjectStoreNames) {
    let success$ = new Subject<T>();
    let error$ = new Subject<IndexedDBbCustomRequestError<T>>();

    const transaction = this.db.transaction([storeName]);

    transaction.oncomplete = (event) => {
      success$.complete();
      error$.complete();
    };

    transaction.onerror = (event) => {
      success$.complete();
      error$.complete();
    };

    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.getAll();

    request.onsuccess = (event) => {
      success$.next((event.target as IDBRequest).result);
    };

    request.onerror = (event) => {
      let error: IndexedDBbCustomRequestError<T> = {
        request: event.target as IDBRequest,
        translateKey: IndexDBErrors.UnknownError,
        data: [] as any
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

      error$.next(error);
    };

    return { success$: success$, error$: error$ };
  }

  public getCount<T>(storeName: ObjectStoreNames) {
    let success$ = new Subject<T>();
    let error$ = new Subject<IndexedDBbCustomRequestError<T>>();

    const transaction = this.db.transaction([storeName]);

    transaction.oncomplete = (event) => {
      success$.complete();
      error$.complete();
    };

    transaction.onerror = (event) => {
      success$.complete();
      error$.complete();
    };

    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.count();

    request.onsuccess = (event) => {
      success$.next((event.target as IDBRequest).result);
    };

    request.onerror = (event) => {
      let error: IndexedDBbCustomRequestError<T> = {
        request: event.target as IDBRequest,
        translateKey: IndexDBErrors.UnknownError,
        data: [] as any
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

      error$.next(error);
    };

    return { success$: success$, error$: error$ };
  }

  public put<T>(storeName: ObjectStoreNames, data: T) {
    let success$ = new Subject<T>();
    let error$ = new Subject<IndexedDBbCustomRequestError<T>>();
    let dataLength = 1;
    let operationCompleted = 0;

    const transaction = this.db.transaction([storeName], "readwrite");

    transaction.oncomplete = (event) => {
      success$.complete();
      error$.complete();
    };

    transaction.onerror = (event) => {
      if (dataLength === operationCompleted) {
        success$.complete();
        error$.complete();
      }
    };

    const objectStore = transaction.objectStore(storeName);

    const request = objectStore.put(data);
    request.onsuccess = (event) => {
      operationCompleted += 1;
      success$.next(data);
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

      error$.next(error);
    };

    return { success$, error$ };
  }

  public putCustom<T>(storeName: ObjectStoreNames[]) {
    let success$ = new Subject<T>();
    let error$ = new Subject<IndexedDBbCustomRequestError<T>>();
    let dataLength = 1;
    let operationCompleted = 0;

    const transaction = this.db.transaction(storeName, "readwrite");

    transaction.oncomplete = (event) => {
      success$.complete();
      error$.complete();
    };

    transaction.onerror = (event) => {
      if (dataLength === operationCompleted) {
        success$.complete();
        error$.complete();
      }
    };

    return { success$, error$, transaction };
  }

  public delete<T>(storeName: ObjectStoreNames, data: T, id: keyof T) {
    let success$ = new Subject<T>();
    let error$ = new Subject<IndexedDBbCustomRequestError<T>>();
    let dataLength = 1;
    let operationCompleted = 0;

    const transaction = this.db.transaction([storeName], "readwrite");

    transaction.oncomplete = (event) => {
      success$.complete();
      error$.complete();
    };

    transaction.onerror = (event) => {
      if (dataLength === operationCompleted) {
        success$.complete();
        error$.complete();
      }
    };

    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.delete(data[id] as any);
    request.onsuccess = (event) => {
      operationCompleted += 1;
      success$.next(data);
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

      error$.next(error);
    };

    return { success$, error$ };
  }

  public clear<T>(storeName: ObjectStoreNames) {
    let success$ = new Subject<T>();
    let error$ = new Subject<IndexedDBbCustomRequestError<T>>();
    let dataLength = 1;
    let operationCompleted = 0;

    const transaction = this.db.transaction([storeName], "readwrite");

    transaction.oncomplete = (event) => {
      success$.complete();
      error$.complete();
    };

    transaction.onerror = (event) => {
      if (dataLength === operationCompleted) {
        success$.complete();
        error$.complete();
      }
    };

    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.clear();
    request.onsuccess = (event) => {
      operationCompleted += 1;
    };

    request.onerror = (event) => {
      operationCompleted += 1;
      let error: IndexedDBbCustomRequestError<T> = {
        request: event.target as IDBRequest,
        translateKey: IndexDBErrors.UnknownError,
        data: undefined as any
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

      error$.next(error);
    };

    return { success$, error$ };
  }

  public destroyDB() {
    this.db.close();
    indexedDB.deleteDatabase(this.dbName);
  }
}