export interface ILibreTranslateResponse {
    translatedText: string;
}

export interface ILibreTranslateLanguages {
    code: string;
    name: string;
    targets: string[];
}

export interface ILibreTranslateError {
    error: string
}