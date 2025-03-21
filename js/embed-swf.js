function setRuffle(bodyId) {
	
	let swfName;
	let swfWidth;
	let swfHeight
	let gameTitle;
	
	switch (bodyId) {
	case "g_4444":
		gameTitle = "4444";
		swfName = "4444.swf";
		swfWidth = "360px";
		swfHeight = "480px";
	break;
	case "acid_factory":
		gameTitle = "ACID FACTORY";
		swfName = "acidfactory.swf";
		swfWidth = "782px";
		swfHeight = "501px";
	break;
	case "alphattack":
		gameTitle = "ALPHATTACK";
		swfName = "alphattack.swf";
		swfWidth = "400px";
		swfHeight = "460px";
	break;
	case "gold_yard":
		gameTitle = "GOLD YARD";
		swfName = "gold-yard.swf";
		swfWidth = "550px";
		swfHeight = "410px";
	break;
	case "pharaohs_tomb":
		gameTitle = "PHARAOH'S TOMB";
		swfName = "the_pharaohs_tomb_nohiscore.swf";
		swfWidth = "550px";
		swfHeight = "410px";
	break;
	case "piranhas":
		gameTitle = "PIRANHAS";
		swfName = "piranhas.swf";
		swfWidth = "600px";
		swfHeight = "500px";
	break;
	case "candy_and_clyde":
		gameTitle = "CANDY &amp; CLYDE";
		swfName = "candy_and_clyde.swf";
		swfWidth = "550px";
		swfHeight = "400px";
	}	
	
	document.getElementById("gameTitle").innerHTML = gameTitle;
	document.getElementById("pageTitle").innerHTML = gameTitle + " - Flash Game";
	embedSWF(swfName, swfWidth, swfHeight);
}

function embedSWF(swfName, swfWidth, swfHeight) {
	window.RufflePlayer = window.RufflePlayer || {};
	window.RufflePlayer.config = {
		"autoplay": "on",
		"contextMenu": "off",
		"splashScreen": false,
		"unmuteOverlay": "hidden"
	}
	
	window.addEventListener("load", (event) => {
		const ruffle = window.RufflePlayer.newest();
		const player = ruffle.createPlayer();
		const container = document.getElementById("container");
		container.appendChild(player);
		player.className = "swf-container"
		player.load(swfName);
		player.style.width = swfWidth;
		player.style.height = swfHeight;
	});
}

function openFullscreen() {
	document.querySelector("ruffle-embed, ruffle-object, ruffle-player").enterFullscreen();			
}

function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /*loop through a collection of all HTML elements:*/
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      /*make an HTTP request using the attribute value as the file name:*/
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {elmnt.innerHTML = this.responseText;}
          if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
          /*remove the attribute, and call this function once more:*/
          elmnt.removeAttribute("w3-include-html");
          includeHTML();
        }
      }      
      xhttp.open("GET", file, true);
      xhttp.send();
      /*exit the function:*/
      return;
    }
  }
};