import { Inject, Injectable, Injector } from '@angular/core';
import { IndexDBService } from './index-db.service';
import { ObjectStoreNames } from '../interfaces/i-indexed-db';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TuiAlertService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { AlertPortraitMode, AlertPortraitsComponent } from 'src/app/components/alert-portraits/alert-portraits.component';

@Injectable({
  providedIn: 'root'
})
export class PortraitsService {
  private dirHandle!: FileSystemDirectoryHandle;
  public dirName$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public imageDir: { [name: string]: string } = {};

  constructor(
    private indexDB: IndexDBService,
    private translate: TranslateService,
    @Inject(TuiAlertService)
    private readonly alerts: TuiAlertService,
    @Inject(Injector)
    private readonly injector: Injector
  ) {
    this.folderInit();
  }

  private async folderInit() {
    let request = this.indexDB
      .getAll<FileSystemDirectoryHandle[]>(ObjectStoreNames.UserDirectories)
      .success$;

    await firstValueFrom(request)
      .then(async handles => {
        if (handles.length === 0) return;

        let handle = handles[0];

        let permissionVerified = await this.verifyPermission(handle);
        if (permissionVerified === false) return;

        this.dirHandle = handle;
        this.dirName$.next(handle.name);
        this.loadFiles();
      });
  }

  private async verifyPermission(handler: any) {
    const options = { mode: "read" };

    if ((await handler.queryPermission(options)) === 'granted') {
      return true;
    }

    this.dirHandle = handler;
    this.alerts
      .open<boolean>(
        new PolymorpheusComponent(AlertPortraitsComponent, this.injector),
        {
          label: this.translate.instant('portrait-directory-permission-label'),
          status: 'warning',
          autoClose: false,
          data: AlertPortraitMode.MissPermission
        },
      )
      .subscribe();

    return false;
  }

  private async loadFiles() {
    const promises: File[] = [];

    try {
      for await (const entry of (this.dirHandle as any).values()) {
        if (entry.kind !== 'file') {
          continue;
        }

        promises.push(entry.getFile().then((file: File) => file));
      }
    }
    catch (error) {
      this.openAlert();
    }

    this.imageDir = {};

    await Promise.all(promises)
      .then(files => {
        for (let index = 0; index < files.length; index++) {
          const file = files[index];
          this.imageDir[file.name] = URL.createObjectURL(file);
        }
      });
  }

  private openAlert() {
    this.alerts
      .open<boolean>(
        new PolymorpheusComponent(AlertPortraitsComponent, this.injector),
        {
          label: this.translate.instant('portrait-directory-miss-label'),
          status: 'warning',
          autoClose: false,
          data: AlertPortraitMode.MissFolder
        },
      ).subscribe();
  }

  public async onFolderChange() {
    this.dirHandle = await (window as any).showDirectoryPicker();

    if (this.dirHandle) {
      this.dirName$.next(this.dirHandle.name);
      this.indexDB.clear(ObjectStoreNames.UserDirectories);
      this.indexDB.post(ObjectStoreNames.UserDirectories, this.dirHandle);
      this.loadFiles();
      return true;
    }

    return false;
  }

  public async onRequestPermissions() {
    const options = { mode: "read" };
    if ((await (this.dirHandle as any).requestPermission(options)) === 'granted') {
      this.dirName$.next(this.dirHandle.name);
      this.loadFiles();
      return true;
    }

    return false;
  }

}
