export interface IOnMessage {
    maxPg: number;
    pg: number;
    blob?: Blob;
    pgState: ProgressStatus;

}

export enum ProgressStatus {
    waiting = 'waiting',
    retrivingServerData = 'retriving-server-data',
    retrivingServerDataSucess = 'retriving-server-data-sucess',
    retrivingServerDataError = 'retriving-server-data-error',
    retrivingServerDataEmpty = 'retriving-server-data-empty',
    replacingContent = 'replacing-content',
    generatingNewFile = 'generating-new-file',
    finish = 'finish',
};

export enum ExportMessages {
    retrivingServerDataGamedataValues = 'retriving-server-data-gamedatavalues',
    retrivingServerDataDialogs = 'retriving-server-data-dialogs',
    retrivingServerDataKeys = 'retriving-server-data-keys',
    retrivingServerDataCommonwords = 'retriving-server-data-commonwords',
    retrivingServerDataGamedataValuesSuccess = 'retriving-server-data-gamedatavalues-sucess',
    retrivingServerDataDialogsSuccess = 'retriving-server-data-dialogs-sucess',
    retrivingServerDataKeysSuccess = 'retriving-server-data-keys-sucess',
    retrivingServerDataCommonwordsSuccess = 'retriving-server-data-commonwords-sucess',
    retrivingServerDataGamedataValuesError = 'retriving-server-data-gamedatavalues-error',
    retrivingServerDataDialogsError = 'retriving-server-data-dialogs-error',
    retrivingServerDataKeysError = 'retriving-server-data-keys-error',
    retrivingServerDataCommonwordsError = 'retriving-server-data-commonwords-error',
    retrivingServerDataGamedataValuesEmpty = 'retriving-server-data-gamedatavalues-empty',
    retrivingServerDataDialogsEmpty = 'retriving-server-data-dialogs-empty',
    retrivingServerDataKeysEmpty = 'retriving-server-data-keys-empty',
    retrivingServerDataCommonwordsEmpty = 'retriving-server-data-commonwords-empty',
}