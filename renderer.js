const customTitlebar = require('custom-electron-titlebar');

const titlebar = new customTitlebar.Titlebar({
    icon: 'assets/logo.svg',
    backgroundColor: customTitlebar.Color.fromHex('#444')
});

titlebar.updateTitle('PieFlow');