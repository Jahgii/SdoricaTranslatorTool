export interface IAppText {
    Id?: string;
    Custom: number, // IndexedDB Limitation
    Language: string;
    Content: any;
    Taiga?: any;
}