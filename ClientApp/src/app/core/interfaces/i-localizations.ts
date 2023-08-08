export interface ILocalizationCategory {
    Name: string;
    Keys: number;
    KeysTranslated: number;
}

export interface ILocalizationKey {
    Category: string;
    Name: string;
    Translated: boolean;
    Translations: { [language: string]: string }
}

export interface ILocalization {
    A: { [key: string]: {} }
    C: {
        [key: string]: {
            /** Data Array [Index][K Index] */
            D: string[][]
            /** Data keys */
            K: string[]
            /** Array Element Types */
            T: string[]
        }
    }
    E: { [key: string]: {} }
}
