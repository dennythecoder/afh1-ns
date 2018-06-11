var obWebviewInterface = window.nsWebViewInterface;

obWebviewInterface.on("twUpdateHash", function(hash) {
  var el = document.getElementById(hash);
  var top = el.offsetTop;
  window.scroll(0,top);  
});

var nodes = [];
var textContents = []

document.addEventListener('DOMContentLoaded',function(){
  var childNodes = document.getElementById('DIV-0').childNodes;
  for(var i = 0; i < childNodes.length; i++){
    var textContent = childNodes[i].textContent;
    var temp = textContent.replace(/\s|\n|\r\n/ig,'');
    if(temp.length > 0){
      nodes.push(childNodes[i]);
      textContents.push(textContent);
    }
  }
  textContents = textContents
    .map(function(f){ return f.replace(/[\n]/ig,' ')})
    .map(function(f){ return f.toLowerCase()});
});

function searchNodesForText(searchText){
  var text = searchText.toLowerCase();
  var results = [];

  for(var i = 0; i < textContents.length; i++){
    var tIdx = textContents[i].indexOf(text);
    if(tIdx !== -1){
      var result = new HighlightMeta(nodes[i], nodes[i],  text,  text.length,tIdx, textContents[i]);
      results.push(result);
    }
  }
  return results;
}


document.addEventListener('selectionchange', onSelectionChange);

function onSelectionChange(){
  var sel = window.getSelection();
  var str = sel.toString();
  obWebviewInterface.emit('tnSelectionchange',str);
}






function strip(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
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
var bodyText,chapters;

document.addEventListener("DOMContentLoaded", function() {
  bodyText = document.body.textContent,
  chapters = document.querySelectorAll("[id^='chapter']");
});

function markTerm(searchTerm) {

  
  var markInstance = new Mark(document.body);
    
 
  removeSearch();
  var searchResults = [];


  if (searchTerm.length < 4) {
    return;
  }
  var regex =  new RegExp(searchTerm);
  regex.ignoreCase = true;
  regex.global = true;
  if((bodyText.match(regex) || []).length > 100){
    return [
     { shortResult:'Too many matches.  Try a more specific search.' }
    ]
  }  


  markInstance.unmark();
  markInstance.mark(searchTerm,{


    done:function(){

      var els = document.getElementsByTagName('mark');
      for(var i= 0; i < els.length; i++){
        els[i].id = 'sr-' + i; 
        searchResults.push({
          id:els[i].id,
          shortResult: els[i].parentElement.textContent
        })
      }
    
      obWebviewInterface.emit("tnSearch", searchResults);


    }


  });
  



};
obWebviewInterface.on("twSearch", markTerm);

function debug(text){
  obWebviewInterface.emit('tnDebug', text);
}


/**
 * 
 * @param {HTMLElement} el 
 */
function unique(el){
  var els = document.querySelectorAll(el.tagName);
  for(var i = 0; i < els.length; i++){
    if(els[i] === el){
      return el.tagName + ':nth-child(' + i + ')';
    }
  }
}



/**
 * @returns {HTMLElement}
 */
function getVisibleElement(){
	var center = document.body.clientWidth / 2;
	for(var top = 100; top < 500; top+=10){
	
		var el = document.elementFromPoint(center, top);
		if(el && !(el instanceof HTMLHtmlElement) && el !== document.body && el.tagName.toLowerCase() !== 'div'){
			return el;
		}
	}
	return document.body;
}
function getChapterOfElement(el){
	// document.querySelectorAll('h2').forEach(a=>a.className = 'chapter')

	if(chapters && chapters.length === 0) return document.createElement("div");
	for(let i = 0; chapters.length - 1; i++){
	
		if(chapters[i].offsetTop > el.offsetTop && i > 0){
			return chapters[i-1];
		}
	}
	return chapters[chapters.length-1];
}

function createBookmark(){
	var mm = (new Date()).getTime(),
		hash = '#bib-bm' + mm,
		scrollY = window.scrollY,
		percentage = scrollY / document.body.offsetHeight;

	var el = getVisibleElement();
	var chapter = getChapterOfElement(el);
	obWebviewInterface.emit('tnCreateBookmark', {
		hash,
		scrollY,
		percentage,
		chapter: chapter.textContent.trim(),
    selector: el.id,
    id:el.id
	})
}

obWebviewInterface.on('twCreateBookmark', createBookmark);