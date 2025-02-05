function createNavbar() {
    if (storyData.story.hasInventory) {
        const inventoryButton = document.createElement('a');
        inventoryButton.id = "inventory-button";
        inventoryButton.textContent = text[2] + " ▲";
        inventoryButton.href = "javascript:void(0)";
        inventoryButton.onclick = function(event) {
            event.stopPropagation();
            showInventory();
        };
        document.getElementById('navbar').appendChild(inventoryButton);
    }
}