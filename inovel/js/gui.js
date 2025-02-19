const languages = [
    { suffix: 'en', flag: '🇬🇧', displayName: 'English' },
    { suffix: 'it', flag: '🇮🇹', displayName: 'Italiano' },
    { suffix: 'ee', flag: '🇪🇪', displayName: 'Eesti' }
];
function showLanguageUI() {
    document.body.style.backgroundColor = "white";
    const content = document.getElementById('content');
    const languageSelectionScreen = document.createElement('div');
    languageSelectionScreen.className = 'language-selection-screen';
    content.appendChild(languageSelectionScreen); 

    // LOGO
    createLogo(languageSelectionScreen);

    // BUTTONS
    languages.forEach(language => {
        const button = document.createElement('button');
        button.className = "language-button";
        button.textContent = `${language.flag} ${language.displayName}`;
        button.onclick = function () {
            languageSelectionScreen.remove();
            fetchStory('stories/02/story02_' + language.suffix + '.json');
        };
        languageSelectionScreen.appendChild(button);
    });

    // FOOTER
    const footer = document.createElement('span');
    footer.className = 'footer';
    footer.textContent = '© Francesco Maisto / Cellar Ghost OÜ 2025';
    languageSelectionScreen.appendChild(footer);
}
function createLogo(parent){
    // Create an img element dynamically
    const logo = document.createElement('img');
    logo.className = 'logo';
    logo.src = 'images/favicon/web-app-manifest-512x512.png'; // Set the image source
    logo.alt = 'Logo'; // Optionally set an alt attribute
    parent.appendChild(logo);

    // Create text (name of the app)
    const appName = document.createElement('span');
    appName.className = "app-name";
    appName.textContent = 'Interactive Novel';
    parent.appendChild(appName);
}
function createNavbar() {

    const navbar = document.getElementById('navbar');

    // We create the Inventory Button
    if (storyData.story.hasInventory) {
        navbar.appendChild(createInventoryButton());
    }

    // We create variable counters
    if (storyData.story.variables) {
        storyData.story.variables.forEach(variable => {
            if (variable.displayInUI) {
                const counter = document.createElement('span');
                counter.id = variable.name;
                counter.className = "counter";
                navbar.appendChild(counter);
                updateUiCounter(variable.name, variable.value);
            }
        });
    }
}
function createInventoryButton() {
    const inventoryButton = document.createElement('a');
    inventoryButton.id = "inventory-button";
    inventoryButton.textContent = text[2] + " ▲";
    inventoryButton.href = "javascript:void(0)";
    inventoryButton.onclick = function (event) {
        event.stopPropagation();
        showInventory();
    };
    return inventoryButton;
}
function updateUiCounter(name, value) {
    const counter = document.getElementById(name);
    if (counter) {
        counter.innerHTML = `${getDisplayName(name)} <span class="counter_value">${value}</span>`;
    }
}