var obWebviewInterface = window.nsWebViewInterface;

obWebviewInterface.on('twUpdateHash', function(hash){
    window.location.hash = '#' + hash;
});






function strip(html){
	const doc = new DOMParser().parseFromString(html, 'text/html');
	return doc.body.textContent || "";
 }




/**
 *
 * @param {string} text
 * @param {number} offset
 */
function createShortResult(text, offset) {
    let arbitraryLength = 60;
    var start = offset - arbitraryLength >= 0 ? offset - arbitraryLength : 0;
    var end =
      offset + arbitraryLength <= text.length
        ? offset + arbitraryLength
        : text.length;
  
    let result = text.substring(start, end);
  
    return strip(result);
  }
  
  function removeSearch() {
    let highlights = document.querySelectorAll("mark.bib-sr-mark");
    for (let i = 0; i < highlights.length; i++) {
      highlights[i].outerHTML = highlights[i].innerHTML;
    }
  }

  var paragraphs;
  document.addEventListener("DOMContentLoaded",function(){
      paragraphs = document.getElementsByTagName("p");
  })
  
  
  
  obWebviewInterface.on('twSearch', function(searchTerm)  {

        removeSearch();
        var searchResults = [];
        if (searchTerm.length < 4) {
          return;
        }
  
        var searchRegExp = new RegExp(searchTerm, "ig");
        var srIndex = 0;
  
        
        
        for(var i = 0; i < paragraphs.length; i++){
            paragraphs[i].innerHTML = paragraphs[i].innerHTML.replace(
                searchRegExp,
                function(result) {
                  if (result.indexOf(">") !== -1 || result.indexOf("<") !== -1) {
                    return result;
                  }
                  var offset = arguments[arguments.length - 2];
                  searchResults.push({
                    id: "sr-" + srIndex,
                    shortResult:paragraphs[i].innerText
                  });
                  return `<mark class="bib-sr-mark" id="bib-sr-${srIndex++}">${result}</mark>`;
                }
              );

            
        }

  
        obWebviewInterface.emit('tnSearch', JSON.stringify(searchResults));
       
    }
);