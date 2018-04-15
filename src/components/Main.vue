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
          <Button class="list-button" :text="chapter.name + '-' + chapter.title" @tap="onChapterTap(chapter)" />
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
</style>


<script>
import * as webViewModule from "tns-core-modules/ui/web-view";
import webViewInterfaceModule from "nativescript-webview-interface";
import appSettings from "tns-core-modules/application-settings";
import chapters from "../scripts/chapters";

export default {
  data() {
    /**/
    return {
      mode: "home",
      src: "~/www/afh1.html",
      isInitialized: false,
      searchTerm: "",
      searchResults: []
    };
  },
  filters: {
    shorten(text) {}
  },
  computed: {
    chapters() {
      return chapters;
    },
    routes() {
      return [
        { name: "Chapters", mode: "chapters" },
        { name: "Continue Reading", mode: "reader" },
        { name: "Search", mode: "search" }
      ];
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
    shorten(text) {
      return text.length > 140 ? text.substr(0, 140) + "..." : text;
    },
    onChapterTap(chapter) {
      this.updateHash(chapter.id);
      this.mode = "reader";
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
      if (android) {
        android.getSettings().setAllowFileAccess(true);
        android.getSettings().setAllowFileAccessFromFileURLs(true);
        android.getSettings().setDisplayZoomControls(false);
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
