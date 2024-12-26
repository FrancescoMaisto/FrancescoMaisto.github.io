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