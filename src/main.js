import Vue from 'nativescript-vue';

import Main from './components/Main'

import './styles.scss';

import {TNSFontIcon, fonticon} from 'nativescript-fonticon';

TNSFontIcon.debug = true;
TNSFontIcon.paths = {
  'fa': './font-awesome.css'
};
TNSFontIcon.loadCss();

Vue.filter('fonticon', fonticon);

// Uncommment the following to see NativeScript-Vue output logs
//Vue.config.silent = false;

new Vue({

  render: h => h(Main),

}).$start();
