<template>
  <Page class="page" ref="page">
    <ActionBar :visibility="mode === 'home' ? 'collapsed' : 'visible'" class="action-bar" title="AFH-1">
      <WrapLayout>
        <Button :text="'fa-home' | fonticon" class="fa ab" @tap="mode='home'" />
        <Button :text="'fa-bars' | fonticon" class="fa ab" @tap="mode='chapters'" />
      </WrapLayout>
    </ActionBar>
  <StackLayout>  

    

      <!-- home -->


        <Image v-show="mode==='home'"  src="~/images/af_logo.png" />
        <Label v-show="mode==='home'"  id="handbook-1-title" text="Handbook 1 (2017)" />
        <ListView  v-show="mode==='home'" for="route in routes" style="height:100%" >
          <v-template>
            <Button class="list-button" :text="route.name" @tap="mode=route.mode"/>
          </v-template>
        </ListView>

      <!--search --> 
    
      <TextField v-show="mode==='search'" v-model="searchTerm" />
      <ListView v-show="mode==='search'" for="result in searchResults">
        <v-template>
          <Button class="list-button" :text="result.shortResult | shorten" @tap="onSearchResultTap(result)" />
        </v-template>
      </ListView>
      
   
      <!--chapters -->
      <ListView for="chapter in chapters" v-show="mode==='chapters'">
        <v-template>
          <Button class="list-button" :text="chapter.name" @tap="onChapterTap(chapter)" />
        </v-template>
      </ListView>

      

      <!--reader
        the reader stays loaded to preserve state and load with app
      -->
      <WebView id="webView" ref="webView" src="" @loadFinished="onWebViewLoad" />
   </StackLayout>


  </Page>
</template>
<style>

Image{
  width:80%;
  margin:auto;
}

.list-button{
 
  border-color:#00529B;
  color:#00529B;
  margin-left:4px;
  margin-right:4px;
  border-radius:10px;
}
ScrollView, ListView, WebView{
  height:100%;
}

#handbook-1-title{
  font-size:18em;
  text-align:center;
  color:#00529B;
}
.ab{
  background-color:#00529B;
  color:white;
}
</style>


<script>

import * as webViewModule from "tns-core-modules/ui/web-view";
import webViewInterfaceModule from "nativescript-webview-interface";
import appSettings from "tns-core-modules/application-settings";


export default {
  data() {
    /**/
    return {
      mode:'home',
      src:'~/www/afh1.html',
      isInitialized: false,
      searchTerm:'',
      searchResults:[]
    };
  },
  filters:{
    shorten(text){
      
    }
  },
  computed:{
    chapters(){
      return [{name:'Chapter 1', id:'chapter-1'},{name:'Chapter 2', id:'chapter-2'},{name:'Chapter 3', id:'chapter-3'},{name:'Chapter 4', id:'chapter-4'},{name:'Chapter 5', id:'chapter-5'},{name:'Chapter 6', id:'chapter-6'},{name:'Chapter 7', id:'chapter-7'},{name:'Chapter 8', id:'chapter-8'},{name:'Chapter 9', id:'chapter-9'},{name:'Chapter 10', id:'chapter-10'},{name:'Chapter 11', id:'chapter-11'},{name:'Chapter 12', id:'chapter-12'},{name:'Chapter 13', id:'chapter-13'},{name:'Chapter 14', id:'chapter-14'},{name:'Chapter 15', id:'chapter-15'},{name:'Chapter 16', id:'chapter-16'},{name:'Chapter 17', id:'chapter-17'},{name:'Chapter 18', id:'chapter-18'},{name:'Chapter 19', id:'chapter-19'},{name:'Chapter 20', id:'chapter-20'},{name:'Chapter 21', id:'chapter-21'},{name:'Chapter 22', id:'chapter-22'},{name:'Chapter 23', id:'chapter-23'},{name:'Chapter 24', id:'chapter-24'},{name:'Chapter 25', id:'chapter-25'}];
    },
    routes(){
      return [
        {name:'Chapters', mode:'chapters'},
        {name:'Continue Reading', mode:'reader'},
        {name:'Search', mode:'search'}
      ]
    }
  },
  watch:{
    searchTerm(val){
      if(this.oWebViewInterface){
        this.oWebViewInterface.emit('twSearch', val);
        
      }

    }
  },

  methods: {
    shorten(text){
      return text.length > 140 ?
             text.substr(0, 140) + '...' :
             text;
    },
    onChapterTap(chapter){
      this.updateHash(chapter.id);
      this.mode = 'reader';
    },
    onSearch(results){
      this.$set(this, 'searchResults', results);
    },

    updateHash(hash){
      if(this.oWebViewInterface){
        this.oWebViewInterface.emit('twUpdateHash',hash);
      } else {
        this.src = '~/www/afh1.html#' + hash;
      } 
    },

    onWebViewLoad() {
      const nativeView = this.$refs.webView.nativeView;
      const android = nativeView.android;

      if (!nativeView.android && !nativeView.ios) {
        setTimeout(this.onWebViewLoad, 100);
        return;
      }
      if (android) {
        android.getSettings().setAllowFileAccess(true);
        android.getSettings().setAllowFileAccessFromFileURLs(true);
        android.getSettings().setDisplayZoomControls(false);
     
      }
      
        this.oWebViewInterface = new webViewInterfaceModule.WebViewInterface(
          nativeView,
          this.src
        );
        this.oWebViewInterface.on('tnCreateBookmark', this.onCreateBookmark);
        this.oWebViewInterface.on('tnSearch', this.onSearch)
        this.oWebViewInterface.on('tnDebug', function(text){ alert(text); });
    }
    
  }
};
</script>
