import { Injectable } from '@angular/core';
import { TuiInputInline } from '@taiga-ui/kit';
import { BehaviorSubject, Observable, Subject, firstValueFrom, map, mergeMap, of, toArray } from 'rxjs';
import { AppModes } from 'src/app/core/enums/app-modes';
import { IGroup, IMainGroup } from 'src/app/core/interfaces/i-dialog-group';
import { Indexes, ObjectStoreNames } from 'src/app/core/interfaces/i-indexed-db';
import { AlertService } from 'src/app/core/services/alert.service';
import { ApiService } from 'src/app/core/services/api.service';
import { IndexDBService } from 'src/app/core/services/index-db.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { StoreService } from 'src/app/core/services/store.service';

export interface TreeNode extends IMainGroup {
  children?: readonly TreeNode[];
  expanded?: boolean;
  saving?: BehaviorSubject<boolean>;
  selected?: BehaviorSubject<boolean>;
}

@Injectable({
  providedIn: 'root'
})
export class DGroupsService extends StoreService<TreeNode> {

  constructor(
    private readonly api: ApiService,
    private readonly indexedDB: IndexDBService,
    private readonly lStorage: LocalStorageService,
    private readonly alert: AlertService,
    readonly languageOrigin: LanguageOriginService,
  ) {
    super();
    this.init();
  }

  private init() {
    this.languageOrigin.language$
      .subscribe((lang: string) => {
        let mainNodes$: Observable<TreeNode[]> | Subject<TreeNode[]> | undefined;

        if (this.lStorage.getAppMode() === AppModes.Offline) {
          let r = this.indexedDB.getIndex<TreeNode[], ObjectStoreNames.MainGroup>(
            ObjectStoreNames.MainGroup,
            Indexes.MainGroup.Language,
            lang
          );
          mainNodes$ = r.success$;
        }
        else if (this.lStorage.getAppMode() === AppModes.Online) {
          mainNodes$ = this.api.getWithHeaders<TreeNode[]>('maingroups', { language: lang });
        }

        if (mainNodes$ === undefined) mainNodes$ = of([]);

        let mainNodes = mainNodes$.pipe(
          map(array => array.map(
            g => {
              g.expanded = false;
              g.saving = new BehaviorSubject<boolean>(false);
              g.selected = new BehaviorSubject<boolean>(false);
              return g;
            }
          ))
        );

        let groupNodes = mainNodes.pipe(
          mergeMap((v) => v),
          mergeMap((v) =>
            this.groupQuery(lang, v.OriginalName)
              .pipe(
                map((res) => {
                  v.children = res;
                  return v;
                })
              )
          ),
          toArray()
        );

        this.initData(groupNodes);
      });
  }

  private groupQuery(lang: string, originalName: string) {
    let groupNodes$: Observable<TreeNode[]> | Subject<TreeNode[]> | undefined;

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB.getIndex<TreeNode[], ObjectStoreNames.Group>(
        ObjectStoreNames.Group,
        Indexes.Group.MainGroup,
        [lang, originalName]
      );
      groupNodes$ = r.success$;
    }
    else if (this.lStorage.getAppMode() === AppModes.Online) {
      groupNodes$ = this.api.getWithHeaders<TreeNode[]>('groups', { language: lang, mainGroup: originalName })
    }

    groupNodes$ ??= of([]);

    return groupNodes$
      .pipe(map(array => array.map(
        g => {
          g.saving = new BehaviorSubject<boolean>(false);
          g.selected = new BehaviorSubject<boolean>(false);
          return g;
        }
      ))
      );
  }

  public async onChangeName(node: TreeNode, oldName: string, input: TuiInputInline) {
    let updateNode: IMainGroup = {
      Id: node.Id,
      Name: node.Name,
      Language: node.Language,
      OriginalName: node.OriginalName,
      ImageLink: node.ImageLink,
      Files: node.Files,
      TranslatedFiles: node.TranslatedFiles,
      Order: node.Order
    };

    let url = "";
    let store = undefined;

    if ((node as IGroup).MainGroup) {
      url = 'groups';
      store = ObjectStoreNames.Group;
      (updateNode as IGroup).MainGroup = (node as IGroup).MainGroup;
    }
    else {
      url = 'maingroups';
      store = ObjectStoreNames.MainGroup;
    }

    let request$: Observable<TreeNode> | Subject<TreeNode> | undefined;

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB.put<TreeNode>(store, updateNode);
      request$ = r.success$;
    }
    else if (this.lStorage.getAppMode() === AppModes.Online) {
      request$ = this.api.put(url, updateNode);
    }

    if (request$ === undefined) return;

    await firstValueFrom(request$)
      .then(_ => {
        this.alert.showAlert(
          'alert-success',
          'alert-success-label',
          'positive',
          'circle-check-big'
        );
      }, _ => {
        (input as any).control?.patchValue(oldName, { emitEvent: false });
        this.alert.showAlert(
          'alert-error',
          'alert-error-label',
          'positive',
          'circle-check-big'
        );
      });
  }

  public onCheckTranslated(node: TreeNode, translated: boolean) {
    if ((node as IGroup).MainGroup) {
      let mainGroupName = (node as IGroup).MainGroup;
      let addOrSubs = translated === true ? 1 : -1;
      node.TranslatedFiles += addOrSubs;

      let nodes = this.getData();
      let parentIndex = nodes.findIndex(e => e.OriginalName === mainGroupName);
      let parentNode = nodes[parentIndex];

      if (parentNode) {
        parentNode.TranslatedFiles += addOrSubs;
        this.update(parentNode, parentIndex);
      }

      if (this.lStorage.getAppMode() === AppModes.Offline) {
        let mainGroup: IMainGroup = {
          Id: parentNode.Id,
          Language: parentNode.Language,
          OriginalName: parentNode.OriginalName,
          Name: parentNode.Name,
          ImageLink: parentNode.ImageLink,
          Files: parentNode.Files,
          TranslatedFiles: parentNode.TranslatedFiles,
          Order: parentNode.Order
        };

        let group: IGroup = {
          Id: node.Id,
          Language: node.Language,
          MainGroup: mainGroupName,
          OriginalName: node.OriginalName,
          Name: node.Name,
          ImageLink: node.ImageLink,
          Files: node.Files,
          TranslatedFiles: node.TranslatedFiles,
          Order: node.Order
        };

        this.indexedDB.put(ObjectStoreNames.MainGroup, mainGroup);
        this.indexedDB.put(ObjectStoreNames.Group, group);
      }
    }
  }
}