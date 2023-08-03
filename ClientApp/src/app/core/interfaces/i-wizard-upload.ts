import { BehaviorSubject } from "rxjs";

export interface IWizardUpload {
    Uploading: BehaviorSubject<boolean>;
    Uploaded: BehaviorSubject<boolean>;
    UploadError: BehaviorSubject<boolean>;
    FileSkip: BehaviorSubject<number>;
    Language: string;
}