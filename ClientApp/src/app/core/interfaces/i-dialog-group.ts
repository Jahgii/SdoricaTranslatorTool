export interface IMainGroup {
    Language: string;
    OriginalName: string;
    Name: string;
    ImageLink: string;
    Files: number;
    TranslatedFiles: number;
    Order: number;
}

export interface IGroup {
    Language: string;
    MainGroup: string;
    OriginalName: string;
    Name: string;
    ImageLink: string;
    Files: number;
    TranslatedFiles: number;
    Order: number;
}

export interface ILanguage {
    Name: string;
}