<template>
  <Page class="page" ref="page" @loaded="onLoaded">
    <ActionBar style="background-color:#00529b;width:100%" title="">
      <!--using v-if instead of v-show creates error here-->
      <WrapLayout>
        <Button v-show="mode !=='home'" :text="'fa-home' | fonticon" class="fa ab" @tap="goto('home')" />
        <Button v-show="mode !=='toc' && mode !== 'home'" :text="'fa-bars' | fonticon" class="fa ab" @tap="goto('chapters')" />
        <Button v-show="mode ==='reader'" :text="'fa-bookmark' | fonticon" class="fa ab" @tap="createBookmark" />
      </WrapLayout>
    </ActionBar>
    <StackLayout>
       <ScrollView  v-show="mode==='home'" > 
          <!-- home -->
            <StackLayout >
              <Image   src="~/images/af_logo.png" />
              <Label  id="handbook-1-title" text="Handbook 1 (2017)" style="padding-bottom:" />
              
              <Button  v-for="route in routes" class="list-button" :text="route.name" @tap="goto(route.mode)"/>
            </StackLayout>
       </ScrollView>

    


      <!--search --> 
      <ScrollView v-show="mode==='search'">
        <StackLayout>
          <TextField  v-model="searchTerm" />
          <Button v-for="result in searchResults"  class="list-button" :text="shorten(result.shortResult)" @tap="onSearchResultTap(result)" />
        </StackLayout>
      </ScrollView>

      
   
      <!--chapters -->
      <ScrollView v-show="mode==='chapters'">
        <StackLayout>
          <Button v-for="chapter in chapters"  class="list-button" :text="chapter.name + '-' + chapter.title" @tap="onChapterTap(chapter)" />
        </StackLayout>
      </ScrollView>


      <!--Bookmarks -->


      <ScrollView v-show="mode==='bookmarks'">
        <StackLayout>
          <Button v-for="bookmark in bookmarks"  class="list-button" :text="bookmark.chapter" @tap="onBookmarkTap(bookmark)" @longpress="onBookmarkLongPress(bookmark)" />
        </StackLayout>
      </ScrollView>


      <!--reader
        the reader stays loaded to preserve state and load with app
      -->
      <WebView id="webView" ref="webView" src="" @loadFinished="onWebViewLoad" />

     
        
      <Fab v-show="selection.length > 0" icon="res://markerpen" class="fa ab fab-button" ></Fab>
   </StackLayout>
   
 
    
  </Page>
</template>
<style>

.fab-button {
    height: 70;
    width: 70; 
    margin: 15;
    background-color: #ff4081; 
    horizontal-align: right; 
    vertical-align: bottom; 
}

.sweet-button{
  position:absolute;
  right:10px;
  bottom:20px;
  height:10px;
  width:10px;
  z-index:4003;
}

Image {
  width: 80%;
  margin: auto;
}

.list-button {
  border-color: #00529b;
  border-width: 1px;
  width:90%;
  
  margin:auto;
  margin-top:10px;
  margin-bottom:10px;
  height:20%;
  min-height:100px;
  color: #00529b;
  padding-left:6px;
  padding-right:6px;
  border-radius: 30%;
}
ScrollView,
ListView,
WebView {
  height: 100%;
}



#handbook-1-title {
  font-size: 18em;
  text-align: center;
  color: #00529b;
}
.ab {
  background-color: #00529b;
  color: white;
}

.action-bar{
  background-color: #00529b;
}
</style>


<script>
import * as webViewModule from "tns-core-modules/ui/web-view";
import webViewInterfaceModule from "nativescript-webview-interface";
//import appSettings from "tns-core-modules/application-settings";
import * as application from "tns-core-modules/application";
import Toast from "nativescript-toast";
import {
  AndroidApplication,
  AndroidActivityBackPressedEventData
} from "tns-core-modules/application";
import chapters from "../scripts/chapters";

var appSettings = require("application-settings");

var bookmarks = appSettings.getString("bookmarks");
bookmarks = bookmarks ? JSON.parse(bookmarks) : [];


export default {
  data() {
    /**/
    return {
      mode: "home",
      src: "~/www/afh1.html",
      isInitialized: false,
      searchTerm: "",
      searchResults: [],
      navigatedRoutes: ["home"],
      isReadyToClose: false,
      bookmarks:bookmarks,
      selection:''
    };
  },

  computed: {
    chapters() {
      return chapters;
    },
    routes() {

      let routes = [
        { name: "Chapters", mode: "chapters" },
        { name: "Continue Reading", mode: "reader" },
        { name: "Search", mode: "search" }
        
      ];
      if(this.bookmarks.length > 0){
        routes.push( { name: "Bookmarks", mode: "bookmarks"});
      }
      return routes;
    }
  },
  watch: {
    searchTerm(val) {
      if (this.oWebViewInterface) {
        this.oWebViewInterface.emit("twSearch", val);
      }
    }
  },

  methods: {
    onLoaded(args){
     /*
      const platform = require("platform");
      const color = require("color");
      const page = args.object;
      page.bindingContext = data;
      const View = android.view.View;*/
      /*
      const app = require("application");
      if(app.android && platform.device.sdkVersion >= '21'){
        const window = app.android.startActivity;
      }*/
    },
    shorten(shortResult){
      const idx = shortResult.indexOf(this.searchTerm);
      if(idx === -1) return shortResult;
      const start = idx > 50 ? idx-50 : 0;
      const end = shortResult.length > idx + 50 ? idx + 50 : shortResult.length;
      return shortResult.substring(start, end);
    },
    goto(mode) {
      this.mode = mode;
      this.navigatedRoutes.push(mode);
      this.isReadyToClose = false;
    },
    goBack() {
      if (this.navigatedRoutes.length >= 2) {
        this.navigatedRoutes.splice(this.navigatedRoutes.length - 1, 1);
        this.mode = this.navigatedRoutes[this.navigatedRoutes.length - 1];
      }
    },

    createBookmark(){
      this.oWebViewInterface.emit('twCreateBookmark');
    },
    shorten(text) {
      return text.length > 140 ? text.substr(0, 140) + "..." : text;
    },
    onChapterTap(chapter) {
      this.updateHash(chapter.id);
      this.goto("reader");
    },
    onSearchResultTap(searchResult){
      this.updateHash(searchResult.id);
      this.goto("reader");
    },
    onBookmarkTap(bookmark) {
      this.updateHash(bookmark.id);
      this.goto("reader");
    },
    onBookmarkLongPress(bookmark){
      confirm("Would you like to delete this bookmark?").then((result)=>{
        if(result){
          for(var i = 0; i < this.bookmarks.length; i++){
            if(bookmark === this.bookmarks[i]){
              this.bookmarks.splice(i);
              appSettings.setString("bookmarks", JSON.stringify(this.bookmarks));
              Toast.makeText("Bookmark Deleted").show();
              if(this.bookmarks.length === 0){
                this.mode = 'home';
              }
            }
          }
        }
      });
    },
    onCreateBookmark(bookmark){
      this.bookmarks.push(bookmark);

      appSettings.setString("bookmarks", JSON.stringify(this.bookmarks));
      Toast.makeText("Bookmark Created").show();
    },
    onSearch(results) {
      this.$set(this, "searchResults", results);
    },

    updateHash(hash) {
      if (this.oWebViewInterface) {
        this.oWebViewInterface.emit("twUpdateHash", hash);
      } else {
        this.src = "~/www/afh1.html#" + hash;
      }
    },

    onWebViewLoad() {
      const nativeView = this.$refs.webView.nativeView;
      const android = nativeView.android;

      if (!nativeView.android && !nativeView.ios) {
        setTimeout(this.onWebViewLoad, 100);
        return;
      }

    

      if (this._handlersApplied === true) return;
      this._handlersApplied = true;
      if (android) {
        android.getSettings().setAllowFileAccess(true);
        android.getSettings().setAllowFileAccessFromFileURLs(true);
        android.getSettings().setDisplayZoomControls(false);

        application.android.on(
          AndroidApplication.activityBackPressedEvent,
          data => {
            if (this.navigatedRoutes.length >= 2) {
              data.cancel = true;
              this.goBack();
            } else {
              //let it exit
            }
          }
        );

        /*
        const activity = application.android.startActivity;
        const win = activity.getWindow();
        win.addFlags(android.viewWindowManager.LayoutParams.FLAG_FULLSCREEN);*/
      }

      this.oWebViewInterface = new webViewInterfaceModule.WebViewInterface(
        nativeView,
        this.src
      );
      this.oWebViewInterface.on("tnCreateBookmark", this.onCreateBookmark);
      this.oWebViewInterface.on("tnSearch", this.onSearch);
      this.oWebViewInterface.on("tnSelectionchange", this.onSelectionchange);

      this.oWebViewInterface.on("tnDebug", function(text) {
        alert(text);
      });
    },
    onSelectionchange(val){
       this.selection=val;
    }

  }
};
</script>
