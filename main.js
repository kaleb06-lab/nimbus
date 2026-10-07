const { app, BrowserWindow } = require('electron');
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 820, title: 'Nimbus',
    webPreferences: { nodeIntegration: true, contextIsolation: false, webviewTag: true }
  });
  win.setMenuBarVisibility(false);
  win.loadFile('index.html');
}
app.on('web-contents-created', (e, wc) => {
  if (wc.getType() === 'webview') {
    wc.setWindowOpenHandler(({ url }) => {
      win.webContents.send('open-tab', url);
      return { action: 'deny' };
    });
  }
});
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
