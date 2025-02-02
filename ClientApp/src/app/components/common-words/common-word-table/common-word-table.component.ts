import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiButton, TuiLoader, TuiScrollable, TuiScrollbar, TuiTextfield } from '@taiga-ui/core';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { TuiInputModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { fadeinAnimation } from 'src/app/core/animations/fadein';
import { CommonWordsService } from 'src/app/core/services/common-words.service';

@Component({
  selector: 'app-common-word-table',
  standalone: true,
  templateUrl: './common-word-table.component.html',
  styleUrl: './common-word-table.component.scss',
  animations: [
    fadeinAnimation
  ],
  imports: [
    FormsModule,
    AsyncPipe,

    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,

    TranslateModule,

    TuiScrollable,
    TuiScrollbar,
    TuiTable,
    TuiInputModule,
    TuiTextfield,
    TuiTextfieldControllerModule,
    TuiLoader,
    TuiButton,
    TuiButtonLoading,
  ],
})
export class CommonWordTableComponent {
  public commonWords = inject(CommonWordsService);
  public columns = ['Original', 'Translation', 'actions', 'confirmDelete'];
}
