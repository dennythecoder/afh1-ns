
import webViewInterfaceModule from "nativescript-webview-interface";

import * as application from "tns-core-modules/application";
import Toast from "nativescript-toast";
import {
  AndroidApplication
} from "tns-core-modules/application";


var appSettings = require("application-settings");



export default { 

      onChapterTap(chapter) {
        this.updateHash(chapter.id);
        this.goto("reader");
      },
      onHighlightTap(){
        this.oWebViewInterface.emit("twCreateHighlight");
      },
      onSearchResultTap(searchResult){
        this.currentSearchResult = searchResult.id;
        this.updateHash(searchResult.id);
        this.goto("reader");
        this.$nextTick(()=>{
          this.displayText = this.currentSearchResultPosition + ' of ' + this.searchResults.length;
        }
        
        );
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
      onCreateHighlight(loc){
        this.highlights.push(loc);
        appSettings.setString("highlights", JSON.stringify(this.highlights));
        Toast.makeText("Highlight Created").show();
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
   
        /*
        android.setOnLongClickListener(
            new this.$os.android.view.View.OnLongClickListener({
                onLongClick(v){
                    return true;
                }    


            })
        
        );
        */
  
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
        this.oWebViewInterface.on("tnCreateHighlight", this.onCreateHighlight);
        this.oWebViewInterface.on("tnDebug", function(text) {
          alert(text);
        });
      },
      onSelectionchange(val){
         this.selection=val;
      },
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
       }

    
}