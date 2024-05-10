export interface IndexedDBbCustomRequestError<T> {
    request: IDBRequest;
    translateKey: IndexDBErrors;
    data: T;
}

export interface IndexedDBbCustomRequestErrorWorker<T> {
    message?: string;
    translateKey: IndexDBErrors;
    data: T;
}

export enum IndexDBErrors {
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