import { ApiErrors, ApiSuccess } from "./i-api";
import { IndexDBErrors, IndexDBSucess } from "./i-indexed-db";

export interface OperationLog {
    file: string;
    message?: string;
    translateKey: IndexDBSucess | IndexDBErrors | ApiErrors | ApiSuccess;
    data: any;
}