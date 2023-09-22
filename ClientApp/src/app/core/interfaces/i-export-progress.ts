export interface IOnMessage {
    maxPg: number;
    pg: number;
    blob?: Blob;
    pgState: ProgressState;
}

export enum ProgressState {
    waiting = 'waiting',
    retrivingServerData = 'retriving-server-data',
    retrivingServerDataSucess = 'retriving-server-data-sucess',
    retrivingServerDataError = 'retriving-server-data-error',
    retrivingServerDataEmpty = 'retriving-server-data-empty',
    replacingContent = 'replacing-content',
    generatingNewFile = 'generating-new-file',
    finish = 'finish'
};