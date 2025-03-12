const languages = [
    { suffix: 'en', flag: '🇬🇧', displayName: 'English' },
    { suffix: 'it', flag: '🇮🇹', displayName: 'Italiano' },
    { suffix: 'ee', flag: '🇪🇪', displayName: 'Eesti' }
];

function createLanguageSelectionScreen() {
    document.body.style.backgroundColor = "white";
    const content = document.getElementById('body');
    const languageSelectionScreen = document.createElement('div');
    languageSelectionScreen.className = 'language-selection-screen';
    content.appendChild(languageSelectionScreen);

    // VERSION NUMBER
    const version = document.createElement('span');
    version.className = 'version-number';
    version.textContent = 'v ' + versionNumber;
    languageSelectionScreen.appendChild(version);

    // LOGO
    createLogo(languageSelectionScreen);

    // LANGUAGE SELECTION BUTTONS
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'buttons-container';
    languages.forEach(language => {
        const button = document.createElement('button');
        button.className = "language-button";
        button.textContent = `${language.flag} ${language.displayName}`;
        button.onclick = function () {
            languageSelectionScreen.remove();
            fetchStory('stories/test/story_' + language.suffix + '.json');
        };
        buttonsContainer.appendChild(button);
    });
    languageSelectionScreen.appendChild(buttonsContainer);

    // FOOTER
    const footer = document.createElement('span');
    footer.className = 'footer';
    footer.textContent = copyright;
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
function createStoryScreen() {

    /* LAYOUT STRUCTURE OF THE STORY SCREEN
    <body id="body">
        <div class="storyScreenContainer">
            <div id="navbar"></div>
            <div id="gui"></div>
            <div id="content">
                <p id="storyTitle"></p>
                <p id="text-container"></p>
                <div id="dropdown-list"></div>
            </div>
        </div>
    </body>
    */
    const body = document.getElementById('body');

    const storyScreenContainer = document.createElement('div');
    storyScreenContainer.className = 'story-screen-container';
    body.appendChild(storyScreenContainer);

    const navbar = document.createElement('div');
    navbar.id = 'navbar';
    storyScreenContainer.appendChild(navbar);

    const gui = document.createElement('div');
    gui.id = 'gui';
    storyScreenContainer.appendChild(gui);

    const content = document.createElement('div');
    content.id = 'content';
    storyScreenContainer.appendChild(content);

    const storyTitle = document.createElement('p');
    storyTitle.id = 'storyTitle';
    content.appendChild(storyTitle);

    const text = document.createElement('p');
    text.id = 'text-container';
    content.appendChild(text);

    const dropdownList = document.createElement('div');
    dropdownList.id = 'dropdown-list';
    content.appendChild(dropdownList);
};
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