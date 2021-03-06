initKeyboardRefreshMathJax();

// Refresh MathJax
function refreshMathJax() {
	console.log('rMJ called');
	MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
};

// Load JSON file, not used
function loadJSON(sourcefile, callback) {
	$.getJSON(sourcefile, function(data) {
		callback(data);
	});
};

// loadMD loads the .md file.
// It takes two parameters, the first one gives the directory of the .md files to load, the second parameter is the id of the element where the converted HTML will be added into.
// For example, here the file name is the 
// TITLE of this HTML, and the id of the element is "target-column".
// 
// now sourcefile can be a list of files, like
// ["file1.md", "file2.md"]
function loadMD(sourcefile, targetid) {
	if (typeof sourcefile == "string") {
		jQuery.get(sourcefile, function(data) {
			var html = converter.makeHtml(data);
			document.getElementById(targetid).innerHTML = html;
			refreshMathJax();
			highLight();
		});
	} else {
		loadMDs(sourcefile, targetid);
	}
};

// load multiple MD files to one target
function loadMDs(sourcefiles, targetid, tmpdata) {
	if (!tmpdata) {
		var tmpdata = "";
	}
	jQuery.get(sourcefiles[0], function(data) {
		tmpdata = tmpdata + data + "\n";
		if (sourcefiles.length > 1) {
			loadMDs(sourcefiles.slice(1, sourcefiles.length), targetid, tmpdata);
		} else {
			var html = converter.makeHtml(tmpdata)
			document.getElementById(targetid).innerHTML = html;
			refreshMathJax();
			highLight();
		}
	});
}

// load Graphviz code and generate image
// image generated will be put in element with targetid
// if option == true, generate png file
function loadViz(source, targetid, option) {
	jQuery.get(source, function(data){
		if (option) {
			// generate image and append
			var image = Viz(data, { format: "png-image-element" });
			document.getElementById(targetid).appendChild(image);			
		} else {
			// generate and pick out svg element, and append	
			var res = Viz(data);
			var svg = $(res);
			svg = svg[svg.length-1];
			document.getElementById(targetid).appendChild(svg);			
		}
	});
}


function highLight() {
	$(document).ready(function() {
		$('pre code').each(function(i, block) {
			hljs.highlightBlock(block);
		});
	});
}


function refreshMathInViz() {
	var mathJaxSVGElems = document.getElementsByClassName('MathJax_SVG');
	for (var i = mathJaxSVGElems.length - 1; i >= 0; i--) {
		var elem = mathJaxSVGElems[i];
		if (elem.parentNode.tagName.toUpperCase() == "TEXT") {
			var txtElem = elem.parentNode;
			var svgElem = elem.firstChild;
			// alter the position of the MathJax SVG (upper left corner)
			svgElem.setAttribute('x',txtElem.getAttribute('x'));
			svgElem.setAttribute('y',txtElem.getAttribute('y'));
			// replace the original text with the SVG element
			txtElem.parentNode.replaceChild(svgElem, txtElem);
			// move the center of the SVG element to the expected position
			svgElem.setAttribute('x', parseFloat(svgElem.getAttribute('x')) - svgElem.getBoundingClientRect().width/2)
			svgElem.setAttribute('y', parseFloat(svgElem.getAttribute('y')) - svgElem.getBoundingClientRect().height/2)
		}
	}
}

function loadMDByTitle(targetid) {
	var source = document.title + ".md";
	loadMD(source, targetid);
}

// Functions below are for refreshing MathJax by clicking any
// key.
// Modified from http://unixpapa.com/js/testkey.html
// Wentao, 2016/11/12
function initKeyboardRefreshMathJax() {
	if (document.addEventListener) {
		document.addEventListener("keydown", keydown, false);
		document.addEventListener("keypress", keypress, false);
		document.addEventListener("keyup", keyup, false);
		document.addEventListener("textInput", textinput, false);
	} else if (document.attachEvent) {
		document.attachEvent("onkeydown", keydown);
		document.attachEvent("onkeypress", keypress);
		document.attachEvent("onkeyup", keyup);
		document.attachEvent("ontextInput", textinput);
	} else {
		document.onkeydown = keydown;
		document.onkeypress = keypress;
		document.onkeyup = keyup;
		document.ontextinput = textinput; // probably doesn't work
	}
}

function suppressdefault(e, flag) {
	if (flag) {
		if (e.preventDefault) e.preventDefault();
		if (e.stopPropagation) e.stopPropagation();
	}
	return !flag;
}

function keydown(e) {
	// console.log('keydown called');
	if (!e) e = event;
	// keymesg('keydown ',e);
	
	// if (e.key == "a") {
	// 	loadAll();
	// } else if (e.key == "n") {
	// 	loadJSON("courses.json", loadCoursesCallBack);
	// } else if (e.key == "t") {
	// 	loadJSON("todos.json", loadTODOCallBack);
	// }

	// console.log(e.key)
	
	switch (e.key){
		case "r":
			loadAll();
			break;
		// reload col 1, i.e., TODO
		// Define the loadCol1() function in HTML file
		case "1":
			loadCol1();
			break;
		// reload col 2
		// Define the loadCol2() function in HTML file
		case "2":
			loadCol2();
			break;
		// display TODO todo
		case "t":
			selectStatusClicked({"innerHTML":"todo"});
			break;
		// display TODO done
		case "d":
			selectStatusClicked({"innerHTML":"done"});
			break;
		// display TODO undone
		case "u":
			selectStatusClicked({"innerHTML":"undone"});
			break;
		// display TODO all
		case "a":
			selectStatusClicked({"innerHTML":"All status"});
			break;
		// hide TODO
		case "Shift":
			hideTODO();
			break;
		// syntax highlight
		case "h":
			highLight();
			break;
		case "m":
			refreshMathInViz();
			break;
		default:
			break;
	}

	// refreshMathJax();
	// tmpevent = e;
	// return suppressdefault(e,document.body.keydown.checked);
	return suppressdefault(e, false);
}

function keyup(e) {
	if (!e) e = event;
	// keymesg('keyup   ',e);
	// refreshMathJax();
	// return suppressdefault(e,document.body.keyup.checked);
	return suppressdefault(e, false);
}

function keypress(e) {
	if (!e) e = event;
	// keymesg('keypress',e);
	// refreshMathJax();
	// return suppressdefault(e,document.body.keypress.checked);
	return suppressdefault(e, false);
}

function textinput(e) {
	if (!e) e = event;
	//showmesg('textInput  data=' + e.data);
	// showmesg('textInput data='+e.data);
	// refreshMathJax();
	// return suppressdefault(e,document.body.textinput.checked);
	return suppressdefault(e, false);
}


/////////////////////////////////////////////////////
// Functions below are currently not used
// for webpages on the ftp server.
// I use them for my personal log including
// some functionality for TODOs
// Wentao, 2016/11
function hideTODO(obj) {
	if (!obj) {
		obj = document.getElementById("btn-hideTODO");
	}
	if (document.getElementById("target-todo").style.display == "") {
		document.getElementById("target-todo").style.display = "none";
		document.getElementById("left-col").className = "col-lg-1";
		document.getElementById("right-col").className = "col-lg-11";
		obj.innerHTML = "Show TODO";
	} else {
		document.getElementById("left-col").className = "col-lg-4";
		document.getElementById("target-todo").style.display = "";
		document.getElementById("right-col").className = "col-lg-8";
		obj.innerHTML = "Hide TODO";
	}
}

function loadTODOCallBack(data) {
	document.todos = data;
	displayToDos(todoDisplayConfig);
	generateSelectDateButtGroup();
	generateSelectTagButtGroup();
};

function loadMDButtCallBack(obj) {
	var sourcefile = document.title + "-" + obj.id + ".md";
	var targetid = "target-" + obj.id;
	// loadMD(sourcefile, targetid);
	loadXML("courses.xml", "autumn2016", targetid);
};

function generateSelectDateButtGroup() {
	// week = document.title;
	var html = [];
	html[0] = "<li><a onclick=\"selectDateClicked(this)\">All dates</a></li>\n";
	html[1] = "<li class=\"divider\"></li>\n";
	for (week in todosLoaded) {
		for (date in todosLoaded[week]) {
			len = html.length;
			html[len] = "<li><a onclick=\"selectDateClicked(this)\">" + date + "</a></li>\n";
		}
	}
	document.getElementById("btn-group-date").innerHTML = html.join("");
};

function generateSelectTagButtGroup() {
	// week = document.title;
	var html = [];
	var allTags = [];
	html[0] = "<li><a onclick=\"selectTagClicked(this)\">All tags</a></li>\n";
	html[1] = "<li class=\"divider\"></li>\n";
	for (week in todosLoaded) {
		for (date in todosLoaded[week]) {
			for (i = todosLoaded[week][date].length - 1; i >= 0; i--) {
				isTagExist = false;
				for (j = allTags.length - 1; j >= 0; j--) {
					if (allTags[j] === todosLoaded[week][date][i].tag) {
						isTagExist = true;
						break;
					}
				}
				if (!isTagExist) {
					allTags[allTags.length] = todosLoaded[week][date][i].tag;
				}
			}
		}
	}
	for (i = allTags.length - 1; i >= 0; i--) {
		html[html.length] = "<li><a onclick=\"selectTagClicked(this)\">" + allTags[i] + "</a></li>\n";
	}
	document.getElementById("btn-group-tag").innerHTML = html.join("");
}

function generateMD_Item(item, selectStatus, selectTag) {
	var prefix = "";
	var suffix = "";
	if (item.status === "done") {
		prefix = "- [x] ";
		suffix = "";
	} else if (item.status === "undone") {
		prefix = "- [ ] ~~";
		suffix = "~~";
	} else {
		prefix = "- [ ]";
		suffix = "";
	}
	if (!selectStatus) {
		if (!selectTag) {
			return prefix + item.content + suffix;
		}
		if (item.tag === selectTag) {
			return prefix + item.content + suffix;
		} else {
			return "";
		}
	}
	if (item.status === selectStatus) {
		if (!selectTag) {
			return prefix + item.content + suffix;
		}
		if (item.tag === selectTag) {
			return prefix + item.content + suffix;
		} else {
			return "";
		}
	} else {
		return "";
	}
};

function generateMD_Date(selectedDate, dateName, selectStatus, selectTag) {
	// mdString = "### " + dateName + "\n";
	var mdString = "";
	len = selectedDate.length;
	for (i = 0; i < len; i++) {
		if (generateMD_Item(selectedDate[i], selectStatus, selectTag).length == 0) {
			continue;
		}
		mdString = mdString + generateMD_Item(selectedDate[i], selectStatus, selectTag) + "\n";
	}
	// console.log(mdString);
	if (mdString.length > 0) {
		mdString = "### " + dateName + "\n" + mdString;
	}
	return mdString;
};

function generateMD_Week(selectedWeek, selectDate, selectStatus, selectTag) {
	var mdString = "";
	if (!selectDate) {
		// mdString = "## TODO" + "\n";
		for (date in selectedWeek) {
			mdString = mdString + generateMD_Date(selectedWeek[date], date, selectStatus, selectTag) + "\n";
		}
	} else {
		// mdString = "## TODO" + "\n";
		for (date in selectedWeek) {
			try {
				if (date == selectDate) {
					mdString = mdString + generateMD_Date(selectedWeek[date], date, selectStatus, selectTag) + "\n";
				}
			} catch (e) {}
		}
	}
	return mdString
};

function generateMD_TODO(TODOs, selectDate, selectStatus, selectTag) {
	var mdString = "## TODO" + "\n";
	// mdString = "";
	for (week in TODOs) {
		// console.log(TODOs[week]);
		mdString = mdString + generateMD_Week(TODOs[week], selectDate, selectStatus, selectTag) + "\n";
	}
	return mdString;
}

function displayToDos(config) {
	todosLoaded = document.todos;
	// week = document.title;
	// html = converter.makeHtml(generateMD_Week(todosLoaded[week], config[0], config[1], config[2]));
	html = converter.makeHtml(generateMD_TODO(todosLoaded, config[0], config[1], config[2]));
	document.getElementById('target-todo').innerHTML = html;
	refreshMathJax();
};

function selectDateClicked(obj) {
	var date = obj.innerHTML;
	document.getElementById('btn-date').innerHTML = date;
	if (date.match("All")) {
		todoDisplayConfig[0] = 0;
		displayToDos(todoDisplayConfig);
	} else {
		todoDisplayConfig[0] = date;
		displayToDos(todoDisplayConfig);
	}
};

function selectStatusClicked(obj) {
	var status = obj.innerHTML;
	document.getElementById('btn-status').innerHTML = status;
	if (status.match("All")) {
		todoDisplayConfig[1] = 0;
		displayToDos(todoDisplayConfig);
	} else {
		todoDisplayConfig[1] = status;
		displayToDos(todoDisplayConfig);
	}
};

function selectTagClicked(obj) {
	var tag = obj.innerHTML;
	document.getElementById('btn-tag').innerHTML = tag;
	if (tag.match("All")) {
		todoDisplayConfig[2] = 0;
		displayToDos(todoDisplayConfig);
	} else {
		todoDisplayConfig[2] = tag;
		displayToDos(todoDisplayConfig);
	}
};

function saveClicked(obj) {
	var saveOption = obj.innerHTML;
	if (saveOption.match("json")) {
		blob = new Blob([JSON.stringify(todosLoaded, null, 2)], { type: "text/plain;charset=utf-8" });
		saveAs(blob, "todos.json");
	} else {
		blob = new Blob(["var todosLoaded = ", JSON.stringify(todosLoaded, null, 2), ";"], { type: "text/plain;charset=utf-8" });
		saveAs(blob, "todos.js");
	}
};


function openXML(path) {
	if (window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
	} else {
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.open("GET", path, false);
	xmlhttp.send();
	xmlDoc = xmlhttp.responseXML;
	return xmlDoc;
}


function selectSemester(xml, semester) {
	return xml.evaluate("/courses/" + semester, xml, null, XPathResult.ANY_TYPE, null).iterateNext();
}

function loadXML(source, semester, targetid) {
	var xml = openXML(source);
	var sem = selectSemester(xml, semester);
	// html = converter.makeHtml(generateMD_AllCourses(sem));
	// document.getElementById(targetid).innerHTML = html;
	loadAllCourses(sem, targetid);
}


function loadAllCourses(selectedSemester, targetid) {
	var selectedCourse = selectedSemester.firstElementChild;
	var sourcefiles = [];
	while (selectedCourse) {
		sourcefiles[sourcefiles.length] = loadCourse(selectedCourse);
		selectedCourse = selectedCourse.nextElementSibling;
	}
	loadMD(sourcefiles, targetid);
}


function loadCourse(selectedCourse) {
	var sourcefile = "";
	var selectedElement = selectedCourse.firstElementChild;
	while (selectedElement.nodeName != "notes") {
		selectedElement = selectedElement.nextElementSibling;
	}
	return selectedElement.firstChild.nodeValue;
}


function loadCoursesCallBack(allCourses) {
	var sourcefiles = [];
	var info = "";
	var courseTable = [
		["Time", "", "", "", "", "", "", ""],
		["8:00", "", "", "", "", "", "", ""],
		["9:50", "", "", "", "", "", "", ""],
		["13:30", "", "", "", "", "", "", ""],
		["15:20", "", "", "", "", "", "", ""],
		["17:05", "", "", "", "", "", "", ""],
		["19:20", "", "", "", "", "", "", ""]
	];
	for (var semester in allCourses) {
		for (var course in allCourses[semester]) {
			sourcefiles[sourcefiles.length] = allCourses[semester][course].notes;
			info = "[" + course + "](" + allCourses[semester][course].FolderPath + ")<br>" + allCourses[semester][course].location;
			var times = allCourses[semester][course].time;
			for (var k = 0; k < times.length; k++) {
				var i = times[k].date;
				var j = times[k].section;
				if (i > 7) continue;
				if (j > 6) continue;
				courseTable[j][i] = info;
			}
		}
	}
	// console.log(courseTable);
	var html = converter.makeHtml(generateMD_CourseTable(courseTable));
	document.getElementById("target-c2-r1").innerHTML = html;
	loadMD(sourcefiles, "target-c2-r2")
}

function generateMD_CourseTable(courseTable) {
	var mdString = "## Time Table\n|Time|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday| \n |:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|\n";
	for (var i = 1; i < courseTable.length; i++) {
		for (var j = 0; j < courseTable[i].length; j++) {
			mdString = mdString + "|" + courseTable[i][j];
		}
		mdString = mdString + "|\n";
	}

	return mdString;
}



// These bullshit below are for loading course info from 
// xml and are not used
// 
function generateMD_AllCourses(selectedSemester) {
	var mdString = "";
	selectedCourse = selectedSemester.firstElementChild;
	while (selectedCourse) {
		mdString = mdString + generateMD_Course(selectedCourse) + "\n";
		selectedCourse = selectedCourse.nextElementSibling;
	}
	return mdString;
}



function generateMD_Course(selectedCourse) {
	var mdString = "";
	name = selectedCourse.getElementsByTagName("name")[0].firstChild.nodeValue;
	if (selectedCourse.getElementsByTagName("FolderPath").length > 0) {
		path = selectedCourse.getElementsByTagName("FolderPath")[0].firstChild.nodeValue;
		mdString = mdString + "## " + "[" + name + "](" + path + ")" + "\n"
	} else {
		mdString = mdString + "## " + name + "\n";
	}
	selectedElement = selectedCourse.firstElementChild;
	while (selectedElement.nodeName != "notes") {
		selectedElement = selectedElement.nextElementSibling;
	}
	mdString = mdString + generateMD_Course_Week(selectedElement);
	return mdString;
}


function generateMD_Course_Week(notes) {
	var mdString = "";
	if (notes.firstElementChild) {
		week = notes.firstElementChild;
		while (week) {
			mdString = mdString + "### " + week.nodeName + "\n" + week.firstChild.nodeValue + "\n";
			week = week.nextElementSibling;
		}
	} else {
		mdString = notes.firstChild.nodeValue;
	}
	return mdString;
}

