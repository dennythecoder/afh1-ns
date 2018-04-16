var obWebviewInterface = window.nsWebViewInterface;

obWebviewInterface.on("twUpdateHash", function(hash) {

  if(hash.indexOf('bm') !== -1){
    var selector = hash.split('bm-')[1];
    debug(selector);
    var el = document.querySelector(selector);
    var id = 'bm-' + new Date().getTime();
    el.id = id;
    window.location.hash = '#' + id;
  }else{
    window.location.hash = "#" + hash;
  }

  
  
  
});

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

var paragraphs,
  markInstance,
  bodyText;
document.addEventListener("DOMContentLoaded", function() {
  bodyText = document.body.innerText;
  markInstance = new Mark(document.body);
});

obWebviewInterface.on("twSearch", function(searchTerm) {

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
  markInstance.mark(searchTerm);
  


  var els = document.querySelectorAll('mark');
  for(var i= 0; i < els.length; i++){
    els[i].id = 'sr-' + i; 
    searchResults.push({
      id:els[i].id,
      shortResult: els[i].parentElement.textContent
    })
  }

  obWebviewInterface.emit("tnSearch", JSON.stringify(searchResults));
});

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
	document.querySelectorAll('h2').forEach(a=>a.className = 'chapter')
	var chapters = document.getElementsByClassName('chapter');
	if(chapters.length === 0) return document.createElement("div");
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
		selector: unique(el)
	})
}

obWebviewInterface.on('twCreateBookmark', createBookmark);