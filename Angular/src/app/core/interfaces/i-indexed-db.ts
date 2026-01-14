export interface IndexedDBbCustomRequestError<T> {
    request: IDBRequest;
    translateKey: IndexDBErrors;
    data: T;
}

export interface IndexedDBbCustomRequestWorker<T> {
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
    User = "User",
    UserDirectories = "UserDirectories",
    AppLanguages = "AppLanguages"
}

export namespace Indexes {
    export enum CommonWord {
        Original = "Original"
    }

    export enum DialogAsset {
        Original = "Original",
        Filename = "Filename",
        Group = "Group",
        Content = "Content",
        Dialog = "Dialog",
        Language = "Language",
        Translated = "Translated",
    }

    export enum GamedataCategory {
        Name = "Name"
    }

    export enum GamedataValue {
        Name = "Name"
    }

    export enum Group {
        Name = "Name",
        MainGroup = "MainGroup"
    }

    export enum Languages {
        Name = "Name"
    }

    export enum LocalizationCategory {
        Name = "Name"
    }

    export enum LocalizationKey {
        Name = "Name",
        Category = "Category",
        Key = "Key",
    }

    export enum MainGroup {
        Name = "Name",
        Language = "Language",
    }

    export enum User { }

    export enum UserDirectories {
        Name = "Name",
    }

    export enum AppLanguages {
        Language = "Language",
        Custom = "Custom",
    }
}

export type StoreIndexMap = {
    [ObjectStoreNames.CommonWord]: Indexes.CommonWord,
    [ObjectStoreNames.DialogAsset]: Indexes.DialogAsset,
    [ObjectStoreNames.GamedataCategory]: Indexes.GamedataCategory,
    [ObjectStoreNames.GamedataValue]: Indexes.GamedataValue,
    [ObjectStoreNames.Group]: Indexes.Group,
    [ObjectStoreNames.Languages]: Indexes.Languages,
    [ObjectStoreNames.LocalizationCategory]: Indexes.LocalizationCategory,
    [ObjectStoreNames.LocalizationKey]: Indexes.LocalizationKey,
    [ObjectStoreNames.MainGroup]: Indexes.MainGroup,
    [ObjectStoreNames.User]: Indexes.User,
    [ObjectStoreNames.UserDirectories]: Indexes.UserDirectories,
    [ObjectStoreNames.AppLanguages]: Indexes.AppLanguages,
}