import { IDialogAsset } from "./i-dialog-asset";
import { IGroup, IMainGroup } from "./i-dialog-group";

export interface ImportOBBVerificationPostMessage {
    file: File;
}

export interface ImportOBBVerificationWorkerPostMessage {
    message: 'file-error' | 'file-verifying-complete' | 'file-verified',
    dialogAssets: { [language: string]: IDialogAsset[] };
    dialogAssetsInclude: { [language: string]: boolean };
    dialogAssetsMainGroups: { [language: string]: { [mainGroup: string]: IMainGroup } };
    dialogAssetsGroups: { [language: string]: { [mainGroup: string]: { [group: string]: IGroup } } };
}