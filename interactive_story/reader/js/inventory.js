let inventoryArray = []; // An array containing all inventory items
function toggleInventory(show) {
    const invDiv = document.getElementById('inventory');
    const inventoryButton = document.getElementById('inventory-button');
    const guiElement = document.getElementById('gui');
    const navBar = document.getElementById('navbar');
    const position = show ? navBar.offsetHeight + guiElement.offsetHeight : navBar.offsetHeight - guiElement.offsetHeight;

    if (show) {
        console.log("[toggleInventory] Showing inventory panel");
        inventoryButton.textContent = text[2] + " ▼";
        inventoryButton.className = "active";

        const newInvDiv = document.createElement('div');
        newInvDiv.id = 'inventory';

        if (inventoryArray.length <= 0) {
            const emptyLabel = document.createElement('p');
            emptyLabel.textContent = text[3];
            emptyLabel.className = 'inventory-empty';
            newInvDiv.appendChild(emptyLabel);
        } else {
            populateInventory(newInvDiv);
        }

        document.getElementById('gui').appendChild(newInvDiv);
    } else {
        console.log("[toggleInventory] Hiding inventory panel");
        inventoryButton.textContent = text[2] + " ▲";
        inventoryButton.className = "";
        setTimeout(() => invDiv.remove(), 500); // Hide the GUI element after a short delay
    }

    guiElement.style.top = position + 'px';
}
function showInventory() {
    let invDiv = document.getElementById('inventory');
    toggleInventory(!invDiv);
}
function createInventoryPanel() {
    toggleInventory(true);
}function playerHasItemInInventory(itemName) {
    return inventoryArray.includes(itemName);
}
function populateInventory(invDiv) {
    // Iterates over the inventory array to create the items elements
    inventoryArray.forEach(item => {
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
function refreshInventory() {
    // Updates the inventory content in case the inventory is visible when the player picks up an item
    const invDiv = document.getElementById('inventory');
    if (invDiv) {
        invDiv.remove();
        createInventoryPanel();
    }
}
function removeItemFromInventory(item) {
    const index = inventoryArray.indexOf(item.value);
    if (index !== -1) {
        inventoryArray.splice(index, 1);
        console.log(`[removeItemFromInventory] Removed inventory item: ${item.value}`);
    }
}