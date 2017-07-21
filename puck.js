/*  - 
	- Student No: A00026160
	- Name: David Klassen
	- Work:	Assignment2 
	- Course: COMP 2011
	- File: puck.js
	- Editor: Geany
	-
	*/
//var debug = true;
var debug = false;
var isXmlCached = false;
var cachedXML4Hints;



/*
 * 	1st Goal is to complete the assignment
 * 	2nd Goal is to display team graphic by division
 */
$(document).ready(function() {

	// Set hint methods to iterate over xml checking for matches pre-user-click.
	document.getElementById('cities').onkeyup=function(){ getHints("city", document.getElementById('cities').value); };
	document.getElementById('teams').onkeyup=function(){ getHints("team", document.getElementById('teams').value ); };
		
	// Set each button call back to call our AJAX search routine 
	// with search type and value to search on.
	document.getElementById('city').onclick=function(){ queryHockeyTeams("city", document.getElementById('cities').value ); };
	document.getElementById('team').onclick=function(){ searchHockeyTeams("team", document.getElementById('teams').value ); };
});


	
/*
 * 
 * Find an exact match against our query string given our XML data.
 * 
 */
function searchByChildType(type, query, data) {
	var found;
	
	for (var i = 0; i < data.length; i++) {
		var childNode = data[i].childNodes;

		//if (debug) alert(data[i].firstChild.nodeType + " name: " + data[i].firstChild.nodeName + " innerds: " + data[i].firstChild.nodeValue + " Nodes: " + childNode.length);		
		
		// Search each team
		for (var x = 0; x < childNode.length; x++) {
			
			// Search each type
			if (type == childNode[x].nodeName) {
				var trimmedEntry = jQuery.trim( childNode[x].firstChild.nodeValue );
				//if (debug) alert("type: " + query + " name: " + trimmedEntry);
				
				// Check for an exact match against the XML value.
				if (trimmedEntry.length == query.length) {
					var regex = new RegExp(trimmedEntry, "i")
					
					// If type query matches mark found true	
					if (true == regex.test(query) ) {
					
						found = data[i];
						if (debug) alert("found: " + trimmedEntry);
						break;
					}
				}
			}			
		}
	}
	
	return(found);
}

/*
 * Add a graphic to the content to make it look appealing. 
 */
function createGraphic(foundNode) {
	var division = foundNode.getElementsByTagName("division");
	var name = foundNode.getElementsByTagName("name");
	
	// Set the image source to use (Use trim to be accurate).
	var imgsrc = "images/" + jQuery.trim(division[0].firstChild.nodeValue) 
			   + "/" + jQuery.trim(name[0].firstChild.nodeValue) + ".png";
			   
	// Create the image object.	
	var img = document.createElement("img");
	img.setAttribute("src", imgsrc);

	return(img);
}

// 5. Display City of TeamX
function displayTeamCity(query, foundNode) {

	// Find and reset the paragraph to change.
	var pTeam = document.getElementById("city_content");
	pTeam.innerHTML = "";
		
	if (foundNode == null) {
		
		// Code to offer not found functionality.
		wrongImg = document.createElement("img");
		wrongImg.setAttribute("src", "images/wrong.png");
		document.body.appendChild(wrongImg);
		
		setTimeout(function() {
				document.body.removeChild(wrongImg);
			}, 5000);
			
		alert("The team named '" + query + "' is not a member of the NHL");								
	} else {

		// Create image element and append it.		
		pTeam.appendChild( createGraphic(foundNode) );
		
		// Append team city name.
		var node = foundNode.getElementsByTagName("city");		
		if (debug) alert("Displaying team city for: " + query + " " + node[0].firstChild.nodeValue);		
		var text = document.createTextNode(node[0].firstChild.nodeValue);
		pTeam.appendChild(text);
	}
}

// 3. Display Team Name.
function displayTeamName(query, foundNode) {
	
	// Find and reset the paragraph to change.
	var pTeam = document.getElementById("team_content");
	pTeam.innerHTML = "";
		
	if (foundNode == null) {
		
		// Code to offer not found functionality.
		document.body.setAttribute("style", "background-color: red;");
		
		setTimeout(function() {
				document.body.setAttribute("style", "background-color: none;");
			}, 2000);
		
		alert("The city '" + query + "' does not have an NHL team");
	} else {
		
		// Create image element(via. found team name) and append it.
		pTeam.appendChild( createGraphic(foundNode) );

		// Append team name.
		var node = foundNode.getElementsByTagName("name");
		if (debug) alert("Displaying team name for: " + query + " "  + node[0].firstChild.nodeValue);		
		var text = document.createTextNode(node[0].firstChild.nodeValue);
		pTeam.appendChild(text);
	}
}

// 2. to process the HTTP request XML result and send to correct display engine.
function searchTeams(req, type, query) {
	
	// If the request state had data to process.
	if (req.readyState == 4) {
		
		// If the request status is 'OK'
		if (req.status == 200) {
			var xmlTree = req.responseXML;
			var data = xmlTree.getElementsByTagName("team");
			var foundNode = false;

			if (type == "team") {

				// search on Team 'name' type.
				type = "name";
				
				// Find the node searched for and display it
				foundNode = searchByChildType(type, query, data);
				displayTeamCity(query, foundNode);
			} else if (type == "city") {
				
				// Find the node searched for and display it
				foundNode = searchByChildType(type, query, data);
				displayTeamName(query, foundNode);
			} else {
				
				// Display error status.
				alert("Unexpected query: " + query);
			}			
		} else {
			
			// Display error status.
			alert("Error Status Code: " + req.status);
		}
	}
}

function getXmlHttpRequestObject() {
	var req = new XMLHttpRequest();

	if (typeof(XMLHttpRequest) == "undefined") 	{ 
		alert("XMLHttpRequest not supported");

		XMLHttpRequest = function() { 
			try { 
				return new ActiveXObject("Msxml2.XMLHTTP.6.0"); 
			} catch(e) {} try { 
				return new ActiveXObject("Msxml2.XMLHTTP.3.0"); 
			} catch(e) {} try { 
				return new ActiveXObject("Msxml2.XMLHTTP"); 
			} catch(e) {} try { 
				return new ActiveXObject("Microsoft.XMLHTTP"); 
			} catch(e) {} 
			alert("get a new browser");
			window.location="hockey.html";

			throw new Error("This browser does not support XMLHttpRequest."); 
		}; 
	} 
	
	return(req);
}

// 1. to handle the GET AJAX call.
function queryHockeyTeams(type, query) {
	var url = "hockeyteams.xml?time=" + new Date().getTime();
	var req = getXmlHttpRequestObject();

	// Erase all hints
	eraseAll(type);
	
	// Delete extra spaces entered by user.
	query = jQuery.trim( query );
	if (debug) alert("Looking for: " + query + " of type: "  + type);	
	
	// Open the request
	req.open("GET", url, true);

	// Set the request processing function
	req.onreadystatechange=function() { searchTeams(req, type, query) };

	// Send the Request
	req.send(null);
}

// 4. to handle the POST AJAX call.
function searchHockeyTeams(type, query) {
	var postParams = "time=" + new Date().getTime();
	var url = "hockeyteams.xml";
	var req = getXmlHttpRequestObject();

	// Erase all hints
	eraseAll(type);

	// Delete extra spaces entered by user.
	query = jQuery.trim( query );
	if (debug) alert("Looking for: " + query + " of type: "  + type);
		
	// Open the request
	req.open("POST", url, true);

	// Set the request processing function
	req.onreadystatechange=function() { searchTeams(req, type, query) };

	// Set the HTTP Request header to specify form data will be sent.
	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	
	// Send the Request
	req.send(postParams);
}


/* 
 * for fun...  process some user entry Hints
 */
function hintByChildType(type, query, data) {
	var found = new Array();
	var j = 0;
	
	for (var i = 0; i < data.length; i++) {
		var childNode = data[i].childNodes;
		
		// Search each team
		for (var x = 0; x < childNode.length; x++) {
			
			// Search each type
			if (type == childNode[x].nodeName) {
				
				// If type query matches mark found true
				var trimmedEntry = jQuery.trim( childNode[x].firstChild.nodeValue );
				var regex = new RegExp(query, "i")
					
				// If type query matches mark found true	
				if (true == regex.test(trimmedEntry) ) {
				
				//if (-1 != trimmedEntry.indexOf(query)) {				
					
					// Insert find in array and increment find counter.
					found[j] = trimmedEntry;
					j++;
					//if (debug) alert("found: " + childNode[x].firstChild.nodeValue);
				}
			}			
		}	
	}
	
	return(found);
}

function displayHints(query, matchingEntries, divHints) {
	
	if (0 < matchingEntries.length) {
		if (debug) alert("Hinting for: " + query + " resulted in: " + matchingEntries);

		divHints.innerHTML = "";
		
		for (var i = 0; i < matchingEntries.length; i++) {
			var h = document.createTextNode(matchingEntries[i] );
			divHints.appendChild(h);
			var br = document.createElement("br");
			divHints.appendChild(br);
		}		
	} else {
		eraseAll();
	}
}

function eraseAll(type) {
	var divHints;
	
	divHints = document.getElementById("city_hints");
	divHints.innerHTML = "";

	divHints = document.getElementById("team_hints");
	divHints.innerHTML = "";
}

function hintOnEntry(xmltree, type, query) { 
	var data = xmltree.getElementsByTagName("team");

	if (type == "team") {

		// search on Team 'name' type.
		type = "name";
				
		// Find the node searched for and display it
		var matchingEntries = hintByChildType(type, query, data);
		displayHints(query, matchingEntries, document.getElementById("city_hints"));
	} else if (type == "city") {
				
		// Find the node searched for and display it
		var matchingEntries = hintByChildType(type, query, data);
		displayHints(query, matchingEntries, document.getElementById("team_hints"));
	} 			
	// Don't do anything on error.
}
 
function processHintOnEntry(req, type, query) {
	
	// If the request state had data to process.
	if (req.readyState == 4) {
		
		// If the request status is 'OK'
		if (req.status == 200) {
			
			// cache the XML locally to prevent multiple network calls.
			isXmlCached = true;
			cachedXML4Hints = req.responseXML;
			
			hintOnEntry(cachedXML4Hints, type, query);
		} 
		// Don't do anything on error.
	}
}

function getHints(type, query) {
	
	// Delete extra spaces entered by user.
	query = jQuery.trim( query );
	if (debug) alert("Hinting for: " + query + " of type: "  + type);
	
	if ("" == query) {
		eraseAll(type);
		return;
	}
	
	if (! isXmlCached) {
		var url = "hockeyteams.xml?time=" + new Date().getTime();
		var req = getXmlHttpRequestObject();

		//if (debug) alert("Hinting for: " + query + " of type: "  + type);

		// Open the request
		req.open("GET", url, true);

		// Set the request processing function
		req.onreadystatechange=function() { processHintOnEntry(req, type, query) };

		// Send the Request
		req.send(null);
	} else {
		
		hintOnEntry(cachedXML4Hints, type, query)
	}
}
