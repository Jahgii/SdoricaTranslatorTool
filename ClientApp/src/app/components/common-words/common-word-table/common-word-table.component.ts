import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiBreakpointService, TuiButton, TuiLoader, TuiScrollable, TuiScrollbar, TuiTextfield } from '@taiga-ui/core';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { ICommonWord } from 'src/app/core/interfaces/i-common-word';
import { CommonWordsService } from 'src/app/core/services/common-words.service';
import { CommonWordTableCellEditableComponent } from './common-word-table-cell-editable/common-word-table-cell-editable.component';
import { AutoFocusDirective } from 'src/app/core/directives/auto-focus.directive';

@Component({
  selector: 'app-common-word-table',
  templateUrl: './common-word-table.component.html',
  styleUrl: './common-word-table.component.scss',
  imports: [
    NgTemplateOutlet,
    AsyncPipe,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    FormsModule,
    
    TranslateModule,

    TuiScrollable,
    TuiScrollbar,
    TuiTable,
    TuiTextfield,
    TuiLoader,
    TuiButton,
    TuiButtonLoading,

    CommonWordTableCellEditableComponent,
    AutoFocusDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonWordTableComponent {
  protected readonly breakpointService$ = inject(TuiBreakpointService);
  public commonWords = inject(CommonWordsService);

  public columns = ['Original', 'Translation', 'actions', 'confirmDelete'];

  public trackByItemId(index: number, item: ICommonWord): string {
    return String(item.Id);
  }
}
