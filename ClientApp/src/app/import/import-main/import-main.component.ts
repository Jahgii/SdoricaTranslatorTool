import { AsyncPipe, NgIf, DecimalPipe, NgTemplateOutlet, NgStyle, KeyValuePipe, NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiButtonModule, TuiHintModule, TuiLoaderModule, TuiScrollbarModule, TuiSvgModule } from '@taiga-ui/core';
import { TuiAccordionModule, TuiCheckboxBlockModule, TuiDataListWrapperModule, TuiInputFilesModule, TuiIslandModule, TuiMarkerIconModule, TuiSelectModule } from '@taiga-ui/kit';
import { ImportService } from '../import.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-import-main',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    DecimalPipe,
    KeyValuePipe,
    NgStyle,
    NgTemplateOutlet,
    ScrollingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,

    TuiSvgModule,
    TuiAccordionModule,
    TuiButtonModule,
    TuiIslandModule,
    TuiInputFilesModule,
    TuiMarkerIconModule,
    TuiLoaderModule,
    TuiHintModule,
    TuiSelectModule,
    TuiDataListWrapperModule,
    TuiCheckboxBlockModule,
    TuiScrollbarModule
  ],
  providers: [ImportService],
  templateUrl: './import-main.component.html',
  styleUrl: './import-main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportMainComponent {

  constructor(@Inject(ImportService) public importS: ImportService) { }

  public onNext() {

  }

}
