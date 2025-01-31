const { app, screen, BrowserWindow } = require('electron');
const Store = require('electron-store');
const url = require('url');
const path = require('path');

const store = new Store();
let mainWindow;
let windowConfig = {
    title: 'STT',
    width: 1280,
    height: 680,
    icon: '/dist/assets/images/app-icon.svg',
    minWidth: 1280,
    minHeight: 680,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        devTools: false,
    }
};

function getWindowsBounds() {
    const winBounds = store.get('winBounds');
    if (winBounds !== undefined) {
        const screenArea = screen.getDisplayMatching(winBounds).workArea;
        const widthCheck = (winBounds.x > screenArea.x + screenArea.width || winBounds.x < screenArea.x);
        const heightCheck = (winBounds.y < screenArea.y || winBounds.y > screenArea.y + screenArea.height);
        Object.assign(windowConfig, winBounds);

        if (widthCheck || heightCheck) {
            windowConfig.x = 0;
            windowConfig.y = 0;
        }
    }
}

function createWindow() {
    getWindowsBounds();
    mainWindow = new BrowserWindow(windowConfig);

    if (windowConfig.isMaximized) mainWindow.maximize();

    mainWindow.setMenu(null);
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `/dist/index.html`),
            protocol: "file:",
            slashes: true
        })
    );

    mainWindow.webContents.on('did-fail-load', () => {
        mainWindow.loadURL(
            url.format({
                pathname: path.join(__dirname, `/dist/index.html`),
                protocol: "file:",
                slashes: true
            })
        );
    });

    mainWindow.on('close', () => {
        Object.assign(windowConfig, {
            isMaximized: mainWindow.isMaximized()
        }, mainWindow.getNormalBounds())
        store.set("winBounds", windowConfig);
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});