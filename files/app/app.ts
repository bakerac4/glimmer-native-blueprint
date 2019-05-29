import { setPropertyDidChange } from '@glimmer/tracking';
import Application, { Resolver, ResolverDelegate } from 'glimmer-native';
import { knownFolders } from 'tns-core-modules/file-system';

const resolverDelegate = new ResolverDelegate();
const resolver = new Resolver();
let appFolder = knownFolders.currentApp();

const app = new Application('<%= component %>', resolverDelegate, resolver);
app.setup(appFolder);
// const containerElement = document.getElementById('app');

setPropertyDidChange(() => {
  app.scheduleRerender();
});

app.renderComponent('<%= component %>', app.rootFrame, null);

app.boot();
