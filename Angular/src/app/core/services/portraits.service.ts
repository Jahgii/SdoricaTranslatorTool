import { Inject, Injectable, Injector, signal } from '@angular/core';
import { IndexDBService } from './index-db.service';
import { ObjectStoreNames } from '../interfaces/i-indexed-db';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TuiAlertService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { AlertPortraitMode, AlertPortraitsComponent } from 'src/app/components/alert-portraits/alert-portraits.component';
import { PersistentModes } from '../enums/persistent-modes';
import { LocalStorageService } from './local-storage.service';
import { GetImages, PickFolder } from 'wailsjs/go/main/App';

@Injectable({
  providedIn: 'root'
})
export class PortraitsService {
  private dirHandle!: FileSystemDirectoryHandle;
  public dirName$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public imageDir: { [name: string]: string } = {};
  public loading$ = signal(false);

  constructor(
    private readonly local: LocalStorageService,
    private readonly indexDB: IndexDBService,
    private readonly translate: TranslateService,
    @Inject(TuiAlertService)
    private readonly alerts: TuiAlertService,
    @Inject(Injector)
    private readonly injector: Injector
  ) {
    this.folderInit();
  }

  private async folderInit() {
    let mode = this.local.getPortraitPersistentMode();

    if (mode == PersistentModes.FileSystemAPI) this.folderInitFileSystemAPI();
    else this.folderInitFallback();
  }

  private openAlert() {
    this.alerts
      .open<boolean>(
        new PolymorpheusComponent(AlertPortraitsComponent, this.injector),
        {
          label: this.translate.instant('portrait-directory-miss-label'),
          appearance: 'warning',
          autoClose: 0,
          data: AlertPortraitMode.MissFolder
        },
      ).subscribe();
  }

  public async onFolderChange() {
    let success = false;
    if ((window as any).showDirectoryPicker) success = await this.onFolderChangeFileSystemAPI();
    else success = await this.onFolderChangeFallback();

    return success;
  }

  //#region File System Access API
  private async folderInitFileSystemAPI() {
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
        this.loadFilesFileSystemAPI();
      });
  }

  private async onFolderChangeFileSystemAPI() {
    this.dirHandle = await (window as any).showDirectoryPicker();

    if (this.dirHandle) {
      this.local.setPortraitPersistentMode(PersistentModes.FileSystemAPI);
      this.dirName$.next(this.dirHandle.name);
      this.indexDB.clear(ObjectStoreNames.UserDirectories);
      this.indexDB.post(ObjectStoreNames.UserDirectories, this.dirHandle);
      this.loadFilesFileSystemAPI();
      return true;
    }

    return false;
  }

  private async loadFilesFileSystemAPI() {
    const files: File[] = [];

    try { await this.readDirectory(this.dirHandle, files); }
    catch { this.openAlert(); }

    this.imageDir = {};

    for (const file of files) {
      this.imageDir[file.name] = URL.createObjectURL(file);
    }
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
          appearance: 'warning',
          autoClose: 0,
          data: AlertPortraitMode.MissPermission
        },
      )
      .subscribe();

    return false;
  }

  public async onRequestPermissions() {
    const options = { mode: "read" };
    if ((await (this.dirHandle as any).requestPermission(options)) === 'granted') {
      this.dirName$.next(this.dirHandle.name);
      this.loadFilesFileSystemAPI();
      return true;
    }

    return false;
  }

  private async readDirectory(fSDA: FileSystemDirectoryHandle, files: File[]) {
    for await (const entry of (fSDA as any).values()) {
      if (entry.kind === 'directory') {
        await this.readDirectory(entry, files);
        continue;
      }

      const ext = entry.name.toLowerCase();
      if (ext.endsWith('.png') || ext.endsWith('.jpg') || ext.endsWith('.jpeg')) {
        files.push(await (entry as any).getFile().then((file: File) => file));
      }
    }
  }
  //#endregion

  //#region File System Access API Fallback
  private async folderInitFallback() {
    let path = this.local.getPortraitFallbackPath();
    if (!path) return;

    // await GetImages(path).then(files => {
    //   this.dirName$.next(path);

    //   this.imageDir = files;
    // });
  }

  private async onFolderChangeFallback() {
    return await PickFolder().then(async (path: string) => {
      if (!path) return false;

      return await GetImages(path).then(async files => {
        this.local.setPortraitPersistentMode(PersistentModes.Fallback);
        this.local.setPortraitFallbackPath(path);
        this.dirName$.next(path);

        this.imageDir = files;

        return true;
      });
    });
  }
  //#endregion

}
