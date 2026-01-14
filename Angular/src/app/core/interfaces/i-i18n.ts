export interface IAppText {
    Id?: string;
    Custom: number, // IndexedDB Limitation
    Language: string;
    Content: any;
}

/**
 *  1. Load english
 *  2. Extract all keys and store in array
 *  3. create a list that use that array and iterate over all languages in index db
 *      3.1. arrayLanguages[index].Language -- arrayLanguages[index].Content[key]
 * 
 * ---------
 * 
 * 
 * 
 */