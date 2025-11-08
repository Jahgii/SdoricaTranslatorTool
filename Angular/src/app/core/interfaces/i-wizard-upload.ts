import { BehaviorSubject, Observable } from "rxjs";

export interface IWizardUpload {
    Uploading: BehaviorSubject<boolean>;
    Uploaded: BehaviorSubject<boolean> | Observable<boolean>;
    UploadError: BehaviorSubject<boolean>;
    FileSkip: BehaviorSubject<number>;
    Language: string;
}