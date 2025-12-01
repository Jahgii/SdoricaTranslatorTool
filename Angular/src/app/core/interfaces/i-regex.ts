interface IRegexFlag {
    selected: boolean,
    value: string;
    name: string;
    descKey: string;
}

export function flags(): IRegexFlag[] {
    return [
        {
            selected: false,
            value: "g",
            name: "Global",
            descKey: "regex-flag-g"
        },
        {
            selected: false,
            value: "i",
            name: "Insensitive",
            descKey: "regex-flag-i"
        },
        {
            selected: false,
            value: "m",
            name: "Multiline",
            descKey: "regex-flag-m"
        },
        {
            selected: false,
            value: "s",
            name: "DotAll",
            descKey: "regex-flag-s"
        },
        {
            selected: false,
            value: "u",
            name: "Unicode",
            descKey: "regex-flag-u"
        },
        {
            selected: false,
            value: "v",
            name: "unicodeSets",
            descKey: "regex-flag-v"
        },
    ];
}