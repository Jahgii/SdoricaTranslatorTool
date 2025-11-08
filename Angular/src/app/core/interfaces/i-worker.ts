import { AppModes } from "../enums/app-modes";
import { ApiErrors, ApiSuccess } from "./i-api";
import { IDialogAsset } from "./i-dialog-asset";
import { IGroup, IMainGroup } from "./i-dialog-group";
import { IGamedataCategory, IGamedataValue } from "./i-gamedata";
import { IndexDBErrors, IndexDBSucess } from "./i-indexed-db";
import { ILocalizationCategory, ILocalizationKey } from "./i-localizations";

export interface ImportPostMessage {
    dbName: string;
    dbVersion: number;
    apiUrl: string;
    apiKey: string;
    token: string;
    uploadKeysUrl: string;
    appMode: AppModes;
    obbSkip: boolean;
    localizationSkip: boolean;
    gamedataSkip: boolean;
    dialogAssetsUploading: string[];
    dialogAssets: { [language: string]: IDialogAsset[] };
    dialogAssetsInclude: { [language: string]: boolean };
    dialogAssetsMainGroups: { [language: string]: { [mainGroup: string]: IMainGroup } };
    dialogAssetsGroups: { [language: string]: { [mainGroup: string]: { [group: string]: IGroup } } };
    localizationCategories: ILocalizationCategory[];
    localizationKeys: ILocalizationKey[];
    gamedataCategories: IGamedataCategory[];
    gamedataValues: IGamedataValue[];
}

export interface WorkerImportPostMessage<T> {
    file: 'obb' | 'obb-lang' | 'obb-main' | 'obb-group' | 'gamedata' | 'gamedata-categories' | 'gamedata-values' | 'localization' | 'localization-keys' | 'localization-categories'
    message?: string;
    translateKey: IndexDBErrors | IndexDBSucess | ApiErrors | ApiSuccess;
    data: T;
}

export interface ImportOBBVerificationPostMessage {
    file: File;
}

export interface WorkerImportOBBVerificationPostMessage {
    message: 'file-error' | 'file-verifying-complete' | 'file-verified',
    dialogAssets?: { [language: string]: IDialogAsset[] };
    dialogAssetsInclude?: { [language: string]: boolean };
    dialogAssetsMainGroups?: { [language: string]: { [mainGroup: string]: IMainGroup } };
    dialogAssetsGroups?: { [language: string]: { [mainGroup: string]: { [group: string]: IGroup } } };
}