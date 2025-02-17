﻿const version = "0.003";

// SETTINGS
// YED (Editor grafico per diagrammi) https://www.yworks.com/products/yed
let debug = false;
let displayImages = true;
let typingSpeed = 35;

// VARS
let storyData = {};
let chapterString;
let chapterTitle;
let chapterId;
let activeParagraphId;
let paragraphsArray = [];
let typingIntervalId;
let text = [];

// We load the JSON file
document.addEventListener('DOMContentLoaded', () => {
	fetch('stories/02/story02_eng.json')
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
	typingSpeed = storyData.story.typingSpeed; // Typing speed in milliseconds

	text[0] = storyData.story.chapterString;
	text[1] = storyData.story.endString;
	text[2] = storyData.story.inventoryName;
	text[3] = storyData.story.inventoryEmpty;

	setStylesheet();
	addResizeListener();
	addClickPageListener();
	setDynamicVars();
	createNavbar();
	container = document.getElementById("text-placeholder");
	gameOverElement = document.getElementById("game-over");
	setChapterTitle(0);
	newParagraph(0);
}

function setStylesheet() {
	// We fetch the stylesheet filename from the JSON file and apply it to the document
	let stylesheet;
	if (storyData.story.stylesheet) {
		stylesheet = 'css/' + storyData.story.stylesheet;
	} else {
		console.error('The story has no style sheet specified, so I am using the default stylesheet.', error);
		stylesheet = 'css/default.css';
	}
	document.getElementById('theme-stylesheet').setAttribute('href', stylesheet);
}
function addClickPageListener() {
	document.addEventListener("click", function (event) {

		// Remove options drop-down if user clicks anywhere on the page outside of it
		const dropDown = document.getElementById('options');
		console.log(`event.target.className: ${event.target.className}`);
		if (dropDown && !dropDown.contains(event.target)) {
			dropDown.remove();
		} 

		// Show full paragraph immediately when the user clicks anywhere on the page
		clearInterval(typingIntervalId);
		let pObj = getParagraphObject(activeParagraphId);
		displayFullParagraph(pObj.spanElement, pObj.paragraphHtml, pObj.keyword, activeParagraphId, pObj.paragraphType, pObj.image);
    });
}
function setChapterTitle(chapterNum) {
	chapterString = storyData.story.chapterString;
	chapterTitle = storyData.story.chapters[chapterNum].title;
	chapterId = storyData.story.chapters[chapterNum].id;
	document.getElementById("chapterTitle").innerHTML = "<b>" + chapterString + " " + (chapterId+1) + "</b><br>" + chapterTitle;
}
function typeText(pIndex) {
	displayGameOver(false);
	setParagraphText(pIndex);
}
function getParagraphObject(paragraphId) {

	let pID = paragraphsArray.length - 1;
	let spanElement = document.getElementById("par" + pID);

	// We retrieve the index of the paragraph in the JSON file's paragraphs array, based on the paragraphID
	let pIndexInJSON = getParagraphIndexById(chapterId, paragraphId);

	let paragraphText = parseTextForVariables(storyData.story.chapters[chapterId].paragraphs[pIndexInJSON].text_body);
	let keyword = storyData.story.chapters[chapterId].paragraphs[pIndexInJSON].keyword;
	let paragraphHtml = highlightKeyword(paragraphText, keyword);
	let paragraphType = storyData.story.chapters[chapterId].paragraphs[pIndexInJSON].type;
	let image = storyData.story.chapters[chapterId].paragraphs[pIndexInJSON].image;

	return {
		"spanElement": spanElement,
		"paragraphText": paragraphText,
		"keyword": keyword,
		"paragraphHtml": paragraphHtml,
		"paragraphType": paragraphType,
		"image": image
	}
}
function setParagraphText(pIndex) {
	if (pIndex < paragraphsArray.length) {
		// We set the paragraph's plain text and html text
		activeParagraphId = paragraphsArray[pIndex];
		let pObj = getParagraphObject(activeParagraphId);
		let i = 0;
		typingIntervalId = setInterval(() => {   
			if (pObj.paragraphText.charAt(i) == "<") {
				// We slice HTML tags such as <p> and <br> and add them to the span element
				let tag = pObj.paragraphText.slice(i, pObj.paragraphText.indexOf(">", i) + 1);
				pObj.spanElement.innerHTML += tag;
				i += tag.length;
			} else {
				// Display the paragraph's text one character at a time
				pObj.spanElement.innerHTML += pObj.paragraphText.charAt(i);
				i++;
				// Scroll to the bottom after each character is typed
				if (!isBottomInView()) {
					window.scrollTo(0, document.body.scrollHeight);
				}
			}
			if (i >= pObj.paragraphText.length || pObj.paragraphType === PAR_TYPE.INFO_BOX || typingSpeed <= 0) {
				// Clear the interval and display the full paragraph at once
				clearInterval(typingIntervalId);
				displayFullParagraph(pObj.spanElement, pObj.paragraphHtml, pObj.keyword, activeParagraphId, pObj.paragraphType, pObj.image);
			}
		}, typingSpeed);
	} else {
		return;
	}
}
function parseTextForVariables(text) {
	return text.replace(/{(\w+)}/g, (match, p1) => dynamicVars[p1] || match);
}

function getParagraphIndexById(chapterId, paragraphId) {
	// Finds the index of a paragraph in the JSON file's paragraphs array, based on the paragraphID
	return storyData.story.chapters[chapterId].paragraphs.findIndex(paragraph => paragraph.id === paragraphId);
}
function displayFullParagraph(spanElement, paragraphHtml, keyword, paragraphId, paragraphType, paragraphImage) {
	let pIndex = paragraphsArray.length - 1;
	let debugInfo = getDebugInfo(pIndex, paragraphId, paragraphType, paragraphImage);
	spanElement.innerHTML = debugInfo + paragraphHtml + " ";
    // Activate the keyword if it exists
	if (keyword) {
		activateKeyword(pIndex);
	};
	if (paragraphType === PAR_TYPE.PASS_THRU || paragraphType === PAR_TYPE.STORY_END) {

		if (paragraphType === PAR_TYPE.STORY_END) {
			// GAME OVER: if the paragraph type is "story_end", display the game over message
			displayGameOver(true);
		}

        // DESTINATION ID: determine the destination_id from the current paragraph
		let item = storyData.story.chapters[chapterId].paragraphs[getParagraphIndexById(chapterId, activeParagraphId)];
		destinationId = getDestination(item);
		// a PASS_THRU paragraph may have variables set in the choices array, in which case the choices array only has one element (choice 0)
		if (item.choices) {
			setVariables(item.choices[0]);
		} else {
			undoArray.push([]);
			pushEmptyUndoEntry(paragraphsArray.length);
		}
		if (destinationId) {
			newParagraph(destinationId);
		}
	};

	if (paragraphType !== PAR_TYPE.INFO_BOX) {
		// SCROLL PAGE: scroll to the bottom of the page after the full paragraph has been displayed
		window.scrollTo(0, document.body.scrollHeight);
	}

	// IMAGE: if the paragraph has an image, display the image
	if (paragraphImage && displayImages) {
		displayImage(spanElement, paragraphImage);
	}
}
function getDebugInfo(pIndex, paragraphId, paragraphType, paragraphImage) {
	let debugInfo = "";
	if (debug) {
		const separator = "&nbsp;&nbsp;|&nbsp;&nbsp;";
		if (!paragraphImage) {
			paragraphImage = "<i>none</i>";
		}
		debugInfo = "<p id='debug'>&nbsp;&nbsp;Array Index: <strong>" +
			pIndex + "</strong>" + separator + "Paragraph ID: <strong>" +
			paragraphId + "</strong>" + separator + "Array: <strong>" +
			paragraphsArray + "</strong>" + separator + "Length: <strong>" +
			paragraphsArray.length + "</strong>" + separator + "Type: <strong>" +
			paragraphType + "</strong>" + separator + "Image: <strong>" +
			paragraphImage + "</strong></p > ";
	}
	return debugInfo;
}
function displayImage(spanElement, paragraphImage) {
	// Create an img element dynamically
	const img = document.createElement('img'); // Create an <img> element
	const p = document.createElement('p'); // Create an <p> element, we will use this as a spacer

	img.src = 'stories/' + paragraphImage; // Set the image source
	img.alt = 'Dynamically Added Image'; // Optionally set an alt attribute

	// Append the image to the container
	spanElement.appendChild(p); // Add the image to the container
	spanElement.appendChild(img); // Add the image to the container

	// Wait until the image has loaded to access its natural width
	img.onload = function () {
		const parentWidth = spanElement.offsetWidth;  // Width of the parent container
		const imageWidth = img.naturalWidth;        // Original width of the image

		// Resize the image only if the original width is greater than the parent width
		if (imageWidth > parentWidth) {
			img.style.width = '100%';  // Resize the image to fill the parent's width
			img.style.height = 'auto'; // Maintain the aspect ratio
		}
	};
}
function displayGameOver(gameOver) {
	gameOverElement.innerHTML = gameOver ? text[1] : "";
}
function highlightKeyword(paragraphText, keyword) {
	const keywordRegex = new RegExp(`(${keyword})`, 'gi');
	const pIndex = paragraphsArray.length - 1;
	const newParagraphText = paragraphText.replace(keywordRegex, '<span class="keyword" id="keyword' + pIndex + '">$1</span>');
	return newParagraphText;
}
function activateKeyword(pIndex) {
    let keywordId = "keyword" + pIndex;
	const keywordElement = document.getElementById(keywordId);

	keywordElement.addEventListener("click", function (event) {
		event.stopPropagation(); // Prevent the event from bubbling up to the document

		// Check if the dropdown has been already created, if not, create one
		const dropDownElement = document.getElementById('options');
		if (!dropDownElement) {
			createDropDown(keywordElement, pIndex);
        // if a dropdown exists but it doesn't belong to the current paragraph, remove it and create a new one
		} else if (dropDownElement.dataset.pIndex != pIndex) {
			dropDownElement.remove();
			createDropDown(keywordElement, pIndex);
		}
	});
}
function selectWord(chosenWord, keywordElement, pIndex) {
	keywordElement.innerHTML = chosenWord;
	clearInterval(typingIntervalId);

    // Remove the options' list
	const dropDown = document.getElementById('options');
	if (dropDown) { 
		dropDown.remove();
	}

	// 1.3 Undo steps
	undoVariables(pIndex);

    // 0. Cycle through the choices to find the destination_id and set variables
	// First, we retrieve the index of the paragraph in the JSON file, based on the paragraphID
	let pIndexInJSON = getParagraphIndexById(chapterId, paragraphsArray[pIndex]);
	let choices = storyData.story.chapters[chapterId].paragraphs[pIndexInJSON].choices;
	let destinationId;
	choices.forEach(choice => {
		if (choice.text_body === chosenWord) {
            // We set variables and inventory items
            setVariables(choice);
			// Get the paragraph destination
			destinationId = getDestination(choice);
		}	
	});

	// 1.1 Remove all the paragraph containers after the current paragraph
	for (let i = pIndex+1; i < paragraphsArray.length; i++) {
		console.log(`Processing paragraph at index: ${i}`);
		let spanElement = document.getElementById("par" + i);
		if (spanElement) {
			spanElement.remove();
		}
	}	

	// 1.2 Remove all elements in paragraphsArray after the index
	paragraphsArray.length = pIndex + 1;
	newParagraph(destinationId);
}

function getDestination(choice) {
	let destination = choice.destination_id; // we set the default destination
	if (choice.conditionalDestinations) {
		choice.conditionalDestinations.forEach(i => {
			if (i.condition === CONDITIONS.HAS_ITEM && playerHasItemInInventory(i.value)) {
				// set a conditional destination
				console.log(`Conditional destination: ${i.destination_id}`);
				destination = i.destination_id;
			}
		});

	} 
	return destination;	
}
function newParagraph(paragraphId) {
	// 1. Add the new paragraphId (the new destination) to the paragraphsArray
	paragraphsArray.push(paragraphId);

	// 2.  Create a new paragraph container
	const paragraphType = getParagraphObject(paragraphId).paragraphType;
	createParagraphContainer(paragraphsArray.length - 1, paragraphType);

	// 3.  Type the new paragraph on screen
	typeText(paragraphsArray.length - 1);
}
function createParagraphContainer(paragraphId, paragraphType) {
	let spanElement = document.createElement("p");
	spanElement.id = "par" + paragraphId;
	spanElement.className = paragraphType;
	container.appendChild(spanElement);
}
function createDropDown(keywordElement, pIndex) {
	
	let parID = paragraphsArray[pIndex];
	
	// Create a <ul> element
	const choicesDropdown = document.createElement('ul');
	choicesDropdown.className = 'options';
	choicesDropdown.id = 'options';
	choicesDropdown.style.display = 'block';
	choicesDropdown.dataset.paragraph_id = parID;
	choicesDropdown.dataset.pIndex = pIndex;

	// We retrieve the index of the paragraph in the JSON file, based on the paragraphID
	let pIndexInJSON = getParagraphIndexById(chapterId, parID);

	// Create an array of choices
	let choices = storyData.story.chapters[chapterId].paragraphs[pIndexInJSON].choices;

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
			selectWord(item, keywordElement, pIndex);
		};		
		li.textContent = item;
		choicesDropdown.appendChild(li);
		//}
	});	

	// Append the <ul> element to the dropdown-list div
	const dropdownList = document.getElementById('dropdown-list');
	dropdownList.appendChild(choicesDropdown);
	positionDropdown(choicesDropdown, keywordElement);	
}
function positionDropdown(dropdownElement, keywordElement) {
	dropdownElement.style.left = keywordElement.offsetLeft + 'px';  /* Align the left position */
	if (!isBottomInView(dropdownElement)) {
		// Position above the interactive word
		dropdownElement.style.top = (keywordElement.offsetTop - dropdownElement.offsetHeight - keywordElement.offsetHeight) + 'px';
	} else {
		// Position below the interactive word
		dropdownElement.style.top = (keywordElement.offsetTop + keywordElement.offsetHeight) + 'px';
	}
}
function isBottomInView(element) {
	if (element) {
		return (window.innerHeight + window.scrollY + element.offsetHeight) >= document.body.scrollHeight;
	} else {
		return (window.innerHeight + window.scrollY) >= document.body.scrollHeight;
	}
}
function addResizeListener(){
	window.addEventListener('resize', function () {
		let dropdownElement = document.getElementById('options');
		if (dropdownElement) {
			const keywordElement = document.getElementById("keyword" + dropdownElement.dataset.pIndex);
			positionDropdown(dropdownElement, keywordElement);
		}
	});
};