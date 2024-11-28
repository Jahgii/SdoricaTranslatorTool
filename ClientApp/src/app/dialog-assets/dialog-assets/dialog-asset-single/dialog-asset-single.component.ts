import { Component, Inject, Input } from '@angular/core';
import { PortraitsService } from 'src/app/core/services/portraits.service';
import { DialogAssetService } from '../dialog-asset.service';
import { IDialog, IDialogAsset } from 'src/app/core/interfaces/i-dialog-asset';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, NgIf, NgStyle } from '@angular/common';
import { ElementBreakpointService } from 'src/app/core/services/element-breakpoint.service';

@Component({
  selector: 'app-dialog-asset-single',
  standalone: true,
  imports: [
    FormsModule,
    AsyncPipe,
    NgStyle,
    NgIf,
  ],
  templateUrl: './dialog-asset-single.component.html',
  styleUrl: './dialog-asset-single.component.scss',
})
export class DialogAssetSingleComponent {
  @Input() data!: IDialogAsset[];
  @Input() dialogAsset!: IDialogAsset;
  @Input() item!: IDialog;

  constructor(
    private readonly portraitsService: PortraitsService,
    @Inject(DialogAssetService) readonly dAS: DialogAssetService,
    @Inject(ElementBreakpointService) readonly breakpointService: ElementBreakpointService
  ) { }

  public onTextChange(dialogAsset: IDialogAsset) {
    this.dAS.onTextChange(dialogAsset);
  }

  public onSpeakerNameChange(name: string, data: IDialogAsset[]) {
    this.dAS.onSpeakerNameChange(name, data);
  }

  public onGetPortrait(name: string, ext: string = '.png') {
    return this.portraitsService.imageDir[name + ext];
  }
}
