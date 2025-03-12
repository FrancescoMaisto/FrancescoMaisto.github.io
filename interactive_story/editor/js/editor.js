const jsonFileNames = {
  default: "stories/new_story.json",
  new: "stories/new_story.json",
}

// Global storage for block elements and connections
let currentData = null; // global variable for story data
let blocks = {};
let connections = [];
let editor;
let svgCanvas;
let propertiesPanel;
let closePropertiesPanel;

// We'll store paragraph blocks by their JSON id for lookup
let paragraphBlocksByJsonId = {};

// More global variables
let selectionBox = null;
let selectionStart = null;
let selectedBlocks = new Set();
let isMultiDragging = false;
let multiDragOffset = null;

let newBlockPosition = {x: 90, y: 90};

const headerLabel = {
  emoji: {
    story: "📗",
    chapter: "📚",
    interactive: "👉",
    passThru: "⏬",
    infoBox: "💡",
    choice: "🎯"
  },
  text: {
    story: "Story",
    chapter: "Chapter",
    interactive: "Interactive",
    passThru: "Pass-through",
    infoBox: "Info Box",
    choice: "Choice"
  }
};

// Wait until DOM is ready, then init
document.addEventListener("DOMContentLoaded", () => {
  init();
});

function init() {
  editor = document.getElementById("editor");
  svgCanvas = document.getElementById("svgCanvas");
  closePropertiesPanel = document.getElementById("closePropertiesPanel");
  // Close the properties panel and remove highlight from blocks
  closePropertiesPanel.addEventListener("click", () => {
    setPropertiesPanelVisibility(false);
    removeHighlightFromBlocks();
  });
  fetchJSON(jsonFileNames.default);
  // Add selection box functionality
  setupSelectionBox();
}

// Fetch and parse the JSON file
function fetchJSON(jsonFileName) {
  fetch(jsonFileName)
    .then((response) => response.json())
    .then((data) => {
      currentData = data; // Assign fetched data as a global property
      createFlowchart(currentData);
    })
    .catch((err) => console.error("Error loading JSON:", err));
}

// Create the flowchart from JSON data
function createFlowchart(currentData) {
  // Process chapters to determine the total width of all paragraphs
  let maxParagraphWidth = 0;
  currentData.story.chapters.forEach((chapter) => {
    const paragraphCount = chapter.paragraphs.length;
    const paragraphWidth = 120;
    const margin = 30;
    const totalWidth = paragraphCount * (paragraphWidth + margin) - margin;
    if (totalWidth > maxParagraphWidth) {
      maxParagraphWidth = totalWidth;
    }
  });
  // =======================================================
  // STORY
  // =======================================================
  // For the Story block, use JSON position if available:
  //const storyX = currentData.story.position ? currentData.story.position[0] : 100 + (maxParagraphWidth - 120) / 2;
  const storyX = currentData.story.position ? currentData.story.position[0] : 100;
  const storyY = currentData.story.position ? currentData.story.position[1] : 20;
  const storyBlock = createBlock("story", headerLabel.text.story, storyX, storyY);
  blocks["story"] = storyBlock;

  // Add label for chapter id (from JSON)
  const StoryTitle = document.createElement("div");
  StoryTitle.classList.add("keyword-label");
  StoryTitle.innerText = currentData.story.title;
  storyBlock.appendChild(StoryTitle);

  // Add a label for the destination ID on a new line inside the Choice block
  const StoryAuthor = document.createElement("div");
  StoryAuthor.classList.add("destination-label");
  StoryAuthor.innerText = currentData.story.author;
  storyBlock.appendChild(StoryAuthor);

  // The starting paragraph block's ID (i.e. paragraph-0-X)
  // (this is the PAragraph's JSON order which is different form the actual ID of the Paragraph)
  let startingParagraph;

  // =======================================================
  // CHAPTER
  // =======================================================
  // Process chapters
  const chapters = currentData.story.chapters;
  chapters.forEach((chapter, cIndex) => {
    const chapterId = `chapter-${cIndex}`;
    const paragraphWidth = 120;
    const margin = 30;
    const computedY = 150;
    /* 
    // Commented out: we don't need to create Chapter blocks
    // for the time being, maybe we'll re-enable them later
    
    // Use JSON position if available; otherwise compute x and y.
    const paragraphCount = chapter.paragraphs.length;
        
    const totalWidth = paragraphCount * (paragraphWidth + margin) - margin;
    const computedX = 100 + (totalWidth - paragraphWidth) / 2;
    
    const chapterX = chapter.position ? chapter.position[0] : computedX;
    const chapterY = chapter.position ? chapter.position[1] : computedY;
    const chapterBlock = createBlock(chapterId, "Chapter", chapterX, chapterY);
    blocks[chapterId] = chapterBlock;

    // Add label for chapter id (from JSON)
    const chapIdLabel = document.createElement("div");
    chapIdLabel.classList.add("id-label");
    chapIdLabel.innerText = "ID: " + chapter.id;
    chapterBlock.appendChild(chapIdLabel);

    // Add label for chapter title
    const chapTitleLabel = document.createElement("div");
    chapTitleLabel.classList.add("type-label");
    chapTitleLabel.innerText = chapter.title;
    chapterBlock.appendChild(chapTitleLabel);
    */
    // =======================================================
    // PARAGRAPH
    // =======================================================
    // Process paragraphs in each chapter
    chapter.paragraphs.forEach((para, pIndex) => {
      const paraId = `paragraph-${cIndex}-${pIndex}`;
      // Compute default position; override with JSON position if available.
      // const defaultX = 100 + pIndex * (paragraphWidth + margin);
      const defaultX = 100;
      const defaultY = computedY + 150;
      const paraX = para.position ? para.position[0] : defaultX;
      const paraY = para.position ? para.position[1] : defaultY;
      
      let headerText;
      if (para.type === "interactive") {
        headerText = headerLabel.text.interactive;
      } else if (para.type === "passThru") {
        headerText = headerLabel.text.passThru;
      } else if (para.type === "infoBox") {
        headerText = headerLabel.text.infoBox;
      }
      
      const paraBlock = createBlock(paraId, headerText, paraX, paraY);
      blocks[paraId] = paraBlock;

      // Store paragraph block by its JSON id for connection lookup
      paragraphBlocksByJsonId[para.id] = paraBlock;

      // Attach JSON id to paragraph block
      paraBlock.dataset.jsonId = para.id;
      paraBlock.dataset.type = para.type; // New: store paragraph type
 
      if (para.id === currentData.story.starting_id){
        startingParagraph = paraId;
      }

      // If the paragraph has a destination_id, also store it in dataset.destId
      if (para.destination_id && para.destination_id.trim !== "") {
        paraBlock.dataset.destId = para.destination_id;
      }

      // Add label with the paragraph ID
      createIdLabel(para.id, paraBlock);

      // Add Destination Id label for passThru and infoBox types
      if (para.type === "passThru" || para.type === 'infoBox') {
        createDestIdLabel(para.destination_id, paraBlock);
      }

      // Add a label for the text_body
      createTextBodyLabel(para.text_body, paraBlock);

      paraBlock.title = para.text_body;

      // =======================================================
      // CHOICE
      // =======================================================
      // Process choices if available
      if (para.choices) {
        para.choices.forEach((choice, chIndex) => {
          const choiceId = `choice-${cIndex}-${pIndex}-${chIndex}`;
          // Compute default position; override if JSON provides it.
          const defaultChoiceX = defaultX + chIndex * 150;
          const defaultChoiceY = defaultY + 150;
          const choiceX = choice.position ? choice.position[0] : defaultChoiceX;
          const choiceY = choice.position ? choice.position[1] : defaultChoiceY;
          const choiceBlock = createBlock(choiceId, headerLabel.text.choice, choiceX, choiceY);
          // Store destination id in dataset
          choiceBlock.dataset.destId = choice.destination_id;
          blocks[choiceId] = choiceBlock;
          connections.push({ from: paraId, to: choiceId });

          // Add a label for the choice keyword (text_body)
          const keywordLabel = document.createElement("div");
          keywordLabel.classList.add("keyword-label");
          keywordLabel.innerText = choice.text_body;
          choiceBlock.appendChild(keywordLabel);

          // Add a label for the destination ID on a new line inside the Choice block
          const destLabel = document.createElement("div");
          destLabel.classList.add("destination-label");
          destLabel.innerText = "Destination ID: " + choice.destination_id;
          choiceBlock.appendChild(destLabel);
        });
      }
    });
  });

  // Create connection from Story -> Starting Paragraph (id=0)
  connections.push({ from: "story", to: startingParagraph });

  // Initial drawing of connections
  updateConnections();

  // Add event listener to display properties panel on block click
  editor.addEventListener("mousedown", (e) => {
    let target = e.target;
    while (target && !target.classList.contains("block")) {
      target = target.parentElement;
    }
    if (target && target.classList.contains("block")) {
      const blockId = target.getAttribute("data-id");
      if (selectedBlocks.size === 0) {
        // Single block selection
        highlightBlock(target);
        displayProperties(blockId);        
      }
    } else {
      // Clicking on empty space - immediately remove selection styles
      removeHighlightFromBlocks();
      selectedBlocks.clear();
      
      // Handle properties panel
      setPropertiesPanelVisibility(false);
    }
  });
}

// Helper: Given a block element, return its data-id attribute
function getBlockId(blockEl) {
  return blockEl.getAttribute("data-id");
}

// Add this helper function
function flashNewBlock(block) {
  block.classList.add('flash-animation');
  // Remove the animation class after it completes
  setTimeout(() => {
    block.classList.remove('flash-animation');
  }, 1200); // 400ms × 3 = 1200ms total animation duration
}

// Create a draggable block element
function createBlock(id, label, left, top, shouldFlash = false) {
  const block = document.createElement("div");
  block.classList.add("block");

  // Add type-specific class and icons based on the label
  let icon = "";
  if (label === headerLabel.text.story) {
    block.classList.add("story");
    icon = headerLabel.emoji.story;
  } else if (label === headerLabel.text.chapter) {
    block.classList.add("chapter");
    icon = headerLabel.emoji.chapter;    
  } else if (label === headerLabel.text.interactive) {
    block.classList.add("interactive"); // Changed from "paragraph" to "interactive"
    icon = headerLabel.emoji.interactive;    
  } else if (label === headerLabel.text.passThru) {
    block.classList.add("passthru");   // Changed from "paragraph" to "passthru"
    icon = headerLabel.emoji.passThru;
  } else if (label === headerLabel.text.infoBox) {
    block.classList.add("infobox");    // Changed from "paragraph" to "infobox"
    icon = headerLabel.emoji.infoBox;
  } else if (label === headerLabel.text.choice) {
    block.classList.add("choice");
    icon = headerLabel.emoji.choice;    
  }

  const labelIcon = icon + " " + label;
  block.innerHTML = `<strong>${labelIcon}</strong>`;
  block.style.left = left + "px";
  block.style.top = top + "px";
  block.setAttribute("data-id", id);
  editor.appendChild(block);

  // Enable dragging for this block
  makeDraggable(block);
  
  // Only flash if explicitly requested (for new blocks created by user)
  if (shouldFlash) {
    flashNewBlock(block);
  }
  
  return block;
}
// Add these helper functions above updateConnections:
function setupMarkers(svgCanvas) {
  // Clear any existing defs
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

  // Create marker helper
  function createMarker(id, className) {
    const marker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker"
    );
    marker.setAttribute("id", id);
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "10");
    marker.setAttribute("refX", "6");
    marker.setAttribute("refY", "3");
    marker.setAttribute("orient", "auto");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M0,0 L0,6 L6,3 z");
    path.classList.add(className); // Apply the CSS class
    marker.appendChild(path);
    defs.appendChild(marker);
  }
  createMarker("arrowStoryChapter", "marker-story-chapter");
  createMarker("arrowChapterParagraph", "marker-chapter-paragraph");
  createMarker("arrowParagraphChoice", "marker-paragraph-choice");
  createMarker("arrowChoiceAll", "marker-choice-all"); // New marker
  // Remove the custom "arrowDestination" marker so destination connectors reuse "arrowChapterParagraph"

  svgCanvas.appendChild(defs);
}
// New helper to draw a connector from a Choice block to a Paragraph block
function drawConnectorChoiceToParagraph(fromBlock, toBlock, container) {
  const { x: x1, y: y1 } = getBlockCenter(fromBlock);
  const { x: x2, y: y2 } = getEdgePoint(toBlock, x1, y1);
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.classList.add("connector-choice-all");
  // Set marker-end attribute
  line.setAttribute("marker-end", "url(#arrowChoiceAll)");
  container.appendChild(line);
}
// New helper to draw destination connectors
function drawDestinationConnector(fromBlock, toBlock, svgCanvas) {
  const { x: x1, y: y1 } = getBlockCenter(fromBlock);
  const { x: x2, y: y2 } = getEdgePoint(toBlock, x1, y1);
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  // Use the same style as the Chapter->Paragraph connector.
  line.classList.add("connector-chapter-paragraph");
  line.setAttribute("marker-end", "url(#arrowChapterParagraph)");
  svgCanvas.appendChild(line);
}
function getMarkerUrl(connType) {
  // Return appropriate marker URL based on connection type.
  if (connType === "story-chapter") return "url(#arrowStoryChapter)";
  if (connType === "chapter-paragraph") return "url(#arrowChapterParagraph)";
  if (connType === "paragraph-choice") return "url(#arrowParagraphChoice)";
  return "url(#arrow)";
}
function drawConnection(fromBlock, toBlock, connType, svgCanvas) {
  const { x: x1, y: y1 } = getBlockCenter(fromBlock);
  const { x: x2, y: y2 } = getEdgePoint(toBlock, x1, y1);
  const line = createLine(x1, y1, x2, y2, connType);
  line.setAttribute("marker-end", getMarkerUrl(connType));
  svgCanvas.appendChild(line);
}
function updateLabel(blockId, labelName, newValue, tooltip = false) {
  const blockElem = document.querySelector(`.block[data-id="${blockId}"]`);
  if (blockElem) {
    const label = blockElem.querySelector("." + labelName);
    if (label) { label.innerText = newValue; }
    if (tooltip){ blockElem.title = newValue; }
  }
}
function updateStoryConnection(){
  // Update Story block connection based on starting_id
  if (currentData && currentData.story && currentData.story.starting_id != null) {
    let newTarget = null;
    for (const blockId in blocks) {
      const block = blocks[blockId];
      // Use numeric comparison after converting both values to Number
      if (block.dataset.jsonId && Number(block.dataset.jsonId) === Number(currentData.story.starting_id)) {
        newTarget = blockId;
        break;
      }
    }
    // Update all connections from "story" to use the new target (if found)
    connections = connections.map(conn => {
      if (conn.from === 'story') {
        return { from: 'story', to: newTarget || conn.to };
      }
      return conn;
    });
  }
}

function updateConnections() {
  // Clear existing connections
  while (svgCanvas.firstChild) {
    svgCanvas.removeChild(svgCanvas.firstChild);
  }
  setupMarkers(svgCanvas);

  // ...existing code drawing standard connections...
  connections.forEach((conn) => {
    const fromBlock = blocks[conn.from];
    const toBlock = blocks[conn.to];
    if (fromBlock && toBlock) {
      const connType =
        fromBlock.classList.contains("story")
          ? "story-chapter"
          : fromBlock.classList.contains("chapter") &&
            toBlock.classList.contains("paragraph")
          ? "chapter-paragraph"
          : "paragraph-choice";
      drawConnection(fromBlock, toBlock, connType, svgCanvas);
    }
  });

  // Draw connectors only when Choice destination matches Paragraph JSON id
  const allBlocks = document.querySelectorAll(".block");
  const choiceBlocks = Array.from(allBlocks).filter((block) =>
    block.classList.contains("choice")
  );
  // Updated selector to include all paragraph types
  const paragraphBlocks = Array.from(allBlocks).filter((block) =>
    block.classList.contains("interactive") ||
    block.classList.contains("passthru") ||
    block.classList.contains("infobox")
  );
  // Draw Choice->Paragraph connections
  choiceBlocks.forEach((choice) => {
    paragraphBlocks.forEach((paragraph) => {
      if (choice.dataset.destId === paragraph.dataset.jsonId) {
        drawConnectorChoiceToParagraph(choice, paragraph, svgCanvas);
      }
    });
  });

  // Draw PassThru/InfoBox -> Paragraph connections
  document.querySelectorAll(".block.passthru, .block.infobox").forEach((block) => {
    if (block.dataset.destId) {
      const target = paragraphBlocksByJsonId[block.dataset.destId];
      if (target) {
        drawDestinationConnector(block, target, svgCanvas);
      }
    }
  });
}

// Create an SVG line element with given start/end coordinates and stroke color
function createLine(x1, y1, x2, y2, connType) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("x2", x2);
  line.setAttribute("y1", y1);
  line.setAttribute("y2", y2);
  line.classList.add(`connector-${connType}`);
  return line;
}

// Get center coordinates of a block relative to the editor
function getBlockCenter(block) {
  const rect = block.getBoundingClientRect();
  const editorRect = editor.getBoundingClientRect();
  return {
    x: rect.left - editorRect.left + rect.width / 2,
    y: rect.top - editorRect.top + rect.height / 2,
  };
}

// Given a target block and a source point (sx, sy), compute the point on the block's border
// where a line from (sx, sy) should end.
function getEdgePoint(targetBlock, sx, sy) {
  const rect = targetBlock.getBoundingClientRect();
  const editorRect = editor.getBoundingClientRect();
  const center = {
    x: rect.left - editorRect.left + rect.width / 2,
    y: rect.top - editorRect.top + rect.height / 2,
  };
  const dx = center.x - sx;
  const dy = center.y - sy;
  const angle = Math.atan2(dy, dx);
  const halfWidth = rect.width / 2;
  const halfHeight = rect.height / 2;
  const tX = halfWidth / Math.abs(Math.cos(angle));
  const tY = halfHeight / Math.abs(Math.sin(angle));
  const t = Math.min(tX, tY);
  return {
    x: center.x - Math.cos(angle) * t,
    y: center.y - Math.sin(angle) * t,
  };
}

// Make an element draggable and update connections while dragging
function makeDraggable(el) {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  el.addEventListener("mousedown", (e) => {
    if (selectedBlocks.size > 0) {
      // If clicking on a selected block
      if (selectedBlocks.has(el)) {
        isMultiDragging = true;
        multiDragOffset = {
          x: e.clientX,
          y: e.clientY
        };
      } else {
        // If clicking on an unselected block, clear previous selection
        selectedBlocks.clear();
        document.querySelectorAll('.block').forEach(block => {
          block.classList.remove('multi-selected');
        });
      }
    }

    isDragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    el.style.zIndex = 1000;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      if (isMultiDragging) {
        // Move all selected blocks
        const dx = e.clientX - multiDragOffset.x;
        const dy = e.clientY - multiDragOffset.y;
        
        selectedBlocks.forEach(block => {
          block.style.left = (block.offsetLeft + dx) + 'px';
          block.style.top = (block.offsetTop + dy) + 'px';
        });
        
        multiDragOffset.x = e.clientX;
        multiDragOffset.y = e.clientY;
      } else {
        // Move single block
        el.style.left = (e.clientX - offsetX) + 'px';
        el.style.top = (e.clientY - offsetY) + 'px';
      }
      updateConnections();
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      isMultiDragging = false;
      el.style.zIndex = "";
    }
  });
}

// Highlight the selected block
function highlightBlock(block) {
  removeHighlightFromBlocks();
  block.classList.add("selected");
}

// Remove highlight from all blocks
removeHighlightFromBlocks = function () {
  document.querySelectorAll(".block").forEach((block) => {
    block.classList.remove("selected");
  });
};

function setupSelectionBox() {
    let isSelecting = false;
    let selectionBox = null;

    // Create selection box element once
    selectionBox = document.createElement('div');
    selectionBox.className = 'selection-box';
    editor.appendChild(selectionBox);

    editor.addEventListener('mousedown', (e) => {
        // Only start selection if clicking directly on the editor background
        if (e.target === editor || e.target === svgCanvas) {
            isSelecting = true;
            const editorBounds = editor.getBoundingClientRect();
            selectionStart = {
                x: e.clientX - editorBounds.left + editor.scrollLeft,
                y: e.clientY - editorBounds.top + editor.scrollTop
            };
            
            // Show and position selection box
            selectionBox.style.display = 'block';
            selectionBox.style.left = selectionStart.x + 'px';
            selectionBox.style.top = selectionStart.y + 'px';
            selectionBox.style.width = '0';
            selectionBox.style.height = '0';
            
            // Clear existing selections
            selectedBlocks.clear();
            document.querySelectorAll('.block').forEach(block => {
                block.classList.remove('multi-selected');
            });
            
            e.preventDefault();
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isSelecting) return;
        
        const editorBounds = editor.getBoundingClientRect();
        const currentX = e.clientX - editorBounds.left + editor.scrollLeft;
        const currentY = e.clientY - editorBounds.top + editor.scrollTop;
        
        const left = Math.min(currentX, selectionStart.x);
        const top = Math.min(currentY, selectionStart.y);
        const width = Math.abs(currentX - selectionStart.x);
        const height = Math.abs(currentY - selectionStart.y);
        
        selectionBox.style.left = left + 'px';
        selectionBox.style.top = top + 'px';
        selectionBox.style.width = width + 'px';
        selectionBox.style.height = height + 'px';

        // Update selections in real-time
        const selectionRect = selectionBox.getBoundingClientRect();
        document.querySelectorAll('.block').forEach(block => {
            const blockRect = block.getBoundingClientRect();
            if (rectsOverlap(selectionRect, blockRect)) {
                selectedBlocks.add(block);
                block.classList.add('multi-selected');
            } else {
                selectedBlocks.delete(block);
                block.classList.remove('multi-selected');
            }
        });
    });

    document.addEventListener('mouseup', () => {
        if (!isSelecting) return;
        isSelecting = false;
        selectionBox.style.display = 'none';

        // Check if exactly one block is selected
        if (selectedBlocks.size === 1) {
            const selectedBlock = selectedBlocks.values().next().value;
            const blockId = selectedBlock.getAttribute("data-id");
            // Show properties panel for the single selected block
            displayProperties(blockId, currentData);
            highlightBlock(selectedBlock);
        }
    });
}

function rectsOverlap(rect1, rect2) {
    return !(rect1.right < rect2.left || 
            rect1.left > rect2.right || 
            rect1.bottom < rect2.top || 
            rect1.top > rect2.bottom);
}

// Find the lowest available ID for a new paragraph
function findLowestAvailableId() {
  const usedIds = new Set();
  currentData.story.chapters.forEach(chapter => {
    chapter.paragraphs.forEach(para => {
      usedIds.add(para.id);
    });
  });
  
  let id = 0;
  while (usedIds.has(id)) {
    id++;
  }
  return id;
}

// Create a new paragraph block
function createNewParagraph(type) {
  if (!currentData || !currentData.story || !currentData.story.chapters || currentData.story.chapters.length === 0) {
    alert('Please load a story first!');
    return;
  }

  // Find the lowest available ID
  const newId = findLowestAvailableId();

  // Create new paragraph data
  const newParagraph = {
    id: newId,
    type: type,
    text_body: "",
  };

  // We add the paragraph to the first chapter (you might want to let users choose the chapter later)
  const chapter = currentData.story.chapters[0];
  chapter.paragraphs.push(newParagraph);

  newBlockPosition.x = newBlockPosition.x > 500 ? 90 : newBlockPosition.x + 10;
  newBlockPosition.y = newBlockPosition.y > 500 ? 90 : newBlockPosition.y + 10; 

  // Create visual block
  const blockId = `paragraph-0-${chapter.paragraphs.length - 1}`;
  const headerText = headerLabel.text[type];
  const block = createBlock(blockId, headerText, newBlockPosition.x, newBlockPosition.y, true);
  
  // Add type and jsonId to the dataset
  block.dataset.type = type;
  block.dataset.jsonId = newId;

  // Add label with the paragraph ID
  createIdLabel(newId, block);

  let newParagraphText = "";
  if (type === 'interactive') {
    newParagraphText = TEXT.NEW_PARAGRAPH_INTERACTIVE;
  } else if (type === 'passThru') {
    // We add destination label for passThru blocks
    createDestIdLabel("", block);
    newParagraphText = TEXT.NEW_PARAGRAPH_PASSTHRU;
  } else if (type === 'infoBox') {
    // We add destination label for infoBox blocks
    createDestIdLabel("", block);
    newParagraphText = TEXT.NEW_PARAGRAPH_INFOBOX;
  }
  newParagraph.text_body = block.title = newParagraphText;

  // Add a label for the text_body
  createTextBodyLabel(newParagraph.text_body, block);

  // Store block reference
  blocks[blockId] = block;
  paragraphBlocksByJsonId[newId] = block;

  // Update connections
  updateConnections();
}

function createIdLabel(paraId, block){
  // Add label with the paragraph ID
  const paraIdLabel = document.createElement("div");
  paraIdLabel.classList.add("id-label");
  paraIdLabel.innerHTML = `ID: <strong>${paraId}</strong>`;
  block.appendChild(paraIdLabel);
};

function createDestIdLabel(destId, block){
  // Add label for the destination ID
  let destinationID = destId;
  if (destId === undefined){
    destinationID = "";
  }
  const destLabel = document.createElement("div");
  destLabel.classList.add("destination-label");
  destLabel.innerText = `Destination ID: ${destinationID}`;
  block.appendChild(destLabel);
}

function createTextBodyLabel(textBody, block){
  // Add a label for the text_body
  const textbodyLabel = document.createElement("div");
  textbodyLabel.classList.add("textbody-label");
  textbodyLabel.innerText = textBody;
  block.appendChild(textbodyLabel);
}