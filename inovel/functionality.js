const typingSpeed = 35; // Typing speed in milliseconds
const revealNextParagraph = false;
const jsonFile = "data.json"; // JSON file containing the story data

// We set language-specific words
let language = "ita"; // Default language
let text = [];
if (language == "ita") {
	text[0] = "CAPITOLO";
	text[1] = "Fine.";
} else if (language == "eng") {
	text[0] = "CHAPTER";
	text[1] = "The End.";
}

let storyData = {};
let chapterName;
let chapterTitle;
let chapterId;
let activeParagraphId;
let paragraphsArray = [];
let typingIntervalId;

document.addEventListener('DOMContentLoaded', () => {
	fetch('/stories/' + jsonFile)
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok ' + response.statusText);
			}
			return response.text(); // Get the response as text
		})
		.then(jsonString => {
			storyData = JSON.parse(jsonString); // Parse the JSON string
			init();
		})
		.catch(error => {
			console.error('There was a problem with the fetch operation:', error);
		});
});


function init() {
	addResizeListener();
    addClickPageListener();
	container = document.getElementById("text-placeholder");
	gameOverElement = document.getElementById("game-over");
	setChapterTitle(0);
	setParagraph(0, 0);
	typeText(0);
}

function addClickPageListener() {
	document.addEventListener("click", function (event) {

		// Remove options drop-down if user clicks anywhere on the page outside of it
		const dropDown = document.getElementById('options');
		console.log(`event.target.className: ${event.target.className}`);
		if (dropDown && !dropDown.contains(event.target)) {
			dropDown.remove();
		} 

		// Show full paragraph immediately when use clicks anywhere on the page
		clearInterval(typingIntervalId);
		let spanElement = document.getElementById("paragraph" + activeParagraphId);
		let keyword = storyData.story.chapters[chapterId].paragraphs[activeParagraphId].keyword;
		let paragraphText = storyData.story.chapters[chapterId].paragraphs[activeParagraphId].text_body;
		let paragraphHtml = highlightKeyword(activeParagraphId, paragraphText, keyword);
		let paragraphType = storyData.story.chapters[chapterId].paragraphs[activeParagraphId].type;
		displayFullParagraph(spanElement, paragraphHtml, keyword, activeParagraphId, paragraphType);
    });
}

function setChapterTitle(chapterNum) {
	chapterName = storyData.story.chapterName;
	chapterTitle = storyData.story.chapters[chapterNum].title;
	chapterId = storyData.story.chapters[chapterNum].id;
	document.getElementById("chapterTitle").innerHTML = "<b>" + chapterName + " " + (chapterId+1) + "</b> - " + chapterTitle;
}

function setParagraph(paragraphNum, choiceNum) {

	// We populate paragraphsArray with the current and next paragraph ids
	// let destinationId = storyData.story.chapters[chapterId].paragraphs[paragraphNum].choices[choiceNum].destination_id;
	// paragraphsArray.push(paragraphNum, destinationId);
	paragraphsArray.push(paragraphNum);

	// We create a span element for each paragraph
	paragraphsArray.forEach(item => {
		createParagraphContainer(item);
	});
}

function createParagraphContainer(paragraphId) {
	let spanElement = document.createElement("p");
	spanElement.id = "paragraph" + paragraphId;
	container.appendChild(spanElement);
}
function typeText(pIndex) {
	displayGameOver(false);
	setParagraphText(pIndex);
}
function setParagraphText(pIndex) {
	console.log(`[setParagraphText] pIndex: ${pIndex}`);
	if (pIndex < paragraphsArray.length) {

		// We set the paragraph's plain text and html text
		activeParagraphId = paragraphsArray[pIndex];
		let spanElement = document.getElementById("paragraph" + activeParagraphId);
		let paragraphText = storyData.story.chapters[chapterId].paragraphs[activeParagraphId].text_body;
		let keyword = storyData.story.chapters[chapterId].paragraphs[activeParagraphId].keyword;
		let paragraphHtml = highlightKeyword(activeParagraphId, paragraphText, keyword);
		let paragraphType = storyData.story.chapters[chapterId].paragraphs[activeParagraphId].type;

		let i = 0;
		typingIntervalId = setInterval(() => {
			// We slice HTML tags
			if (paragraphText.charAt(i) == "<") {
				let tag = paragraphText.slice(i, paragraphText.indexOf(">", i) + 1);
				spanElement.innerHTML += tag;
				i += tag.length;
			} else {
				spanElement.innerHTML += paragraphText.charAt(i);
				i++;
			}
			if (i >= paragraphText.length) {
				clearInterval(typingIntervalId);
				displayFullParagraph(spanElement, paragraphHtml, keyword, activeParagraphId, paragraphType);
				pIndex++;
				setParagraphText(pIndex);
			}
		}, typingSpeed);
	} else {
		return;
	}
}

function displayFullParagraph(spanElement, paragraphHtml, keyword, paragraphId, paragraphType) {
	spanElement.innerHTML = paragraphHtml + " ";
	if (keyword) {
		activateKeyword(paragraphId)
	};
	if (paragraphType == "storyEnd") {
        displayGameOver(true);
	};
}

function displayGameOver(gameOver) {
	if (gameOver == true) {
		gameOverElement.innerHTML = text[1];
	} else if (gameOver == false) {
		gameOverElement.innerHTML = "";
	}
}

function highlightKeyword(paragraphId, paragraphText, keyword) {
	const keywordRegex = new RegExp(`(${keyword})`, 'gi');
	return paragraphText.replace(keywordRegex, '<span class="keyword" id="keyword' + paragraphId + '">$1</span>');
}

function activateKeyword(paragraphId) {
    let keywordId = "keyword" + paragraphId;
	const keywordElement = document.getElementById(keywordId);
	console.log(`keywordId: ${keywordId}`);

	keywordElement.addEventListener("click", function (event) {
		event.stopPropagation(); // Prevent the event from bubbling up to the document
		// Check if the dropdown has been already created, if not, create one
		const dropDownElement = document.getElementById('options');
		if (!dropDownElement) {
			createDropDown(keywordElement, paragraphId);
        // if a dropdown exists but it's not for the current paragraph, remove it and create a new one
		} else if (dropDownElement.dataset.paragraph_id != paragraphId) {
			dropDownElement.remove();
            createDropDown(keywordElement, paragraphId);
		}
	});
}
function selectWord(newWord, keywordElement, paragraphId) {
	keywordElement.innerHTML = newWord;
	clearInterval(typingIntervalId);

    // Remove the options' drop-down list
	const dropDown = document.getElementById('options');
	if (dropDown) { 
		dropDown.remove();
	}

	// Cycle through the choices to find the destination_id
	let choices = storyData.story.chapters[chapterId].paragraphs[paragraphId].choices;
	let destinationId;
	choices.forEach(item => {
		if (item.text_body === newWord) {
			destinationId = item.destination_id;
		}
	});

	// 1. Remove all the paragraph containers after the current paragraph
	let arrayIndex = paragraphsArray.indexOf(paragraphId);

	// 1.1 Remove all items after arrayIndex
	if (arrayIndex !== -1) {
		paragraphsArray.splice(arrayIndex + 1).forEach(id => {
			let spanElementId = "paragraph" + id;
			let spanElement = document.getElementById(spanElementId);
			if (spanElement) {
				spanElement.remove();
			}
		});
	}

	// 1.2 Remove all elements in paragraphsArray after arrayIndex
	paragraphsArray.splice(arrayIndex + 1);

	// 2. Add the new paragraphId (the new destination) to the paragraphsArray
    paragraphsArray.push(destinationId);

	// 2.1  Create a new paragraph container
    createParagraphContainer(destinationId);

	// 3.  Type the new paragraph on screen
	typeText(paragraphsArray.length - 1);
}

function positionDropdown(dropdownElement, keywordElement) {
	dropdownElement.style.left = keywordElement.offsetLeft + 'px';  /* Align the left position */
	dropdownElement.style.top = keywordElement.offsetTop + keywordElement.offsetHeight + 'px';  /* Position below the interactive word */	
}

function createDropDown(keywordElement, paragraphId) {
	
	let selectedWord = keywordElement.innerHTML;
	
	// Create a <ul> element
	const ul = document.createElement('ul');
	ul.className = 'options';
	ul.id = 'options';
	ul.style.display = 'block';
	ul.dataset.paragraph_id = paragraphId;
	positionDropdown(ul, keywordElement);

	// Create an array of choices
	let choices = storyData.story.chapters[chapterId].paragraphs[paragraphId].choices;

	console.log(`choices: ${choices}`);

	let words = [];
    choices.forEach(item => {
        words.push(item.text_body);
    });	

	// Iterate over the choices array to create <li> elements
	words.forEach(item => {
		// if (item != selectedWord) { // we make sure the word that is already printed doesn't appear in the list of choices
		const li = document.createElement('li');
		li.onclick = function (event) {
			event.stopPropagation();
			selectWord(item, keywordElement, paragraphId);
		};		
		li.textContent = item;
		ul.appendChild(li);
		//}
	});		

	// Append the <ul> element to the dropdown-list div
	document.getElementById('dropdown-list').appendChild(ul);
}

function addResizeListener(){
	window.addEventListener('resize', function () {
		let dropdownElement = document.getElementById('options');
		if (dropdownElement) {
			const keywordElement = document.getElementById("keyword" + dropdownElement.dataset.paragraph_id);
			positionDropdown(dropdownElement, keywordElement);
		}
	});
};