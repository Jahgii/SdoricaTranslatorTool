export interface IDialogAsset {
    DialogAssetId: string;
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

export interface IDialog {
    id: string;
    speakerName: string;
    speakerAssetName: string;
    iconName: string;
    iconLocate: number;
    text: string;
    sfxName: string;
    sfxVolume: number;
}