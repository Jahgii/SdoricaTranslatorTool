export interface IMainGroup {
    Language: string;
    OriginalName: string;
    Name: string;
    ImageLink: string;
    Files: number;
    TranslatedFiles: number;
    Order: number;

    /** Only on UI */
    editing?: boolean;
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

    /** Only on UI */
    editing?: boolean;
}

export interface ILanguage {
    Name: string;
}