const path = require ('path');
const {format} = require('url');
const {app, BrowserWindow} = require('electron');

let win;

function CreateWindow () {
    win = new BrowserWindow({
        width: 2000,
        height: 2000,
        icon: "./van.jpg",
    });

    win.loadURL(format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true,
    }));

    win.on('closed', () => win = null);
}

app.on('ready', CreateWindow);

app.on('window-all-closed', () => app.quit());


