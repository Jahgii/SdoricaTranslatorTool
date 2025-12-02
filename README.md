# Sdorica Translator Tool (STT)
Tool to modify the majority of in-game text, excluding text located outside the game files.

* 📋 Requirements
    1. This tool does not connect to the game server to download files; the game must already be installed on your device.

* ⚙️ Compatibility
    1. Primary support: Android version of the game.

* 🛡️ Antivirus Notice
    1. This tool is packed with UPX (Ultimate Packer for Executables). Some antivirus programs may flag UPX‑compressed files as suspicious. These alerts are false positives — the tool is safe to use.

* 📝 Notes
    1. The online mode is currently in stage of development and may contain bugs or incomplete features, I don't know when this will change, so stick with the offline version.

* 📚 Resources
    1. [Portraits](https://drive.google.com/drive/folders/13KR8LMZiwV_L17bAAhD803jFc9oFH7R_?usp=sharing) Not all portraits are included; some may be missing.
    2. [Spanish Translation](https://drive.google.com/file/d/1WSwvF0WNTiO3JrAaLdQNGQHHa2otJoBu/view?usp=sharing)
        1. UI: Menus, descriptions of objects, skills, characters, etc. → 20.19%
        2. Dialogs: Main, characters and events story. → 87.89%

## Development
Run Frontend with Wails
```sh
cd Wails && wails dev
```

Run Frontend
```sh
cd Angular && ng serve
```

Run Dotnet
```sh
cd Dotnet && dotnet run
```

Scan Icons (After Packages Download)
```sh
cd Angular && node scan-taiga-icons.js
```

## Build
Wails
```sh
cd Wails && make windows
```
