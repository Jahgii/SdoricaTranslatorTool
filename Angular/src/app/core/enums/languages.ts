export enum LanguageType {
    english = 'English',
    japanese = 'Japanese',
    chinesetraditional = 'Chinese',
    chinesesimplified = 'ChineseSimplified',
    korean = 'Korean'
}

export const LanguageTypeReverse: { [key: string]: keyof typeof LanguageType } = {
    English: 'english',
    Japanese: 'japanese',
    Chinese: 'chinesetraditional',
    ChineseSimplified: 'chinesesimplified',
    Korean: 'korean'
};