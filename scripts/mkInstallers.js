const electronInstaller = require('electron-winstaller');
const packageFile = require('../package');
const { version, description } = packageFile;
const appDirectory = 'pieflow-win32-x64';
const { execSync } = require('child_process');
const packager = require('electron-packager');
const del = require('del');
const copyright = `Copyright © ${new Date().getFullYear()} Pobuca`;

(async () => {
    try {
        await del([
            'PieFlow*',
            'pieflow*',
            'RELEASES',
            'Setup*'
        ]);

        await packager({
            overwrite: true,
            dir: '.',
            name: 'PieFlow',
            appVersion: version,
            appCopyright: copyright,
            icon: 'assets/beat.ico'
        });

        await electronInstaller.createWindowsInstaller({
            appDirectory,
            outputDirectory: '.',
            authors: 'Pobuca Ltd.',
            description,
            version,
            noMsi: true,
            copyright,
            setupExe: `PieFlow-setup-${version}.exe`,
            loadingGif: 'assets/loading.gif',
            setupMsi: `PieFlow-setup-${version}.msi`,
            setupIcon: 'assets/beat.ico',
            // certificatePassword: '123qwe!@#ASD',
            // certificateFile: 'cert.pfx',
            exe: `PieFlow.exe`
        });
    } catch (e) {
        console.log(e.message);
    }
})();