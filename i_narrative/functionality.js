const words = ["veleno", "latte", "succo di frutta", "vino", "caffè"];
const typingSpeed = 20; // Speed in milliseconds
var textContent;
const htmlContent_1 = 'La ragazza si avvicinò al tavolo prese il <span id="word-container">' + words[0] + '</span> e lo bevve.';
const htmlContent_2 = 'Toporagno prese il <span id="word-container">veleno</span> e lo bevve.';

document.addEventListener("DOMContentLoaded", function() {			;
	typeText(stripHTML(htmlContent_1), htmlContent_1, typingSpeed);
});

window.addEventListener('resize', function() {
    var element = document.getElementById('options');
	if (element) {
		const wordContainer = document.getElementById("word-container");
		positionDropdown(element, wordContainer);
	}
});

function positionDropdown(element, wordContainer) {
	element.style.left = wordContainer.offsetLeft + 'px';  /* Align the left position */
	element.style.top = wordContainer.offsetTop + wordContainer.offsetHeight + 'px';  /* Position below the interactive word */	
}

function stripHTML(htmlContent) {
	return htmlContent.replace(/<[^>]*>/g, '');
}

function typeText(text, html, speed) {
	const container = document.getElementById("text-placeholder");
	let i = 0;
	(function type() {
		if (i < text.length) {
			container.innerHTML += text.charAt(i);
			i++;
			setTimeout(type, speed);
		} else {
			container.innerHTML = html;
			addEventListeners();
		}
	})();
}

function addEventListeners() {
	const wordContainer = document.getElementById("word-container");
	
	wordContainer.addEventListener("click", function(event) {
		// Check if the dropdown has been already created, if not, create one
		if (!document.getElementById('options')) {
			createDropDown(wordContainer);
		}
	});
	
	// Add event listener to the document
	document.addEventListener('click', function(event) { 
		const ulElement = document.getElementById('options'); // Check if the click happened outside the <ul> element 
		if (ulElement && !ulElement.contains(event.target) && !wordContainer.contains(event.target)) { 
			ulElement.parentNode.removeChild(ulElement); 
		} 
	});	
}

function createDropDown(wordContainer) {
	
	var selectedWord = wordContainer.innerHTML;
	
	// Create a <ul> element
	const ul = document.createElement('ul');
	ul.className = 'options';
	ul.id = 'options';
	ul.style.display = 'block';
	positionDropdown(ul, wordContainer);

	// Iterate over the items array and create <li> elements
	words.forEach(item => {
		if (item != selectedWord) { // we make sure the word that is already printed doesn't appear in the list of choices
			const li = document.createElement('li');
			li.onclick = function() { selectWord(item, event); };			
			li.textContent = item;
			ul.appendChild(li);
		}
	});		

	// Append the <ul> element to the dropdown-list div
	document.getElementById('dropdown-list').appendChild(ul);
}

// Initial positioning
window.dispatchEvent(new Event('resize'));


function selectWord(word, event) {
	document.getElementById("word-container").textContent = word;
	// Remove the <ul> element
	const ulElement = document.getElementById('options'); 
	ulElement.parentNode.removeChild(ulElement);	
}