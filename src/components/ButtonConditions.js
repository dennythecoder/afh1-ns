export default { 
    isHomeButtonVisible(){
        return this.mode !== 'home'  && !this.isShowingResults;
    },
    isChaptersButtonVisible(){
        return this.mode !== 'home' && this.mode !== 'chapters' && !this.isShowingResults;
        
    },
    isBookmarkButtonVisible(){
        return this.mode === 'reader' && this.searchTerm.length === 0;
    },
    isClearSearchButtonVisible(){
        return this.isShowingResults;
    },
    isNextSearchResultButtonVisible(){
        return this.isShowingResults;
    },
    isPreviousSearchResultButtonVisible(){
        return this.isShowingResults;
    },

    hasSearchResults(){
        return this.searchResults.length > 0;
    },
    hasSearchTerm(){
        return this.searchTerm.length > 0;
    },

    isShowingResults(){
        return this.hasSearchResults && this.mode === 'reader';
    }


}