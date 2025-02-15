function createNavbar() {

    const navbar = document.getElementById('navbar');

    // We create the Inventory Button
    if (storyData.story.hasInventory) {
        const inventoryButton = document.createElement('a');
        inventoryButton.id = "inventory-button";
        inventoryButton.textContent = text[2] + " ▲";
        inventoryButton.href = "javascript:void(0)";
        inventoryButton.onclick = function(event) {
            event.stopPropagation();
            showInventory();
        };
        navbar.appendChild(inventoryButton);
    }

    // We create variable counters
    if (storyData.story.variables) {
        storyData.story.variables.forEach(variable => {
            if (variable.displayInUI) {
                let counter = document.createElement('span');
                counter.id = variable.name;
                counter.className = "counter";
                navbar.appendChild(counter);
                updateUiCounter(variable.name, variable.value);
            }
        });
    }
}
function updateUiCounter(name, value) {
    const counter = document.getElementById(name);
    if (counter) {
        counter.innerHTML = `${getDisplayName(name)} <span class="counter_value">${value}</span>`;
    }
}