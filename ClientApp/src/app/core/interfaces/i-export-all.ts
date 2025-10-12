import { ICommonWord } from "./i-common-word"
import { IDialogAsset } from "./i-dialog-asset"
import { IGamedataValue } from "./i-gamedata"
import { ILocalizationKey } from "./i-localizations"

export interface IExportAll {
    L: string;
    GV: IGamedataValue[]
    DA: IDialogAsset[]
    K: ILocalizationKey[]
    C: ICommonWord[]
} 