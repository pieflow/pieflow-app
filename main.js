// Modules to control application life and create native browser window
const { app, BrowserWindow, session } = require('electron');
if (require('electron-squirrel-startup')) return;
require('update-electron-app')();
const path = require('path')
const AutoLaunch = require('auto-launch');
const { version } = require('./package');
const appVersionTitle = `PieFlow Desktop App`;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let tray;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1300,
        height: 800,
        minWidth: 1300,
        minHeight: 800,
        frame: false,
        titleBarStyle: 'hidden',
        icon: path.join(__dirname, 'assets/beat.ico'),
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true,
            partition: 'persist:default'
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    mainWindow.on('close', function (event) {
        if (app.isQuiting)
            return;

        event.preventDefault();
        mainWindow.minimize();
        return false;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    var cookies = session.fromPartition('persist:default').cookies;
    cookies.on('changed', function (event, cookie, cause, removed) {
        if (cookie.session && !removed) {
            var url = `${(!cookie.httpOnly && cookie.secure) ? 'https' : 'http'}://${cookie.domain}${cookie.path}`;
            cookies.set({
                url: url,
                name: cookie.name,
                value: cookie.value,
                domain: cookie.domain,
                path: cookie.path,
                secure: cookie.secure,
                httpOnly: cookie.httpOnly,
                expirationDate: Math.floor(new Date().getTime() / 1000) + 1209600
            }, function (err) {
                if (err) {
                    log.error('Error trying to persist cookie', err, cookie);
                }
            });
        }
    });
    createWindow();
    const minecraftAutoLauncher = new AutoLaunch({ name: 'PieFlow' });

    (async () => {
        const { Menu, Tray } = require('electron');
        let startOnSystemStartupEnabled = await minecraftAutoLauncher.isEnabled();

        tray = new Tray(path.join(__dirname, 'assets/logo.png'));

        tray.addListener('click', () => {
            mainWindow.show();
        })

        const contextMenu = Menu.buildFromTemplate([
            { label: appVersionTitle, sublabel: `v${version}`, type: 'normal', enabled: false },
            {
                label: 'Open on startup', type: 'checkbox', checked: startOnSystemStartupEnabled, async click() {
                    let startupMenuItem = contextMenu.items[1];

                    startupMenuItem.enabled = false;
                    startupMenuItem.label = 'what';
                    try {
                        await minecraftAutoLauncher[startupMenuItem.checked ? 'enable' : 'disable']();
                    } catch (e) {
                        console.error(e);
                    } finally {
                        startupMenuItem.checked = await minecraftAutoLauncher.isEnabled();
                        startupMenuItem.enabled = true;
                        tray.setContextMenu(contextMenu);
                    }
                }
            },
            { type: 'separator' },
            {
                label: 'Quit', type: 'normal', click() {
                    app.isQuiting = true;
                    app.quit();
                }
            }
        ]);

        tray.setToolTip(appVersionTitle);
        tray.setContextMenu(contextMenu);
    })();
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
