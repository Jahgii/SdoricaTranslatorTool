import { FormControl } from "@angular/forms";
import { BehaviorSubject, Observable } from "rxjs";
import { ProgressStatus } from "./i-export-progress";
import { TuiFileLike } from "@taiga-ui/kit";

export interface IFileControl {
    control: FormControl;
    loadedFile$?: Observable<TuiFileLike | null>;
    verifyingFile$: BehaviorSubject<boolean>;
    verifiedFile$: BehaviorSubject<boolean>;
    verificationCallback: (file: File, fileControl: IFileControl) => any;
    progressStatus$: BehaviorSubject<ProgressStatus>;
    progress$: BehaviorSubject<number>;
    progressMax$: BehaviorSubject<number>;
    url: string | undefined;
    skip?: BehaviorSubject<boolean>;
}