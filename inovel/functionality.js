const version = "0.001";
let debug = false;
let typingSpeed = 35; // Default value
let storyData = {};
let chapterName;
let chapterTitle;
let chapterId;
let activeParagraphId;
let paragraphsArray = [];
let typingIntervalId;
let dynamicVars = {};
let text = [];

// We load the JSON file
document.addEventListener('DOMContentLoaded', () => {
	fetch('stories/sample_story.json')
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
	text[0] = storyData.story.chapterName;
	text[1] = storyData.story.endString;

	addResizeListener();
	addClickPageListener();

	// Cycle through the variables array to create an object of dynamic variables
	let variables = storyData.story.variables;
	variables.forEach(item => {
		dynamicVars[item.name] = item.value;
	});

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

		// Show full paragraph immediately when the user clicks anywhere on the page
		clearInterval(typingIntervalId);
		let pObj = getParagraphObject(activeParagraphId);
		displayFullParagraph(pObj.spanElement, pObj.paragraphHtml, pObj.keyword, activeParagraphId, pObj.paragraphType);
    });
}
function setChapterTitle(chapterNum) {
	chapterName = storyData.story.chapterName;
	chapterTitle = storyData.story.chapters[chapterNum].title;
	chapterId = storyData.story.chapters[chapterNum].id;
	document.getElementById("chapterTitle").innerHTML = "<b>" + chapterName + " " + (chapterId+1) + "</b><br>" + chapterTitle;
}
function setParagraph(paragraphId) {

	// We populate paragraphsArray with the current paragraph id
	paragraphsArray.push(paragraphId);

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
function getParagraphObject(activeParagraphId) {
	let spanElement = document.getElementById("paragraph" + activeParagraphId);

	// We retrieve the index of the paragraph in the JSON file's paragraph array, based on the paragraphID
	let pIndexInJSON = getParagraphIndexById(chapterId, activeParagraphId);

	let paragraphText = parseTextForVariables(storyData.story.chapters[chapterId].paragraphs[pIndexInJSON].text_body);
	let keyword = storyData.story.chapters[chapterId].paragraphs[pIndexInJSON].keyword;
	let paragraphHtml = highlightKeyword(activeParagraphId, paragraphText, keyword);
	let paragraphType = storyData.story.chapters[chapterId].paragraphs[pIndexInJSON].type;

	return {
		"spanElement": spanElement,
		"paragraphText": paragraphText,
		"keyword": keyword,
		"paragraphHtml": paragraphHtml,
		"paragraphType": paragraphType
	}

}
function setParagraphText(pIndex) {
	if (pIndex < paragraphsArray.length) {

		// We set the paragraph's plain text and html text
		activeParagraphId = paragraphsArray[pIndex];
		let pObj = getParagraphObject(activeParagraphId);

		let i = 0;
		typingIntervalId = setInterval(() => {
            // We slice HTML tags such as <p> and <br> and add them to the span element
			if (pObj.paragraphText.charAt(i) == "<") {
				let tag = pObj.paragraphText.slice(i, pObj.paragraphText.indexOf(">", i) + 1);
				pObj.spanElement.innerHTML += tag;
				i += tag.length;
			} else {
				pObj.spanElement.innerHTML += pObj.paragraphText.charAt(i);
				i++;
				// Scroll to the bottom after each character is typed
				if (!isBottomInView()) {
					window.scrollTo(0, document.body.scrollHeight);
				}
			}
			if (i >= pObj.paragraphText.length) {
				clearInterval(typingIntervalId);
				displayFullParagraph(pObj.spanElement, pObj.paragraphHtml, pObj.keyword, activeParagraphId, pObj.paragraphType);
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
	return storyData.story.chapters[chapterId].paragraphs.findIndex(paragraph => paragraph.id === paragraphId);
}
function displayFullParagraph(spanElement, paragraphHtml, keyword, paragraphId, paragraphType) {

	let parIdLabel = "";
	if (debug) {
		parIdLabel = "<p id='debug'>&nbsp;&nbsp;Array Index: <strong>" +
			paragraphsArray.indexOf(paragraphId) + "</strong>&nbsp;&nbsp;|&nbsp;&nbsp;Paragraph ID: <strong>" +
			paragraphId + "</strong>&nbsp;&nbsp;|&nbsp;&nbsp;Array: <strong>" +
			paragraphsArray + "</strong>&nbsp;&nbsp;|&nbsp;&nbsp;Length: <strong>" +
			paragraphsArray.length + "</strong>&nbsp;&nbsp;|&nbsp;&nbsp;Type: <strong>" +
			paragraphType + "</strong></p > ";
	}
	spanElement.innerHTML = parIdLabel + paragraphHtml + " ";
	if (keyword) {
		activateKeyword(paragraphId)
	};
	if (paragraphType == "storyEnd") {
		displayGameOver(true);
	} else if (paragraphType == "passThru") {

		let destinationId = storyData.story.chapters[chapterId].paragraphs[activeParagraphId].destination_id;

		// 2. Add the new paragraphId (the new destination) to the paragraphsArray
		paragraphsArray.push(destinationId);

		// 3.  Create a new paragraph container
		createParagraphContainer(destinationId);

		// 4.  Type the new paragraph on screen
		typeText(paragraphsArray.length - 1);
	};
	// Scroll to the bottom after the full paragraph has been displayed
	window.scrollTo(0, document.body.scrollHeight);
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

	keywordElement.addEventListener("click", function (event) {
		event.stopPropagation(); // Prevent the event from bubbling up to the document
		// Check if the dropdown has been already created, if not, create one
		const dropDownElement = document.getElementById('options');
		let pIndex = paragraphsArray.indexOf(paragraphId);
		if (!dropDownElement) {
			createDropDown(keywordElement, pIndex);
        // if a dropdown exists but it doesn't belong to the current paragraph, remove it and create a new one
		} else if (dropDownElement.dataset.paragraph_id != paragraphId) {
			dropDownElement.remove();
			createDropDown(keywordElement, pIndex);
		}
	});
}
function selectWord(newWord, keywordElement, pIndex) {
	keywordElement.innerHTML = newWord;
	clearInterval(typingIntervalId);

    // Remove the options' drop-down list
	const dropDown = document.getElementById('options');
	if (dropDown) { 
		dropDown.remove();
	}

	// 0. Cycle through the choices to find the destination_id
	// 0.1 We retrieve the index of the paragraph in the JSON file, based on the paragraphID
	let pIndexInJSON = getParagraphIndexById(chapterId, paragraphsArray[pIndex]);
	let choices = storyData.story.chapters[chapterId].paragraphs[pIndexInJSON].choices;
	let destinationId;
	choices.forEach(item => {
		if (item.text_body === newWord) {
			destinationId = item.destination_id;

			// We set dynamic variables
			let variables = item.variables;
			if (variables) {
				variables.forEach(variable => {
					dynamicVars[variable.name] = variable.value;
				});
			}
		}	
	});

	// 1. Remove all the paragraph containers after the current paragraph
	// 1.1 Remove all items after arrayIndex
	if (pIndex !== -1) {
		let splicedParagraphsArray = paragraphsArray.splice(pIndex + 1);
		splicedParagraphsArray.forEach(id => {
			let spanElement = document.getElementById("paragraph" + id);
			if (spanElement) {
				spanElement.remove();
			}
		});
	}

	// 1.2 Remove all elements in paragraphsArray after arrayIndex
	paragraphsArray.splice(pIndex + 1);

	// 2. Add the new paragraphId (the new destination) to the paragraphsArray
    paragraphsArray.push(destinationId);

	// 2.1  Create a new paragraph container
    createParagraphContainer(destinationId);

	// 3.  Type the new paragraph on screen
	typeText(paragraphsArray.length - 1);
}

function createDropDown(keywordElement, pIndex) {
	
	let parID = paragraphsArray[pIndex];
	
	// Create a <ul> element
	const ul = document.createElement('ul');
	ul.className = 'options';
	ul.id = 'options';
	ul.style.display = 'block';
	ul.dataset.paragraph_id = parID;

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
		ul.appendChild(li);
		//}
	});	

	// Append the <ul> element to the dropdown-list div
	const dropdownList = document.getElementById('dropdown-list');
	dropdownList.appendChild(ul);
	positionDropdown(ul, keywordElement);	
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
			const keywordElement = document.getElementById("keyword" + dropdownElement.dataset.paragraph_id);
			positionDropdown(dropdownElement, keywordElement);
		}
	});
};