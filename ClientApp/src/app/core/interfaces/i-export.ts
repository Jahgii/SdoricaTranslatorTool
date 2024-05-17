import { AppModes } from "../enums/app-modes";

export interface IExportPercentages {
    Dialogs: number;
    Keys: number;
}

export interface ExportPostMessage {
    dbName: string;
    dbVersion: number;
    appMode: AppModes;
    file: any;
    lang: string;
    token?: string;
}