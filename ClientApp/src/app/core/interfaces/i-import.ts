import { AppModes } from "../enums/app-modes";
import { IDialogAsset } from "./i-dialog-asset";
import { IGroup, IMainGroup } from "./i-dialog-group";

export interface ImportPostMessage {
    dbName: string;
    dbVersion: number;
    appMode: AppModes;
    obbSkip: boolean;
    localizationSkip: boolean;
    gamedataSkip: boolean;
    dialogAssetsUploading: string[];
    dialogAssets: { [language: string]: IDialogAsset[] };
    dialogAssetsInclude: { [language: string]: boolean };
    dialogAssetsMainGroups: { [language: string]: { [mainGroup: string]: IMainGroup } };
    dialogAssetsGroups: { [language: string]: { [mainGroup: string]: { [group: string]: IGroup } } };
}

export interface ImportWorkerPostMessage {

}

export interface ImportOBBVerificationPostMessage {
    file: File;
}

export interface ImportOBBVerificationWorkerPostMessage {
    message: 'file-error' | 'file-verifying-complete' | 'file-verified',
    dialogAssets?: { [language: string]: IDialogAsset[] };
    dialogAssetsInclude?: { [language: string]: boolean };
    dialogAssetsMainGroups?: { [language: string]: { [mainGroup: string]: IMainGroup } };
    dialogAssetsGroups?: { [language: string]: { [mainGroup: string]: { [group: string]: IGroup } } };
}