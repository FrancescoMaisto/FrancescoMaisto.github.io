window.addEventListener("beforeunload", function (event) {
    event.preventDefault(); 
    event.returnValue = "Are you sure you want to leave? Make sure to save your work!";
});
/*****************************************************************
 NEW BLOCKS BUTTONS
*****************************************************************/
// Add event listeners for new block buttons
document
  .getElementById("newBlock_Interactive")
  .addEventListener("click", () => createNewParagraph("interactive"));
document
  .getElementById("newBlock_PassThru")
  .addEventListener("click", () => createNewParagraph("passThru"));
document
  .getElementById("newBlock_InfoBox")
  .addEventListener("click", () => createNewParagraph("infoBox"));

/*****************************************************************
 PLAY BUTTON (TEST STORY)
 *****************************************************************/
// Variables declaration
let appWindow = null; // Store reference to the opened window
const url = "../reader/index.html";
const windowName = "StoryPreview";
const windowFeatures = "width=600,height=900,resizable=yes,scrollbars=yes";

document
  .getElementById("playStory")
  .addEventListener("click", () => previewStory());

function previewStory() {

  // If the preview window is already open, close it first
  if (appWindow && !appWindow.closed) {
    appWindow.close();
    appWindow = null;
  }

  // Open a new preview window
  appWindow = window.open(url, windowName, windowFeatures);

  // Ensure the preview window is fully loaded before sending data
  appWindow.onload = function () {
    sendStoryData();
  };
}

function sendStoryData() {
  if (!appWindow || appWindow.closed) return;

  const jsonString = JSON.stringify(currentData, null, 2);
  console.log("Sending story data to preview:", jsonString);

  const message = {
    storyData: jsonString,
    isDebug: false,
  };

  appWindow.postMessage(message, "*");
}

/*****************************************************************
 SAVE STORY BUTTON
 *****************************************************************/
// Add event listener for the Save Story button
document.getElementById("saveStory").addEventListener("click", () => {
  // Update positions for all blocks in currentData
  // Story block
  if (blocks["story"]) {
    const storyBlock = blocks["story"];
    currentData.story.position = [
      parseInt(storyBlock.style.left, 10),
      parseInt(storyBlock.style.top, 10),
    ];
  }
  // Chapters and their paragraphs/choices
  currentData.story.chapters.forEach((chapter, cIndex) => {
    const chapterBlock = blocks[`chapter-${cIndex}`];
    if (chapterBlock) {
      chapter.position = [
        parseInt(chapterBlock.style.left, 10),
        parseInt(chapterBlock.style.top, 10),
      ];
    }
    chapter.paragraphs.forEach((para, pIndex) => {
      const paraBlock = blocks[`paragraph-${cIndex}-${pIndex}`];
      if (paraBlock) {
        para.position = [
          parseInt(paraBlock.style.left, 10),
          parseInt(paraBlock.style.top, 10),
        ];
      }
      if (para.choices) {
        para.choices.forEach((choice, chIndex) => {
          const choiceBlock = blocks[`choice-${cIndex}-${pIndex}-${chIndex}`];
          if (choiceBlock) {
            choice.position = [
              parseInt(choiceBlock.style.left, 10),
              parseInt(choiceBlock.style.top, 10),
            ];
          }
        });
      }
    });
  });

  // Existing logic to update text_body etc.
  currentData.story.chapters.forEach((chapter) => {
    chapter.paragraphs.forEach((para) => {
      const paraBlock = paragraphBlocksByJsonId[para.id];
      if (paraBlock) {
        const editableElem = paraBlock.querySelector('[data-property="text_body"]');
        if (editableElem) {
          para.text_body = editableElem.innerText;
        }
      }
    });
  });

  // Clean up empty destination_ids before saving
  currentData.story.chapters.forEach(chapter => {
    chapter.paragraphs.forEach(para => {
      if (para.destination_id === undefined || para.destination_id === null || String(para.destination_id).trim() === "") {
        console.error("ATTENTION! Paragraph ID = " + para.id + " [TYPE = " + para.type + "] had an empty/null/undefined 'destination_id' in the data structure (currentData) that I had to remove. For the future, please make sure that empty/null/undefined 'destination_id's never get added to currentData in the first place!");
        delete para.destination_id;
      }
    });
  });

  // Generate JSON string with the added position properties.
  const jsonString = JSON.stringify(currentData, null, 2);
  console.log("Generated Story JSON:", jsonString);

  // Create a Blob with the JSON string
  const blob = new Blob([jsonString], { type: "application/json" });

  // Create a link element
  const link = document.createElement("a");
  const lowerCaseFileName = currentData.story.title
    .toLowerCase()
    .replace(/ /g, "_");

  // Set the download attribute with a filename
  link.download = lowerCaseFileName + ".json";

  // Create an object URL for the Blob
  link.href = URL.createObjectURL(blob);

  // Append the link to the document body
  document.body.appendChild(link);

  // Programmatically click the link to trigger the download
  link.click();

  // Remove the link from the document
  document.body.removeChild(link);
});

/*****************************************************************
 NEW STORY BUTTON
 *****************************************************************/
document.getElementById("newStory").addEventListener("click", async () => {
    try {
        const response = await fetch(jsonFileNames.new);
        if (!response.ok) {
            throw new Error('Failed to load new JSON template');
        }
        const loadedData = await response.json();

        setPropertiesPanelVisibility(false);
        cleanupOldFlowchart(loadedData);
        createFlowchart(loadedData);

    } catch (error) {
        console.error("Error creating new story:", error);
        alert("Error creating new story. Please check if the template file exists.");
    }
});

/*****************************************************************
 LOAD STORY BUTTON
 *****************************************************************/
// Add event listener for the Load Story button
document.getElementById("loadStory").addEventListener("click", () => {
    document.getElementById("fileInput").click();
});

// Handle file selection and load the story
document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const loadedData = JSON.parse(e.target.result);

      cleanupOldFlowchart(loadedData);
      createFlowchart(loadedData);

      // Reset the file input
      event.target.value = "";
      setPropertiesPanelVisibility(false);
    } catch (error) {
      console.error("Error loading story:", error);
      alert("Error loading story. Please select a valid JSON file.");
    }
  };
  reader.readAsText(file);
});

// Helper function to cleanup the old flowchart
function cleanupOldFlowchart(data){
    // Remove flowchart's blocks
    const editor = document.getElementById("editor");
    const blocks = editor.getElementsByClassName("block");
    while (blocks.length) {
        blocks[0].remove();
    }

    // Clear SVG connectors, preserving defs
    const svgCanvas = document.getElementById("svgCanvas");
    Array.from(svgCanvas.childNodes).forEach((child) => {
        if (child.nodeName !== "defs") {
            child.remove();
        }
    });

    // Reset global data
    currentData = data;
    paragraphBlocksByJsonId = {};
    connections = [];
}