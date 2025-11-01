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
    UserDirectories = "UserDirectories"
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

    export enum UserDirectories {
        Name = "Name",
    }
}