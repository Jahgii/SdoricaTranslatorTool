import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ObjectStoreNames, IndexedDBbCustomRequestError, IndexDBErrors } from '../interfaces/i-indexed-db';

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

    const storeC: IDBObjectStore = !this.db.objectStoreNames.contains(ObjectStoreNames.CommonWord) ?
      this.db.createObjectStore(ObjectStoreNames.CommonWord, { keyPath: "Id", autoIncrement: true }) :
      (event.target as any).transaction.objectStore(ObjectStoreNames.CommonWord);

    if (!storeC.indexNames.contains("Original"))
      storeC.createIndex("Original", "Original", { unique: true });

    const storeDA: IDBObjectStore = !this.db.objectStoreNames.contains(ObjectStoreNames.DialogAsset) ?
      this.db.createObjectStore(ObjectStoreNames.DialogAsset, { keyPath: "Id", autoIncrement: true }) :
      (event.target as any).transaction.objectStore(ObjectStoreNames.DialogAsset);

    if (!storeDA.indexNames.contains("Filename"))
      storeDA.createIndex("Filename", "Filename", { unique: true });
    if (!storeDA.indexNames.contains("Group"))
      storeDA.createIndex("Group", ["Language", "MainGroup", "Group"], { unique: false });
    if (!storeDA.indexNames.contains("Content"))
      storeDA.createIndex("Content", ["MainGroup", "Group", "Number"], { unique: false });
    if (!storeDA.indexNames.contains("Language"))
      storeDA.createIndex("Language", "Language", { unique: false });
    if (!storeDA.indexNames.contains("Translated"))
      storeDA.createIndex("Translated", ["Language", "Translated"], { unique: false });

    const storeGC = !this.db.objectStoreNames.contains(ObjectStoreNames.GamedataCategory) ?
      this.db.createObjectStore(ObjectStoreNames.GamedataCategory, { keyPath: "Id", autoIncrement: true }) :
      (event.target as any).transaction.objectStore(ObjectStoreNames.GamedataCategory);

    if (!storeGC.indexNames.contains("Name"))
      storeGC.createIndex("Name", "Name", { unique: true });

    const storeGV = !this.db.objectStoreNames.contains(ObjectStoreNames.GamedataValue) ?
      this.db.createObjectStore(ObjectStoreNames.GamedataValue, { keyPath: "Id", autoIncrement: true }) :
      (event.target as any).transaction.objectStore(ObjectStoreNames.GamedataValue);

    if (!storeGV.indexNames.contains("Name"))
      storeGV.createIndex("Name", ["Category", "Name"], { unique: true });

    const storeG = !this.db.objectStoreNames.contains(ObjectStoreNames.Group) ?
      this.db.createObjectStore(ObjectStoreNames.Group, { keyPath: "Id", autoIncrement: true }) :
      (event.target as any).transaction.objectStore(ObjectStoreNames.Group);

    if (!storeG.indexNames.contains("Name"))
      storeG.createIndex("Name", ["Language", "MainGroup", "OriginalName"], { unique: true });
    if (!storeG.indexNames.contains("MainGroup"))
      storeG.createIndex("MainGroup", ["Language", "MainGroup"], { unique: false });

    const storeL = !this.db.objectStoreNames.contains(ObjectStoreNames.Languages) ?
      this.db.createObjectStore(ObjectStoreNames.Languages, { keyPath: "Id", autoIncrement: true }) :
      (event.target as any).transaction.objectStore(ObjectStoreNames.Languages);

    if (!storeL.indexNames.contains("Name"))
      storeL.createIndex("Name", "Name", { unique: true });

    const storeLC = !this.db.objectStoreNames.contains(ObjectStoreNames.LocalizationCategory) ?
      this.db.createObjectStore(ObjectStoreNames.LocalizationCategory, { keyPath: "Id", autoIncrement: true }) :
      (event.target as any).transaction.objectStore(ObjectStoreNames.LocalizationCategory);

    if (!storeLC.indexNames.contains("Name"))
      storeLC.createIndex("Name", "Name", { unique: true });

    const storeLK: IDBObjectStore = !this.db.objectStoreNames.contains(ObjectStoreNames.LocalizationKey) ?
      this.db.createObjectStore(ObjectStoreNames.LocalizationKey, { keyPath: "Id", autoIncrement: true }) :
      (event.target as any).transaction.objectStore(ObjectStoreNames.LocalizationKey);

    if (!storeLK.indexNames.contains("Name"))
      storeLK.createIndex("Name", ["Category", "Name"], { unique: true });
    if (!storeLK.indexNames.contains("Category"))
      storeLK.createIndex("Category", "Category", { unique: false });
    if (!storeLK.indexNames.contains("Key"))
      storeLK.createIndex("Key", "Name", { unique: false });

    const storeMG = !this.db.objectStoreNames.contains(ObjectStoreNames.MainGroup) ?
      this.db.createObjectStore(ObjectStoreNames.MainGroup, { keyPath: "Id", autoIncrement: true }) :
      (event.target as any).transaction.objectStore(ObjectStoreNames.MainGroup);

    if (!storeMG.indexNames.contains("Name"))
      storeMG.createIndex("Name", ["Language", "OriginalName"], { unique: true });
    if (!storeMG.indexNames.contains("Language"))
      storeMG.createIndex("Language", "Language", { unique: false });

    const storeP = !this.db.objectStoreNames.contains(ObjectStoreNames.UserDirectories) ?
      this.db.createObjectStore(ObjectStoreNames.UserDirectories, { keyPath: "Id", autoIncrement: true }) :
      (event.target as any).transaction.objectStore(ObjectStoreNames.UserDirectories);

    if (!storeP.indexNames.contains("Name"))
      storeP.createIndex("Name", "Name", { unique: true });
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
    data.forEach((d) => {
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
    });

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