const { app, BrowserWindow, Menu,ipcMain,dialog } = require('electron');
const fs=require('fs'); 




if (handleSquirrelEvent(app)) return;


function handleSquirrelEvent(application) {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {
                detached: true
            });
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            application.quit();
            return true;
    }
};







let mainWin;
app.on('ready', ()=>{
    mainWin= new BrowserWindow({
        webPreferences: {nodeIntegration: true , webContents:true, backgroundThrottling:true,nodeIntegrationInWorker: true },
        width:750,
        height:700,
        title:'Xml-App',
        frame:true,
        resizable:false
       
    })

    mainWin.loadFile('index.html');
    mainWin.on('closed',()=>{
        app.quit();
    })  

    menues=[
        {role:'toggleDevTools'},
        {role:'reload',label:'Restart App'}
    ]
    Menu.setApplicationMenu(Menu.buildFromTemplate(menues))

    ipcMain.on('odialog',()=>{
        dialog.showOpenDialog(mainWin,{
            filters:[{name:'xml-files',extensions:['xml']}]
        }).then(fileChosen=>{
           
            mainWin.webContents.send('ofile', fileChosen.filePaths[0]);
            
    })
    


    ipcMain.on('sdialog',(event,data)=>{
        dialog.showSaveDialog(mainWin,{})
        .then(result=>{
            fs.writeFile(result.filePath,data,(err)=>{})
        })
    })
})


})