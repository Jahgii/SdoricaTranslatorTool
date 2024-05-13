import { AsyncPipe, NgIf, DecimalPipe, NgTemplateOutlet, NgStyle, KeyValuePipe, NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TuiButtonModule, TuiHintModule, TuiLoaderModule, TuiModeModule, TuiScrollbarModule, TuiSvgModule } from '@taiga-ui/core';
import { TuiAccordionModule, TuiBadgeModule, TuiCheckboxBlockModule, TuiDataListWrapperModule, TuiElasticContainerModule, TuiInputFilesModule, TuiIslandModule, TuiMarkerIconModule, TuiSelectModule } from '@taiga-ui/kit';
import { ImportService } from '../import.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BehaviorSubject } from 'rxjs';

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
    TuiBadgeModule,
    TuiModeModule
  ],
  providers: [ImportService],
  templateUrl: './import-main.component.html',
  styleUrl: './import-main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportMainComponent implements OnChanges {
  @Output()
  public next = new EventEmitter();

  @Input()
  public showSkipButton: boolean = true;
  public showSkipButton$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.showSkipButton);

  constructor(@Inject(ImportService) public importS: ImportService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.showSkipButton) {
      this.showSkipButton$.next(this.showSkipButton);
    }
  }

  public onNext() {
    this.next.emit();
  }

}
