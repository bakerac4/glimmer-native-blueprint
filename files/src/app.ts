import { setPropertyDidChange } from '@glimmer/tracking';
import Application from 'glimmer-native';
import { knownFolders } from 'tns-core-modules/file-system';

// @ts-ignore
// @ts-ignore
// import * as imageCache from 'nativescript-web-image-cache';
// @ts-ignore
let appFolder = knownFolders.currentApp();
const components = [];
const addComponents = () => {
    let componentsFile = appFolder.getFile('components.json');
    let componentsText = componentsFile.readTextSync();
    JSON.parse(componentsText).forEach((component) => {
        const classFile = require(`../src/ui/components/${component.name}/component.ts`);
        components.push({
            name: component.name,
            class: classFile.default
        });
    });
};
const helpers = [];
const addHelpers = () => {
    let helperFile = appFolder.getFile('helpers.json');
    let text = helperFile.readTextSync();
    JSON.parse(text).forEach((helper) => {
        const classFile = require(`../src/ui/components/${helper.name}/helper.ts`);
        helpers.push({
            name: helper.name,
            class: classFile.default
        });
    });
};

addComponents();
addHelpers();
const app = new Application(appFolder, components, helpers);

setPropertyDidChange(() => {
    app.scheduleRerender();
});

app.boot('<%= component %>');
