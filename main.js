const path = require('path')
const fs = require('fs')
const electron = require('electron')
const { app, BrowserWindow, ipcMain } = electron

let mainWindow

app.on('ready', () => {
    mainWindow = new BrowserWindow({width: 800, height: 600, show: false, minWidth: 600, minHeight: 400})
    mainWindow.loadURL(`http://www.infoclimat.fr/`)
    mainWindow.on('closed', () => mainWindow = null)
    const page = mainWindow.webContents
    page.on('dom-ready', () => {
        page.insertCSS(fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8'))
        page.executeJavaScript(`
            let ipcRenderer = require('electron').ipcRenderer,
                _c = document.getElementById('accueil-cartedynamique-container'),
                _n = [_c, ...(_c.getElementsByTagName('*')), ...(document.body.getElementsByTagName('script'))],
                _e = document.body.getElementsByTagName('*');
            do { _n.unshift(_n[0].parentNode) } while (_n[0].parentNode);
            let _reqs = Array.from(_e).map((_en) => {
                return new Promise((resolve) => {
                    if (!_n.includes(_en)) _en.remove();
                    resolve();
                });
            })
            Promise.all(_reqs).then(() => ipcRenderer.send('renderer-ready'));
        `)
    })
})
ipcMain.on('renderer-ready', () => mainWindow.show())
app.on('browser-window-created', (e, window) => window.setMenu(null))
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})
