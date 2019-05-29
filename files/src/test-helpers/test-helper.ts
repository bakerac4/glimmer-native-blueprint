import '../../../tests';

import { setApp, start } from '@glimmer/test-helpers';

import App from '../../main';

QUnit.config.autostart = false;
setApp(App);
start();
