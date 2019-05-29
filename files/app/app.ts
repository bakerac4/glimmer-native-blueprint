import { setPropertyDidChange } from '@glimmer/tracking';
import Application, { Resolver, ResolverDelegate } from 'glimmer-native';
import { knownFolders } from 'tns-core-modules/file-system';

const resolverDelegate = new ResolverDelegate();
const resolver = new Resolver();
let appFolder = knownFolders.currentApp();


const addTemplates = (appFolder) => {
  let templatesFile = appFolder.getFile('templates.json');
  let templates = templatesFile.readTextSync();
  // console.log(`Templates: ${templates}`);
  JSON.parse(templates).forEach((template) => {
    resolverDelegate.registerComponent(
      template.name,
      template.handle,
      template.source,
      template.capabilities
    );
  });
};

const addComponents = (appFolder) => {
  let componentsFile = appFolder.getFile('components.json');
  let components = componentsFile.readTextSync();
  console.log(`About to resolve require`);
  JSON.parse(components).forEach((component) => {
    console.log(`About to resolve require`);
    const classFile = require(`../src/ui/components/${component.name}/component.ts`);
    resolver.registerComponent(component.name, classFile.default);
  });
};

addTemplates(appFolder);
addComponents(appFolder);

const app = new Application('<%= component %>', resolverDelegate, resolver);
// app.setup(appFolder);
// const containerElement = document.getElementById('app');

setPropertyDidChange(() => {
  app.scheduleRerender();
});

app.renderComponent('<%= component %>', app.rootFrame, null);

app.boot();
