import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription, firstValueFrom, map, mergeMap, toArray } from 'rxjs';
import { IGroup, IMainGroup } from 'src/app/core/interfaces/i-dialog-group';
import { ApiService } from 'src/app/core/services/api.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
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
  private subsLanguage!: Subscription;

  constructor(
    private api: ApiService,
    readonly languageOrigin: LanguageOriginService,
  ) {
    super();
    this.init();
  }

  private init() {
    this.subsLanguage = this.languageOrigin.language$
      .subscribe((lang: string) => {
        let mainNodes = this.api
          .getWithHeaders<TreeNode[]>('maingroups', { language: lang })
          .pipe(
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
    return this.api
      .getWithHeaders<TreeNode[]>('groups', { language: lang, mainGroup: originalName })
      .pipe(map(array => array.map(
        g => {
          g.saving = new BehaviorSubject<boolean>(false);
          g.selected = new BehaviorSubject<boolean>(false);
          return g;
        }
      ))
      );
  }

  public async onChangeName(node: TreeNode) {
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

    if ((node as IGroup).MainGroup) {
      url = 'groups';
      (updateNode as IGroup).MainGroup = (node as IGroup).MainGroup;
    }
    else {
      url = 'maingroups';
    }

    await firstValueFrom(this.api.put(url, updateNode))
      .then(r => {

      }, error => {

      });
  }
}