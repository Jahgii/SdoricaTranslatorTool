import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { TreeNode } from './dialog-selection.component';
import { TuiTreeLoader } from '@taiga-ui/kit';
import { ApiService } from 'src/app/core/services/api.service';
import { IGroup, IMainGroup } from 'src/app/core/interfaces/i-dialog-group';

@Injectable()
export class TreeLoaderService implements TuiTreeLoader<TreeNode> {

  constructor(private api: ApiService) { }

  loadChildren({ Language, OriginalName }: TreeNode): Observable<TreeNode[]> {
    return this.api
      .getWithHeaders<TreeNode[]>('maingroups', { language: Language })
      .pipe(
        map(array => array
          .map(g => {
            g.editing = false;
            g.children = true;
            return g;
          }
          ))
      );
  }

  hasChildren({ children }: TreeNode): boolean {
    return !!children;
  }
}