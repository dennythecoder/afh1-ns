<template>
  <Page class="page" ref="page" @loaded="onLoaded">
    <ActionBar :visibility="mode === 'home' ? 'collapsed' : 'visible'" style="background-color:#00529b;" title="AFH-1">
      <WrapLayout>
        <Button :text="'fa-home' | fonticon" class="fa ab" @tap="goto('home')" />
        <Button :text="'fa-bars' | fonticon" class="fa ab" @tap="goto('chapters')" />
        <Button :text="'fa-bookmark' | fonticon" class="fa ab" @tap="createBookmark" />
      </WrapLayout>
    </ActionBar>
  <StackLayout>  

    

      <!-- home -->


        <Image v-show="mode==='home'"  src="~/images/af_logo.png" />
        <Label v-show="mode==='home'"  id="handbook-1-title" text="Handbook 1 (2017)" style="padding-bottom:" />
        <ListView  v-show="mode==='home'" for="route in routes" style="height:100%;" >
          <v-template>
            <Button class="list-button" :text="route.name" @tap="goto(route.mode)"/>
          </v-template>
       </ListView>

      <!--search --> 
      <StackLayout v-show="mode==='search'">
        <TextField  v-model="searchTerm" />
        <ListView  for="result in searchResults" style="height:100%">
          <v-template>
            <Button class="list-button" :text="result.shortResult" @tap="onSearchResultTap(result)" />
          </v-template>
        </ListView>


      </StackLayout>

      
   
      <!--chapters -->
      <ListView for="chapter in chapters" v-show="mode==='chapters'">
        <v-template>
          <Button class="list-button" :text="chapter.name + '-' + chapter.title" @tap="onChapterTap(chapter)" />
        </v-template>
      </ListView>

      <!--Bookmarks -->
      <ListView for="bookmark in bookmarks" v-show="mode==='bookmarks'">
        <v-template>
          <Button class="list-button" :text="bookmark.chapter" @tap="onBookmarkTap(bookmark)" />
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
Image {
  width: 80%;
  margin: auto;
}

.list-button {
  border-color: #00529b;
  color: #00529b;
  margin-left: 4px;
  margin-right: 4px;
  border-radius: 10px;
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
      bookmarks:bookmarks
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
      /*  { name: "Search", mode: "search" },*/
        
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
    onBookmarkTap(bookmark) {
      this.updateHash(bookmark.id);
      this.goto("reader");
    },
    onCreateBookmark(bookmark){
      this.bookmarks.push(bookmark);
      
      appSettings.setString("bookmarks", JSON.stringify(this.bookmarks));
      Toast.makeText("Bookmark Created").show();
    },
    onSearch(results) {
      alert(results[0] ? results[0].shortResponse : 'nothing');
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
      this.oWebViewInterface.on("tnDebug", function(text) {
        alert(text);
      });
    }  

  }
};
</script>
