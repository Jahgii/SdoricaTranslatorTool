import { ApiErrors, ApiSucess } from "./i-api";
import { IndexDBErrors, IndexDBSucess } from "./i-indexed-db";

export interface OperationLog {
    file: string;
    message?: string;
    translateKey: IndexDBSucess | IndexDBErrors | ApiErrors | ApiSucess;
    data: any;
}