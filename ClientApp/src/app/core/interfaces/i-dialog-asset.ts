export const TriggerChange = Symbol("triggerChange$");

export interface IDialogAsset {
    Id: string;
    OriginalFilename: string;
    Filename: string;
    MainGroup: string;
    Group: string;
    Number: number;
    Language: string;
    Translated: boolean;
    Model: {
        $content: IDialog[]
    }
    ReferenceAavatarImage: {
        $content: string[]
    }
    ReferenceDialogAudio: {
        $content: string[]
    }
    _objectReferences: {
        $content: string[]
    }
    _serializedStateKeys: {
        $content: string[]
    }
    _serializedStateValues: {
        $content: string[]
    }
}

export interface IDialogAssetExport {
    Id?: string;
    OriginalFilename?: string;
    Filename?: string;
    MainGroup?: string;
    Group?: string;
    Number?: number;
    Language?: string;
    Translated?: boolean;
    Model: {
        $content: IDialog[]
    }
    ReferenceAavatarImage: {
        $content: string[]
    }
    ReferenceDialogAudio: {
        $content: string[]
    }
    _objectReferences: {
        $content: string[]
    }
    _serializedStateKeys: {
        $content: string[]
    }
    _serializedStateValues: {
        $content: string[]
    }
}

export interface PlainDialogAsset {
    ID: string;
    Text: string;
}

export interface IDialog {
    ID: string;
    OriginalSpeakerName: string;
    SpeakerName: string;
    SpeakerAssetName: string;
    OriginalIconName: string;
    IconName: string;
    IconLocate: number;
    OriginalText: string;
    Text: string;
    sfxName: string;
    sfxVolume: number;
}

/**
 * props only available on 
 * ui context
 */
export interface IDialog {
    [TriggerChange]: any;
}