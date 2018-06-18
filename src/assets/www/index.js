var obWebviewInterface = window.nsWebViewInterface;

obWebviewInterface.on("twUpdateHash", function(hash) {
  var el = document.getElementById(hash);
  var top = el.offsetTop;
  window.scroll(0,top);  
});

var nodes = [];
var textContents = [];



 
obWebviewInterface.on("twCreateHighlight", function(val){
  if(!val){
    var loc = highlightCurrent();
    obWebviewInterface.emit("tnCreateHighlight", loc);
  }


});

function highlightCurrent() {
  let colour = 'yellow';
  
  let sel = window.getSelection();
    
  var location = getLocation();
  var guid = createGuid();
  document.designMode = "on";
  document.execCommand("HiliteColor", false, colour);
  if (colour !== "transparent") {
    document.execCommand(
      "createLink",
      false,
      `javascript:window.top.destroyHighlight("${guid}")`
    );
  } else {
    document.execCommand("unlink", false);
  }

  document.designMode = "off";
  var chapter = getChapterOfElement(sel.anchorNode.parentElement);
  location.endLocation = getLocation();
  location.guid = guid;
  location.chapter = chapter.textContent.trim();
  sel.removeAllRanges();
  return location;
}


function highlightLocations(locations) {
  let colour = 'yellow';
  
  let sel = window.getSelection();
  
  sel.removeAllRanges();
  sel.addRange(range);
  var location = getLocation();
  if (!guid) guid = createGuid();
  document.designMode = "on";
  document.execCommand("HiliteColor", false, colour);
  if (colour !== "transparent") {
    document.execCommand(
      "createLink",
      false,
      'javascript:window.top.destroyHighlight("' + guid + '")'
    );
  } else {
    document.execCommand("unlink", false);
  }
  
  document.designMode = "off";
  location.endLocation = getLocation();
  location.guid = guid;
  return location;
}

function createRange(start, end) {
  let startEl = findEl(start);
  let endEl = findEl(end);
  if (!startEl || !endEl) return;
  window.doc = document;
  let startNode = startEl.childNodes[start.index];
  let endNode = endEl.childNodes[end.index];
  let range = document.createRange();
  let startOffset = pickOffset(startNode, start);
  let endOffset = pickOffset(endNode, end);
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  return range;
}


function highlightRange(range, guid) {
  let colour = 'yellow';
  
  let sel = window.getSelection();
    
  sel.removeAllRanges();
  sel.addRange(range);
  var location = getLocation();
  if (!guid) guid = createGuid();
  document.designMode = "on";
  document.execCommand("HiliteColor", false, colour);
  if (colour !== "transparent") {
    document.execCommand(
      "createLink",
      false,
      `javascript:window.top.destroyHighlight("${guid}")`
    );
  } else {
    document.execCommand("unlink", false);
  }
  
  document.designMode = "off";
  location.endLocation = getLocation();
  location.guid = guid;
  return location;
}




function s4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
function createGuid() {
  return "guid-" + s4() + s4();
}

function pickOffset(node, location) {
  return node.length < location.offset ? node.length - 1 : location.offset;
}

function findEl(location) {
 /* var elements = document.querySelectorAll(location.tagName);
  for (var i = 0; i < elements.length; i++) {
    if (elements[i].outerHTML === location.outerHTML) {
      return elements[i];
    }
  }*/
  return document.getElementById(location.id);
}

function getNodeIndexInElement(element, node) {
  for (let i = 0; i < element.childNodes.length; i++) {
    if (element.childNodes[i] === node) {
      return i;
    }
  }
}

function getNodeLocation(node) {
  let parentElement = node.parentElement;
  let tagName = parentElement.tagName,
    className = parentElement.className,
    index = getNodeIndexInElement(parentElement, node),
    outerHTML = parentElement.outerHTML,
    id = parentElement.id;
  return { tagName:tagName, className:className, index:index, outerHTML:outerHTML, id:id };
}

function getLocation() {
  var sel = window.getSelection(),
    rng = sel.getRangeAt(0);
  var start = getNodeLocation(rng.startContainer);
  var end = getNodeLocation(rng.endContainer);

  start.offset = rng.startOffset;
  if (rng.startContainer === rng.endContainer) {
    end.offset = start.offset + rng.toString().length;
  } else {
    end.offset = rng.endOffset;
  }

  let textContent = rng.toString();
  return {
    start:start,
    end:end,
    textContent:textContent
  };
}



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
var markInstance;
document.addEventListener("DOMContentLoaded", function() {
  bodyText = document.body.textContent,
  chapters = document.querySelectorAll("[id^='chapter']");
  markInstance = new Mark(document.body);

  var lazyLoad = new lazyLoad();
});

function markTerm(searchTerm) {

  
   
    
 
  removeSearch();
  var searchResults = [];


  if (searchTerm.length < 4) {
    markInstance.unmark();
    obWebviewInterface.emit("tnSearch", []);
    return;
  }
  var regex =  new RegExp(searchTerm);
  regex.ignoreCase = true;
  regex.global = true;


  if(bodyText && (bodyText.match(regex) || []).length > 100){
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
	for(var i = 0; i < chapters.length - 1; i++){
	
		if(chapters[i] && el && chapters[i].offsetTop > el.offsetTop && i > 0){
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