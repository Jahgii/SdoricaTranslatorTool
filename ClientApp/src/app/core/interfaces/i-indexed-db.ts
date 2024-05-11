export interface IndexedDBbCustomRequestError<T> {
    request: IDBRequest;
    translateKey: IndexDBErrors;
    data: T;
}

export interface IndexedDBbCustomRequestErrorWorker<T> {
    file: 'obb' | 'obb-lang' | 'obb-main' | 'obb-group' | 'gamedata' | 'gamedata-categories' | 'gamedata-values' | 'localization' | 'localization-keys' | 'localization-categories'
    message?: string;
    translateKey: IndexDBErrors | IndexDBSucess;
    data: T;
}

export enum IndexDBSucess {
    KeyUpdated = "data-updated",
    FileCompleted = "file-completed",
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