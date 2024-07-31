import { AppModes } from "../enums/app-modes";

export interface IExportPercentages {
    Dialogs: number;
    Keys: number;
}

export interface ExportPostMessage {
    dbName: string;
    dbVersion: number;
    appMode: AppModes;
    apiUrl: string;
    apiKey: string;
    file: any;
    decodeResult: any;
    lang: string;
    token?: string;
}