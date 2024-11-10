import { TuiSelectModule } from "@taiga-ui/legacy";
import { TuiCardLarge } from "@taiga-ui/layout";
import {
  AsyncPipe,
  DecimalPipe,
  KeyValuePipe,
  NgFor,
  NgIf,
  NgStyle,
  NgTemplateOutlet,
} from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  TuiButton,
  TuiHint,
  TuiIcon,
  TuiLoader,
  TuiScrollbar,
} from "@taiga-ui/core";
import {
  TuiAccordion,
  TuiAvatar,
  TuiBadge,
  TuiBlock,
  TuiButtonLoading,
  TuiCheckbox,
  TuiDataListWrapper,
  TuiElasticContainer,
  TuiFiles,
} from "@taiga-ui/kit";
import { ImportService } from "../import.service";
import { TranslateModule } from "@ngx-translate/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-import-main",
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

    TuiIcon,
    TuiAccordion,
    TuiButton,
    TuiCardLarge,
    TuiFiles,
    TuiAvatar,
    TuiLoader,
    TuiHint,
    TuiSelectModule,
    TuiDataListWrapper,
    TuiBlock,
    TuiCheckbox,
    TuiScrollbar,
    TuiElasticContainer,
    TuiBadge,
    TuiButtonLoading,
  ],
  providers: [ImportService],
  templateUrl: "./import-main.component.html",
  styleUrl: "./import-main.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
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
