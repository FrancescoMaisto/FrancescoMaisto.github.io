// Constants
const panelHeader = "<div id='bg-header' ";
const panelInfo = "<p class='panel-info'>";
const property = "<p class='property'>";
const editableProperty = "<p class='property editable-property'>";
const editableSpan = " <span class='editable' ";
const themes = [
  { stylesheet: "default.css", displayname: "Default" },
  { stylesheet: "sepia.css", displayname: "Sepia" },
  { stylesheet: "spooky.css", displayname: "Spooky" },
  { stylesheet: "mint.css", displayname: "Mint" },
  { stylesheet: "dark.css", displayname: "Dark" }
];

// Flag to check if we're editing the image property
let isEditingImage = false;

let newChoicePosition = {x: 100, y: 100};

// Calculate the number of rows for a textarea based on the text length
function calculateTextareaRows(text) {
  const avgCharsPerLine = 30;
  const minRows = 3;
  const maxRows = 30;
  const rows = Math.ceil(text.length / avgCharsPerLine);
  return Math.min(Math.max(rows, minRows), maxRows);
}

function createImagePreviewIcon(editableElement, blockId, property) {
  const icon = document.createElement('span');
  icon.textContent = '👁‍🗨';
  icon.className = 'image-preview-icon';
  return icon;
}

function createEditButton(editableElement, blockId, property) {
  const button = document.createElement('button');
  button.textContent = '📝';
  button.className = 'edit-save-button';
  button.title = "Click to edit this property";
  button.onclick = (e) => {
    e.stopPropagation();
    startEditing(editableElement, blockId, property, button);
  };
  return button;
}

function createSaveButton(editableElement, blockId, property, inputElement) {
  const button = document.createElement('button');
  button.textContent = '💾';
  button.className = 'edit-save-button';
  button.title = "Click to lock this property";
  button.onclick = (e) => {
    e.stopPropagation();
    commitChanges(editableElement, blockId, property, inputElement, button);
  };
  return button;
}

function startEditing(editableElement, blockId, property, editButton) {
  const inputNeedsTextArea = blockId.startsWith('paragraph-') && (property === 'text_body' || property === 'image');

  // Hide image preview if we're editing the image property
  if (property === 'image') {
    isEditingImage = true;
    const tooltip = document.querySelector('.image-preview-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  // Create input element
  let inputElement;
  if (inputNeedsTextArea) {
    inputElement = document.createElement('textarea');
    inputElement.className = 'property-textarea';
  } else {
    inputElement = document.createElement('input');
    inputElement.className = 'property-input';
    const propertiesPanel = document.getElementById('propertiesPanel');
    const parentWidth = propertiesPanel.offsetWidth;
    inputElement.style.width = `${parentWidth - 65}px`;
  }

  inputElement.value = editableElement.innerText;
  editableElement.style.display = 'none';
  editableElement.parentNode.style.backgroundColor = '#f5ffba';
  editableElement.parentNode.insertBefore(inputElement, editableElement);
  
  // Replace edit button with save button
  const saveButton = createSaveButton(editableElement, blockId, property, inputElement);
  editButton.replaceWith(saveButton);

  if (inputNeedsTextArea) {
    const rows = calculateTextareaRows(editableElement.innerText);
    inputElement.rows = rows;
  } else {
    inputElement.select();
  }  
  
  inputElement.focus();

  // Handle Enter key
  inputElement.addEventListener('keydown', function(event) {
    if ((event.key === 'Enter' && !inputNeedsTextArea) || 
        (event.key === 'Enter' && event.ctrlKey && inputNeedsTextArea)) {
      commitChanges(editableElement, blockId, property, inputElement, saveButton);
    }
  });
}

function commitChanges(editableElement, blockId, property, inputElement, saveButton) {
  editableElement.innerText = inputElement.value;
  updateDataFromPanel(blockId, property, inputElement.value);
  editableElement.parentNode.style.backgroundColor = '#fdfdfd';
  inputElement.remove();
  
  // Replace save button with edit button
  const editButton = createEditButton(editableElement, blockId, property);
  saveButton.replaceWith(editButton);

  if (property === 'image') {
    editableElement.style.display = 'block'; // we need this for the text truncation to work
    isEditingImage = false; // Re-enable image preview if we were editing the image property
  } else {
    editableElement.style.display = 'inline';
  }
}

// Function to create a new Choice block
function createNewChoice(paragraphBlock) {
  // Find the paragraph data in currentData
  const paragraphId = paragraphBlock.dataset.jsonId;
  let targetParagraph;
  let chapterIndex, paragraphIndex;

  // Search through chapters to find the paragraph
  currentData.story.chapters.forEach((chapter, cIndex) => {
    chapter.paragraphs.forEach((para, pIndex) => {
      if (para.id.toString() === paragraphId) {
        targetParagraph = para;
        chapterIndex = cIndex;
        paragraphIndex = pIndex;
      }
    });
  });

  if (!targetParagraph) return;

  // Initialize choices array if it doesn't exist
  if (!targetParagraph.choices) {
    targetParagraph.choices = [];
  }

  newChoicePosition.x = newChoicePosition.x < -200 ? 100 : newChoicePosition.x - 15;
  newChoicePosition.y = newChoicePosition.y > 300 ? 100 : newChoicePosition.y + 15;

  // Create new choice data
  const newChoice = {
    text_body: "New Choice",
    destination_id: "",
    position: [
      parseInt(paragraphBlock.style.left) + newChoicePosition.x,
      parseInt(paragraphBlock.style.top) + newChoicePosition.y
    ]
  };

  // Add choice to the data structure
  targetParagraph.choices.push(newChoice);

  // Create visual block for the new choice with flash enabled
  const choiceId = `choice-${chapterIndex}-${paragraphIndex}-${targetParagraph.choices.length - 1}`;
  const choiceBlock = createBlock(
    choiceId, 
    "Choice", 
    newChoice.position[0], 
    newChoice.position[1],
    true  // Add this parameter to enable flashing
  );

  // Setup choice block properties
  choiceBlock.dataset.destId = newChoice.destination_id;
  blocks[choiceId] = choiceBlock;

  // Add labels to the choice block
  const keywordLabel = document.createElement("div");
  keywordLabel.classList.add("keyword-label");
  keywordLabel.innerText = newChoice.text_body;
  choiceBlock.appendChild(keywordLabel);

  const destLabel = document.createElement("div");
  destLabel.classList.add("destination-label");
  destLabel.innerText = "Destination ID: " + newChoice.destination_id;
  choiceBlock.appendChild(destLabel);

  // Add connection from paragraph to new choice
  connections.push({
    from: getBlockId(paragraphBlock),
    to: choiceId
  });

  // Update the visual connections
  updateConnections();
}

function displayProperties(blockId) {
  const propertiesPanel = document.getElementById('propertiesPanel');
  // Clear previous content but keep the close button
  propertiesPanel.innerHTML = '<button id="closePropertiesPanel" class="close-button">X</button>';
  setPropertiesPanelVisibility(true);

  if (blockId === 'story') {
    // =======================================================
    // STORY
    // =======================================================
    let storyProperties = `
      ${panelHeader}class="bg-story">${headerLabel.emoji.story} ${headerLabel.text.story}</div>
      ${editableProperty}<strong>Title:</strong>${editableSpan}data-property="title">${currentData.story.title}</span></p>
      ${editableProperty}<strong>Author:</strong>${editableSpan}data-property="author">${currentData.story.author}</span></p>
      ${editableProperty}<strong>Date:</strong>${editableSpan}data-property="date">${currentData.story.date}</span></p>
      ${editableProperty}<strong>Typing Speed:</strong>${editableSpan}data-property="typingSpeed">${currentData.story.typingSpeed}</span></p>
      ${editableProperty}<strong>Start from ID:</strong>${editableSpan}data-property="starting_id">${currentData.story.starting_id}</span></p>
      ${editableProperty}<strong>Theme:</strong><select class='dropdown' data-property="stylesheet"></select></p>
    `;

    if (currentData.story.hasInventory && currentData.story.hasInventory !== undefined) {
      storyProperties += `${editableProperty}<strong>Has Inventory:</strong>${editableSpan}data-property="hasInventory">${currentData.story.hasInventory}</span></p>`;
    }
    if (currentData.story.hasInventory) {
      storyProperties += `${editableProperty}<strong>Inventory Name:</strong>${editableSpan}data-property="inventoryName">${currentData.story.inventoryName}</span></p>`;
      storyProperties += `${editableProperty}<strong>Inventory Empty:</strong>${editableSpan}data-property="inventoryEmpty">${currentData.story.inventoryEmpty}</span></p>`;
    }
    propertiesPanel.innerHTML += storyProperties;

    setupStylesheetDropdown();
  } else if (blockId.startsWith('chapter-')) {
    // =======================================================
    // CHAPTER
    // =======================================================
    const chapterIndex = parseInt(blockId.split('-')[1]);
    const chapter = currentData.story.chapters[chapterIndex];
    let chapterProperties = `
      ${panelHeader}class="bg-chapter">${headerLabel.emoji.chapter} ${headerLabel.text.chapter}</div>
    `;
    propertiesPanel.innerHTML += chapterProperties;
  } else if (blockId.startsWith('paragraph-')) {
    // =======================================================
    // PARAGRAPH
    // =======================================================
    const [ , chapterIndex, paragraphIndex] = blockId.split('-').map(Number);
    const paragraph = currentData.story.chapters[chapterIndex].paragraphs[paragraphIndex];
    let headerText;
    let infoText;
    let choiceProperty = '';
    let headerColor;
    if (paragraph.type === 'interactive') {
      infoText = `${headerLabel.text.interactive}`;
      headerText = `${headerLabel.emoji.interactive} ${headerLabel.text.interactive}`;
      headerColor = 'bg-interactive';
      // choiceProperty = `${property}<strong>Choices:</strong>${editableSpan}data-property="type">${paragraph.choices ? paragraph.choices.length : 0}</span></p>`;
    } else if (paragraph.type === 'passThru') {
      infoText = `${headerLabel.text.passThru}`;
      headerText = `${headerLabel.emoji.passThru} ${headerLabel.text.passThru}`;
      headerColor = 'bg-passthru';
    } else if (paragraph.type === 'infoBox'){
      infoText = `${headerLabel.text.infoBox}`;
      headerText = `${headerLabel.emoji.infoBox} ${headerLabel.text.infoBox}`;
      headerColor = 'bg-infobox';
    }
    let paragraphProperties = `
      ${panelHeader}class="${headerColor}">${headerText}</div>
      ${property}<strong>ID:</strong>${editableSpan}data-property="id">${paragraph.id}</span></p>
      ${choiceProperty}
      ${editableProperty}<strong>Text:</strong><br>${editableSpan}data-property="text_body"></span></p>
      ${editableProperty}<strong>Image:</strong>${editableSpan}data-property="image">${(paragraph.image)}</span></p>
    `;
    // If paragraph type is "passThru" or "infoBox", include Destination ID property.
    if (paragraph.type === 'passThru' || paragraph.type === 'infoBox') {
      paragraphProperties += `${editableProperty}<strong>Destination ID:</strong>${editableSpan}data-property="destination_id">${paragraph.destination_id || ""}</span></p>`;
    }
    propertiesPanel.innerHTML += paragraphProperties;

    // we replace the Text Body element content with the actual text body to preserve simple HTML formatting
    const textBodyElement = document.querySelector('[data-property="text_body"]');
    if (textBodyElement) {
      textBodyElement.textContent = paragraph.text_body;
    }

    // id and destination_id validation (for debugging purposes)
    const  idElement = document.querySelector('[data-property="id"]');
    let  destIdElement = document.querySelector('[data-property="destination_id"]');
    validateUInt(idElement, paragraph.id);
    if (paragraph.type !== 'infoBox') {
      validateUInt(destIdElement, paragraph.destination_id);
    }
  } else if (blockId.startsWith('choice-')) {
    // =======================================================
    // CHOICE
    // =======================================================
    const [ , chapterIndex, paragraphIndex, choiceIndex] = blockId.split('-').map(Number);
    const choice = currentData.story.chapters[chapterIndex].paragraphs[paragraphIndex].choices[choiceIndex];
    propertiesPanel.innerHTML += `
      ${panelHeader}class="bg-choice">${headerLabel.emoji.choice} ${headerLabel.text.choice}</div>
      ${editableProperty}<strong>Text:</strong>${editableSpan}data-property="text_body">${choice.text_body}</span></p>
      ${editableProperty}<strong>Destination ID:</strong>${editableSpan}data-property="destination_id">${choice.destination_id}</span></p>
    `;

    // We validate the destination_id
    destIdElement = document.querySelector('[data-property="destination_id"]');
    validateUInt(destIdElement, choice.destination_id);
  }

  // Re-add event listener for the close button
  document.getElementById('closePropertiesPanel').addEventListener('click', () => {
    removeHighlightFromBlocks();
    setPropertiesPanelVisibility(false);
  });

  // Add event listeners to make input type properties editable
  document.querySelectorAll('.editable-property').forEach(element => {
    const editableElement = element.querySelector('.editable');
    if (editableElement){
      const property = editableElement.getAttribute('data-property');
      const editButton = createEditButton(editableElement, blockId, property);
      editableElement.parentNode.appendChild(editButton);

      // We add an image preview icon to the image property
      if (blockId.startsWith('paragraph-') && property === 'image') {
        const imagePreviewIcon = createImagePreviewIcon(editableElement, blockId, property);
        editableElement.parentNode.appendChild(imagePreviewIcon); 
      }
    }
  });

  // Setup image preview tooltip
  setupImagePreview();

  // Create container for both buttons
  const buttonsContainer = document.createElement('div');
  buttonsContainer.classList.add('panel-buttons-container');
  
  // Add buttons only if this is not a Story block
  if (blockId !== 'story') {
    // Get block for checking type
    const block = document.querySelector(`[data-id="${blockId}"]`);
    
    // Add Choice button (if block is interactive)
    if (block && block.dataset.type === 'interactive') {
      const newChoiceButton = document.createElement('button');
      newChoiceButton.innerText = TEXT.BUTTON_ADD_CHOICE;
      newChoiceButton.title = TEXT.BUTTON_ADD_CHOICE_TOOLTIP;
      newChoiceButton.classList.add('new-choice-button');
      newChoiceButton.addEventListener('click', () => createNewChoice(block));
      buttonsContainer.appendChild(newChoiceButton);
    }
    
    // Add Delete button
    const deleteButton = document.createElement('button');
    deleteButton.innerText = TEXT.BUTTON_DELETE;
    deleteButton.title = TEXT.BUTTON_DELETE_TOOLTIP;
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', () => deleteBlock(blockId));
    buttonsContainer.appendChild(deleteButton);
  }
  
  propertiesPanel.appendChild(buttonsContainer);
}

function setupStylesheetDropdown(){
  // Setting up the Stylesheet dropdown (select) element
  const dropdownElement = document.querySelector('[data-property="stylesheet"]');

  themes.forEach(({ stylesheet: stylesheet, displayname }) => {
      let option = document.createElement("option");
      option.value = stylesheet;
      option.textContent = displayname;
      dropdownElement.appendChild(option);
  });

  // Setting the current stylesheet as the selected one in the dropdown element
  dropdownElement.value = currentData.story['stylesheet'];

  // Add an event listener
  dropdownElement.addEventListener("change", function () {
    currentData.story['stylesheet'] = this.value;
    console.log("Stylesheet:",  currentData.story['stylesheet']);
  });

  console.log("Stylesheet:",  currentData.story['stylesheet']);
}

// Handles changes to the data object when properties are edited in the Properties Panel
function updateDataFromPanel(blockId, property, newValue) {
  // *******************************************************
  // STORY
  // *******************************************************
  if (blockId === 'story') {
    if (property === 'typingSpeed' || property === "starting_id") {
      newValue = Number(newValue);
    } else if (property === 'hasInventory') {
      newValue = (newValue.toLowerCase() === 'true');
    } else if (property === 'title') {
      updateLabel(blockId, "keyword-label", newValue);
    }else if (property === 'author') {
      updateLabel(blockId, "destination-label", newValue);
    }
    currentData.story[property] = newValue;

    if (property === "starting_id"){      
      // We validate the starting ID
      startingIdElement = document.querySelector('[data-property="starting_id"]');
      validateUInt(startingIdElement, newValue);      
      updateStoryConnection();
      updateConnections();
    }
  } 
  // *******************************************************
  // CHAPTER
  // -------------------------------------------------------
  // Chapter blocks: blockId format "chapter-<index>"
  // *******************************************************
  else if (blockId.startsWith('chapter-')) {
    /*
    const chapterIndex = parseInt(blockId.split('-')[1]);
    if (property === 'id') {
      newValue = Number(newValue);
      currentData.story.chapters[chapterIndex][property] = newValue;
      // Update the UI id-label to be "ID: " followed by newValue.
      const blockElem = document.querySelector(`.block[data-id="${blockId}"]`);
      if (blockElem) {
        const idLabel = blockElem.querySelector('.id-label');
        if (idLabel) {
          idLabel.innerText = "ID: " + newValue;
        }
      }
    } else if (property === 'title') {
      currentData.story.chapters[chapterIndex][property] = newValue;
      // Update the UI type-label to be "Type: " followed by newValue.
      const blockElem = document.querySelector(`.block[data-id="${blockId}"]`);
      if (blockElem) {
        const typeLabel = blockElem.querySelector('.type-label');
        if (typeLabel) {
          typeLabel.innerText = newValue;
        }
      }
    } else {
      currentData.story.chapters[chapterIndex][property] = newValue;
    }
    */
  }
  // *******************************************************
  // PARAGRAPH
  // -------------------------------------------------------
  // Paragraph blocks: blockId format "paragraph-<chapterIndex>-<paragraphIndex>"
  // *******************************************************
  else if (blockId.startsWith('paragraph-')) {
  const [ , chapterIndex, paragraphIndex] = blockId.split('-').map(Number);
  if (property === 'destination_id') {

    // Only add destination_id to currentData if the value is NOT empty/null/undefined
    if (!newValue || newValue.trim() === "") {
      delete currentData.story.chapters[chapterIndex].paragraphs[paragraphIndex][property];
    } else {
      currentData.story.chapters[chapterIndex].paragraphs[paragraphIndex][property] = newValue;
    }

    destIdElement = document.querySelector('[data-property="destination_id"]');
    validateUInt(destIdElement, newValue);

    // Update UI element in the Paragraph block
    const blockElem = document.querySelector(`.block[data-id="${blockId}"]`);
    if (blockElem) {
      let destLabel = blockElem.querySelector('.destination-label');
      blockElem.dataset.destId = newValue || "";
      if (destLabel) {
        destLabel.innerText = "Destination ID: " + (newValue || "");
      }
      updateConnections();
    }
  } else if (property === 'image') {
    if (newValue === "undefined" || newValue.trim() === "") {
      delete currentData.story.chapters[chapterIndex].paragraphs[paragraphIndex][property];
    } else {
      currentData.story.chapters[chapterIndex].paragraphs[paragraphIndex][property] = newValue;
    }
  } else if (property === 'text_body') {
    // Update data
    currentData.story.chapters[chapterIndex].paragraphs[paragraphIndex][property] = newValue;    
    updateLabel(blockId, "textbody-label", newValue, true);
  } else {
    currentData.story.chapters[chapterIndex].paragraphs[paragraphIndex][property] = newValue;
  }
}
  // *******************************************************
  // CHOICE
  // -------------------------------------------------------
  // Choice blocks: blockId format "choice-<chapterIndex>-<paragraphIndex>-<choiceIndex>"
  // *******************************************************
  else if (blockId.startsWith('choice-')) {
    const [ , chapterIndex, paragraphIndex, choiceIndex] = blockId.split('-').map(Number);
    currentData.story.chapters[chapterIndex].paragraphs[paragraphIndex].choices[choiceIndex][property] = newValue;
    // If updating destination_id, update the UI element with "Destination ID: " prefix
    if (property === 'destination_id') {
      const blockElem = document.querySelector(`.block[data-id="${blockId}"]`);
      if (blockElem) {
        blockElem.dataset.destId = newValue;
        const destLabel = blockElem.querySelector('.destination-label');
        if (destLabel) {
          destLabel.innerText = "Destination ID: " + newValue;
        }

        destIdElement = document.querySelector('[data-property="destination_id"]');
        validateUInt(destIdElement, newValue);

        updateConnections();
      }
    } else if (property === 'text_body') {
      updateLabel(blockId, "keyword-label", newValue);
    }
  }
}

function setConfirmationDialogText(type){
  // Set the text for the confirmation dialog
  const dialogHeader = document.getElementById('dialogHeader');
  const dialogMessage = document.getElementById('dialogMessage');
  const dialogOK = document.getElementById('dialogOK');
  const dialogCancel = document.getElementById('dialogCancel');

  if (type === 'deleteBlock') {
    dialogHeader.innerText = TEXT.DIALOG_HEADER_DELETE;
    dialogMessage.innerHTML = TEXT.DIALOG_MESSAGE_DELETE;
  } else if (type === 'newStory') {
    dialogHeader.innerText = TEXT.DIALOG_HEADER_NEWSTORY;
    dialogMessage.innerHTML = TEXT.DIALOG_MESSAGE_NEWSTORY; 
  }
  dialogOK.innerText = TEXT.DIALOG_BUTTON_OK;
  dialogCancel.innerText = TEXT.DIALOG_BUTTON_CANCEL;
}

// Showing a confirmation dialog
function showConfirmationDialog(onConfirm) {
  // Get dialog elements
  const overlay = document.getElementById('dialogOverlay');
  const dialog = document.getElementById('confirmationDialog');
  const cancelBtn = document.getElementById('dialogCancel');
  const okBtn = document.getElementById('dialogOK');

  // Show overlay and dialog
  overlay.style.display = 'block';
  dialog.style.display = 'block';

  // Handle button clicks
  const handleCancel = () => {
    overlay.style.display = 'none';
    dialog.style.display = 'none';
    cleanup();
  };

  const handleConfirm = () => {
    overlay.style.display = 'none';
    dialog.style.display = 'none';
    cleanup();
    onConfirm();
  };

  // Cleanup function to remove event listeners
  const cleanup = () => {
    cancelBtn.removeEventListener('click', handleCancel);
    okBtn.removeEventListener('click', handleConfirm);
  };

  // Add event listeners
  cancelBtn.addEventListener('click', handleCancel);
  okBtn.addEventListener('click', handleConfirm);
}

function deleteBlock(blockId) {
  setConfirmationDialogText("deleteBlock");
  showConfirmationDialog(() => {
    const block = document.querySelector(`[data-id="${blockId}"]`);
    if (!block) return;

    if (blockId.startsWith('paragraph-')) {
      const [, chapterIndex, paragraphIndex] = blockId.split('-').map(Number);
      const paragraphId = currentData.story.chapters[chapterIndex].paragraphs[paragraphIndex].id;
      
      // Remove paragraph from currentData
      const paragraph = currentData.story.chapters[chapterIndex].paragraphs.splice(paragraphIndex, 1)[0];
      delete paragraphBlocksByJsonId[paragraphId];
      
      // Remove all choice blocks associated with the deleted paragraph block, if any
      if (paragraph.choices) {
        paragraph.choices.forEach((_, choiceIndex) => {
          const choiceId = `choice-${chapterIndex}-${paragraphIndex}-${choiceIndex}`;
          const choiceBlock = blocks[choiceId];
          if (choiceBlock) {
            choiceBlock.remove();
            delete blocks[choiceId];
          }
        });
      }
      
      // Update remaining paragraph block IDs
      currentData.story.chapters[chapterIndex].paragraphs.forEach((para, newIndex) => {
        if (newIndex >= paragraphIndex) {
          const oldId = `paragraph-${chapterIndex}-${newIndex + 1}`;
          const newId = `paragraph-${chapterIndex}-${newIndex}`;
          const paraBlock = blocks[oldId];
          if (paraBlock) {
            paraBlock.setAttribute('data-id', newId);
            blocks[newId] = paraBlock;
            delete blocks[oldId];
            
            // Update choice blocks for this paragraph
            if (para.choices) {
              para.choices.forEach((_, choiceIndex) => {
                const oldChoiceId = `choice-${chapterIndex}-${newIndex + 1}-${choiceIndex}`;
                const newChoiceId = `choice-${chapterIndex}-${newIndex}-${choiceIndex}`;
                const choiceBlock = blocks[oldChoiceId];
                if (choiceBlock) {
                  choiceBlock.setAttribute('data-id', newChoiceId);
                  blocks[newChoiceId] = choiceBlock;
                  delete blocks[oldChoiceId];
                }
              });
            }
          }
        }
      });
    } else if (blockId.startsWith('choice-')) {
      const [, chapterIndex, paragraphIndex, choiceIndex] = blockId.split('-').map(Number);
      // Remove choice from currentData
      currentData.story.chapters[chapterIndex].paragraphs[paragraphIndex].choices.splice(choiceIndex, 1);
      
      // Update remaining choice block IDs for this paragraph
      const paragraph = currentData.story.chapters[chapterIndex].paragraphs[paragraphIndex];
      paragraph.choices.forEach((_, newIndex) => {
        if (newIndex >= choiceIndex) {
          const oldId = `choice-${chapterIndex}-${paragraphIndex}-${newIndex + 1}`;
          const newId = `choice-${chapterIndex}-${paragraphIndex}-${newIndex}`;
          const choiceBlock = blocks[oldId];
          if (choiceBlock) {
            choiceBlock.setAttribute('data-id', newId);
            blocks[newId] = choiceBlock;
            delete blocks[oldId];
          }
        }
      });
    }

    // Remove from blocks object and DOM
    delete blocks[blockId];
    block.remove();
    
    // Update connections
    connections = connections.filter(conn => 
      conn.from !== blockId && conn.to !== blockId
    );
    
    updateConnections();
    
    // Hide properties panel
    setPropertiesPanelVisibility(false);
  });
}

function setupImagePreview() {
  const imageProperty = document.querySelector('[data-property="image"]');
  if (!imageProperty) return;

  const imagePreviewIcon = imageProperty.parentElement.querySelector('.image-preview-icon');
  if (!imagePreviewIcon) return;

  let tooltip = document.querySelector('.image-preview-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'image-preview-tooltip';
    document.body.appendChild(tooltip);
  }   

  imagePreviewIcon.addEventListener('mouseover', (e) => {
    // Don't show preview if we're editing
    if (isEditingImage) return;

    const imagePath = imageProperty.textContent;
    if (imagePath) {
      const img = new Image();
      img.onload = () => {
        tooltip.className = 'image-preview-tooltip';
        tooltip.style.backgroundImage = `url(${imagePath})`;
        tooltip.textContent = '';
        
        // Calculate dimensions while maintaining aspect ratio
        const aspectRatio = img.height / img.width;
        const width = Math.min(200, img.width);
        const height = width * aspectRatio;
        
        tooltip.style.width = `${width}px`;
        tooltip.style.height = `${height}px`;
        
        // Check if tooltip would go beyond right viewport edge
        const viewportWidth = window.innerWidth;
        const tooltipWidth = width + 10; // Add padding/margin
        const shouldShowOnLeft = (e.clientX + tooltipWidth > viewportWidth);
        
        // Position tooltip either left or right of cursor
        tooltip.style.left = shouldShowOnLeft ? 
          `${e.clientX - tooltipWidth}px` : 
          `${e.clientX + 10}px`;
          
        tooltip.style.top = `${e.clientY + 20}px`;
        tooltip.style.display = 'block';
      };
      
      img.onerror = () => {
        tooltip.className = 'image-preview-tooltip error';
        tooltip.style.backgroundImage = 'none';
        tooltip.textContent = '⛔ Image not found';
        tooltip.style.width = '120px';
        tooltip.style.height = '20px';
        tooltip.style.left = `${e.clientX - 120}px`;
        tooltip.style.top = `${e.clientY + 20}px`;
        tooltip.style.display = 'block';
      };
      img.src = imagePath;
    } else {
      tooltip.style.display = 'none';
    }
  });

  imagePreviewIcon.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });
}

/* Helper function that checks if a variable is a valid unsigned integer 
and updates the color of its text field */
function validateUInt(textField, variable){
  if (textField) {
    // Regular expression to match an unsigned integer
    var unsignedIntegerRegex = /^\d+$/;
    if (unsignedIntegerRegex.test(variable)) {
      //textField.parentNode.style.backgroundColor = '#d4ffb8';
      textField.parentNode.style.color = 'black';
    } else {
      textField.parentNode.style.color = 'red';
    }
    textField.textContent = variable;
  }
}

function setPropertiesPanelVisibility(visible){
  const propertiesPanel = document.getElementById('propertiesPanel');
  propertiesPanel.style.display = visible ? 'block' : 'none';
}