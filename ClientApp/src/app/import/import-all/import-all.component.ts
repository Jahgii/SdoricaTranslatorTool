import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ImportAllService } from '../import-all.service';
import { AsyncPipe, NgIf, NgTemplateOutlet } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiAvatar, TuiBadge, TuiButtonLoading, TuiCheckbox, TuiFiles, TuiTabs } from '@taiga-ui/kit';
import { TuiAppearance, TuiButton, TuiHint, TuiIcon, TuiLoader, TuiScrollbar, TuiTitle } from '@taiga-ui/core';
import { TuiCardMedium, TuiHeader } from '@taiga-ui/layout';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-import-all',
  standalone: true,
  providers: [
    ImportAllService
  ],
  imports: [
    AsyncPipe,
    NgIf,
    NgTemplateOutlet,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,

    TranslateModule,

    TuiFiles,
    TuiCardMedium,
    TuiAppearance,
    TuiHint,
    TuiTitle,
    TuiHeader,
    TuiAvatar,
    TuiLoader,
    TuiIcon,
    TuiTabs,
    TuiCheckbox,
    TuiScrollbar,
    TuiTitle,
    TuiHeader,
    TuiBadge,
    TuiButton,
    TuiButtonLoading,
  ],
  templateUrl: './import-all.component.html',
  styleUrl: './import-all.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportAllComponent {
  protected readonly importAllS = inject(ImportAllService);

  protected activeItemIndex = 0;
}
