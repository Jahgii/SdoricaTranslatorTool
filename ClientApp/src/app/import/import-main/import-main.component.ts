import { AsyncPipe, NgIf, DecimalPipe, NgTemplateOutlet, NgStyle, KeyValuePipe, NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Output } from '@angular/core';
import { TuiButtonModule, TuiHintModule, TuiLoaderModule, TuiScrollbarModule, TuiSvgModule } from '@taiga-ui/core';
import { TuiAccordionModule, TuiBadgeModule, TuiCheckboxBlockModule, TuiDataListWrapperModule, TuiElasticContainerModule, TuiInputFilesModule, TuiIslandModule, TuiMarkerIconModule, TuiSelectModule } from '@taiga-ui/kit';
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
    TuiScrollbarModule,
    TuiElasticContainerModule,
    TuiBadgeModule
  ],
  providers: [ImportService],
  templateUrl: './import-main.component.html',
  styleUrl: './import-main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportMainComponent {
  @Output() next = new EventEmitter();

  constructor(@Inject(ImportService) public importS: ImportService) { }

  public onNext() {
    this.next.emit();
  }

}
