import { IDialogAsset } from "../core/interfaces/i-dialog-asset";
import { IGroup, IMainGroup } from "../core/interfaces/i-dialog-group";

//#region Obb Logic
export function onReadFileDialogFromObb(
    dialogAssets: { [language: string]: IDialogAsset[] },
    dialogAssetsInclude: { [language: string]: boolean },
    dialogAssetsMainGroups: { [language: string]: { [mainGroup: string]: IMainGroup } },
    dialogAssetsGroups: { [language: string]: { [mainGroup: string]: { [group: string]: IGroup } } },
    fileContent: string,
    fileName: string
) {
    let dialogAsset: IDialogAsset | undefined;
    let fileNameSplit: string[] = fileName.replace("assets/DialogAssets/", "").split("_");

    dialogAsset = onSetDialogAsset(fileNameSplit, fileName.replace("assets/DialogAssets/", ""), fileContent);

    if (!dialogAsset) {
        return;
    }

    addDialogAsset(dialogAssets, dialogAssetsInclude, dialogAsset);
    addDialogAssetGroup(dialogAssetsMainGroups, dialogAssetsGroups, dialogAsset);
}

export function onSetDialogAsset(fileNameSplit: string[], fileName: string, fileContent: string) {
    let dialogAsset: IDialogAsset = JSON.parse(onFixDialogAssetJsonParse(fileContent));

    for (const dialog of dialogAsset.Model.$content) {
        dialog.OriginalText = dialog.Text;
        dialog.OriginalSpeakerName = dialog.SpeakerName;
        dialog.OriginalIconName = dialog.IconName;
    }

    if (fileNameSplit.length == 5) {
        dialogAsset.OriginalFilename = fileName;
        dialogAsset.Filename = fileName.split(".dialog")[0];
        dialogAsset.MainGroup = fileNameSplit[0];
        dialogAsset.Group = fileNameSplit[1];
        dialogAsset.Number = Number(fileNameSplit[2]);
        dialogAsset.Language = fileNameSplit[4].split(".")[0];
        dialogAsset.Translated = false;
    }
    else if (fileNameSplit.length == 6) {
        dialogAsset.OriginalFilename = fileName;
        dialogAsset.Filename = fileName.split(".dialog")[0];
        dialogAsset.MainGroup = fileNameSplit[0];
        dialogAsset.Group = fileNameSplit[1] + fileNameSplit[2];
        dialogAsset.Number = Number(fileNameSplit[3]);
        dialogAsset.Language = fileNameSplit[5].split(".")[0];
        dialogAsset.Translated = false;
    }
    else {
        console.warn("FILE WITH MORE THAN 6 length -> ", fileName);
        return;
    }

    return dialogAsset;
}

export function addDialogAsset(
    dialogAssets: { [language: string]: IDialogAsset[] },
    dialogAssetsInclude: { [language: string]: boolean },
    dialogAsset: IDialogAsset
) {
    if (dialogAssets[dialogAsset.Language] == null) {
        dialogAssets[dialogAsset.Language] = [];
        dialogAssetsInclude[dialogAsset.Language] = false;
    }

    if (dialogAsset.Number == null) return;

    dialogAssets[dialogAsset.Language].push(dialogAsset);
}

export function addDialogAssetGroup(
    dialogAssetsMainGroups: { [language: string]: { [mainGroup: string]: IMainGroup } },
    dialogAssetsGroups: { [language: string]: { [mainGroup: string]: { [group: string]: IGroup } } },
    dialogAsset: IDialogAsset
) {
    dialogAssetsMainGroups[dialogAsset.Language] ??= {};

    if (dialogAssetsMainGroups[dialogAsset.Language][dialogAsset.MainGroup] == null) {
        dialogAssetsMainGroups[dialogAsset.Language][dialogAsset.MainGroup] = {
            Language: dialogAsset.Language,
            OriginalName: dialogAsset.MainGroup,
            Name: dialogAsset.MainGroup,
            ImageLink: '',
            Files: 1,
            TranslatedFiles: 0,
            Order: 0
        }
    }
    else {
        dialogAssetsMainGroups[dialogAsset.Language][dialogAsset.MainGroup].Files += 1;
    }

    dialogAssetsGroups[dialogAsset.Language] ??= {};

    dialogAssetsGroups[dialogAsset.Language][dialogAsset.MainGroup] ??= {};


    if (dialogAssetsGroups[dialogAsset.Language][dialogAsset.MainGroup][dialogAsset.Group] == null) {
        dialogAssetsGroups[dialogAsset.Language][dialogAsset.MainGroup][dialogAsset.Group] = {
            Language: dialogAsset.Language,
            MainGroup: dialogAsset.MainGroup,
            OriginalName: dialogAsset.Group,
            Name: dialogAsset.Group,
            ImageLink: '',
            Files: 1,
            TranslatedFiles: 0,
            Order: 0
        }
    }
    else {
        dialogAssetsGroups[dialogAsset.Language][dialogAsset.MainGroup][dialogAsset.Group].Files += 1;
    }
}

export function onFixDialogAssetJsonParse(fileContent: string): string {
    return fileContent.replace(/"sfxVolume":[.]/g, `"sfxVolume":0.`);
}
//#endregion