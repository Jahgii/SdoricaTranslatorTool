import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiFileLike } from '@taiga-ui/kit';
import { Observable, Subject, finalize, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  readonly control = new FormControl();
  readonly rejectedFiles$ = new Subject<TuiFileLike | null>();
  readonly loadingFiles$ = new Subject<TuiFileLike | null>();
  readonly loadedFiles$ = this.control.valueChanges.pipe(
    switchMap(file => (file ? this.makeRequest(file) : of(null))),
  );

  constructor() { }

  onReject(file: TuiFileLike | readonly TuiFileLike[]): void {
    this.rejectedFiles$.next(file as TuiFileLike);
  }

  removeFile(): void {
    this.control.setValue(null);
  }

  clearRejected(): void {
    this.removeFile();
    this.rejectedFiles$.next(null);
  }

  makeRequest(file: TuiFileLike): Observable<TuiFileLike | null> {
    this.loadingFiles$.next(file);

    // this.onReadFile(file as File);

    return of(
      map(() => {
        return file;
      }),
      finalize(() => this.loadingFiles$.next(null)),
    );
  }

}
