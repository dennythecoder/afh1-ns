import Vue from 'nativescript-vue';

import Main from './components/Main'

import './styles.scss';



Vue.registerElement('Fab', ()=> require('nativescript-floatingactionbutton').Fab)

// Uncommment the following to see NativeScript-Vue output logs
//Vue.config.silent = false;

console.warn('my android', android);

new Vue({

  render: h => h(Main),

}).$start();
