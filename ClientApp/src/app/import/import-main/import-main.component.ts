import { TuiCardMedium } from "@taiga-ui/layout";
import {
  AsyncPipe,
  KeyValuePipe,
  NgFor,
  NgIf,
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
  TuiAppearance,
  TuiButton,
  TuiHint,
  TuiIcon,
  TuiLoader,
  TuiScrollbar,
  TuiTextfield,
  TuiTitle,
} from "@taiga-ui/core";
import {
  TuiAccordion,
  TuiAvatar,
  TuiBadge,
  TuiBlock,
  TuiButtonLoading,
  TuiCheckbox,
  TuiChevron,
  TuiDataListWrapper,
  TuiElasticContainer,
  TuiFiles,
  TuiSelect,
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
    KeyValuePipe,
    NgTemplateOutlet,
    ScrollingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,

    TuiIcon,
    TuiHint,
    TuiBlock,
    TuiTitle,
    TuiFiles,
    TuiBadge,
    TuiButton,
    TuiAvatar,
    TuiLoader,
    TuiCheckbox,
    TuiScrollbar,
    TuiAccordion,
    TuiCardMedium,
    TuiAppearance,
    TuiButtonLoading,
    TuiDataListWrapper,
    TuiElasticContainer,
    TuiTextfield,
    TuiChevron,
    TuiSelect,
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
