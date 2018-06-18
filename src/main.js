import Vue from 'nativescript-vue';

import Main from './components/Main'

import './styles.scss';
import * as application from "tns-core-modules/application";


Vue.registerElement('Fab', ()=> require('nativescript-floatingactionbutton').Fab)

// Uncommment the following to see NativeScript-Vue output logs
//Vue.config.silent = false;


Vue.prototype.$os = {};
if(application.android){
  Vue.prototype.$os.android = android;
}
if(application.ios){
  Vue.prototype.$os.ios = ios;
}

if(application.android){
  const CustomWebView = android.webkit.WebView.extend({

  })

}


new Vue({

  render: h => h(Main),

}).$start();
