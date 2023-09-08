export interface ILocalizationCategory {
    Name: string;
    Keys: { [language: string]: number };
    KeysTranslated: { [language: string]: number };
}

export interface ILocalizationKey {
    Category: string;
    Name: string;
    Custom?: boolean;
    Translated: { [language: string]: boolean };
    Original: { [language: string]: string };
    Translations: { [language: string]: string };
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
