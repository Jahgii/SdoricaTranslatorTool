export interface IGamedataCategory {
    Name: string;
    Keys: { [language: string]: number };
}

export interface IGamedataValue {
    Category: string;
    Name: string;
    Custom?: boolean;
    Content: { [key: string]: any };
}

export interface IGamedata {
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
