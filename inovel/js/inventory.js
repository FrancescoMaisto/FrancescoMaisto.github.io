function showInventory() {
    let invDiv = document.getElementById('inventory');
    let inventoryButton = document.getElementById('inventory-button');
    let guiElement = document.getElementById('gui');
    let navBar = document.getElementById('navbar');
    let position;

    if (invDiv) {
        console.log("Removing inventory");
        position = navBar.offsetHeight - guiElement.offsetHeight;
        inventoryButton.textContent = text[2] + " ▲";
        inventoryButton.className = "";        
        setTimeout(() => {
            invDiv.remove(); // Show the GUI element after a short delay
        }, 500); // Short delay to ensure the transition is applied
    } else {
        console.log("Showing inventory");
        position = navBar.offsetHeight + guiElement.offsetHeight;
        inventoryButton.textContent = text[2] + " ▼";
        inventoryButton.className = "active";
        invDiv = document.createElement('div');
        invDiv.id = 'inventory';
        if (inventory.length <= 0) {
            // if the inventory is empty
            const emptyLabel = document.createElement('p');
            emptyLabel.textContent = text[3];
            emptyLabel.className = 'inventory-empty';
            invDiv.appendChild(emptyLabel);
        } else {
            populateInventory(invDiv);
        }
        document.getElementById('gui').appendChild(invDiv);
    }
    guiElement.style.top = position + 'px';
}
function updateInventory() {
    // Updates the inventory content in case the inventory is visible when the player picks up an item
    let invDiv = document.getElementById('inventory');
    if (invDiv) {
        invDiv.remove();
        invDiv = document.createElement('div');
        invDiv.id = 'inventory';
        populateInventory(invDiv);
        document.getElementById('gui').appendChild(invDiv);
    }
}
function populateInventory(invDiv) {
    // Iterates over the inventory array to create the items elements
    inventory.forEach(item => {
        const i = document.createElement('a');
        i.className = 'inventory-item';
        i.textContent = item;
        i.href = "javascript:void(0)";
        i.onclick = function (event) {
            event.stopPropagation();
        };
        invDiv.appendChild(i);
    });
}