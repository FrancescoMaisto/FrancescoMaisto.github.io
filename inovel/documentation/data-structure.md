==============================================================================
JSON Data Structure of a STORY in an Interactive Novel
==============================================================================

==============
STORY
--------------
A STORY is a collection of CHAPTERS

Properties:

	"name": "Diplomazia nella Via Lattea",
	"author": "Francesco Maisto",
	"publishedOn": "2025-01-14",
	"chapterName": "Incontro",
	"endString": "Fine."
    "chapters": array of CHAPTERS
    "variables": array of VARIABLES

==============
CHAPTER
--------------
A CHAPTER is a collection of PARAGRAPHS

Properties:

    id (int)
    title (string)
    type (legal values: "storyStart", "regular", "storyEnd")
    paragraphs (array of PARAGRAPHS)

==============
PARAGRAPH
--------------
Properties:

    ID (unique, no two PARAGRAPHS have the same ID)
    TEXT BODY (String)
    KEYWORD (the keyword that the player can interact with, there can only be ONE KEYWORD for every PARAGRAPH)
    CHOICES (A series of CHOICES that the player can pick from to replace the KEYWORD)
    TYPE (chapterStart, regular, passThru, storyEnd, chapterEnd)

==============
CHOICE
--------------
Each CHOICE unlocks (leads to) a PARAGRAPH within the same CHAPTER.

Properties:
>> TEXT BODY (String)
>> DESTINATION ID (the ID of the PARAGRAPH unlocked by the CHOICE)
>> DEFAULT (Boolean): whether the CHOICE is the one displayed by default when the PARAGRAPH is first shown to the player.

==============================================================================
FEATURES
==============================================================================
[X] When the player clicks anywhere on the screen, the paragraph text is immediately replaced by the HTML txt.
[X] Ability to load a JSON file locally
[X] Add to Git
[X] Declaring, Setting and Getting variables
[X] Pass-through paragraphs
[X] Ability to add an image to a paragraph.
[X] Ability to choose between different themes
[X] Ability to have the same paragraph displayed multiple times in the story
[X] BUG: When the same paragraph shows more than once in the story, the choices dropdown doesn't open anymore
[X] BUG: When resizing window the drop down sticks to the wrong keyword
[ ] Conditional destinations based on whether the player has a certain item (i.e. a key)
[ ] Conditional destinations based on whether a variable has a certain value (i.e. money > 100)
[ ] Iron Man mode. The player cannot go back to previous paragraphs
[ ] Multiple Chapters
[ ] Multiple Stories (Main Menu)
[ ] Settings menu (typing speed/theme/show images?)

==============================================================================
LOCAL server
==============================================================================

Yes, you can create and run a local server using Visual Studio 2022! Visual Studio provides a powerful integrated development environment (IDE) that can streamline your development process. While it's more commonly associated with ASP.NET projects, you can also use it for Node.js development. Here's how you can set up a local server:

1. **Install Visual Studio 2022**: If you haven't already, you can download and install Visual Studio 2022 from the [official website](https://visualstudio.microsoft.com/).

2. **Install Node.js**: Ensure Node.js is installed on your computer. You can download it from the [Node.js website](https://nodejs.org/).

3. **Install Node.js Development Workload**: When setting up Visual Studio 2022, make sure to select the "Node.js development" workload. This will install the necessary tools and templates for Node.js projects.

4. **Create a New Project**:
    - Open Visual Studio 2022.
    - Click on "Create a new project."
    - Search for "Node.js" in the project templates and select "Node.js Express 4 Application."
    - Follow the prompts to name your project and choose a location.

5. **Configure Your Project**:
    - Visual Studio will create a project with a basic Express server setup.
    - You can find the main server file (`app.js` or `server.js`) and the `public` folder where you can place your static files.

6. **Add Your Files**:
    - Place your HTML, CSS, and JavaScript files in the `public` folder.
    - You can also create routes and additional server logic in the server file.

7. **Run the Server**:
    - In Visual Studio, open the Solution Explorer and right-click on your project.
    - Select "Set as StartUp Project."
    - Click the "Run" button or press F5 to start the server.
    - Your local server will start, and you can access it in your web browser at `http://localhost:3000` (or the port specified in your server file).

Visual Studio 2022 makes it easy to manage and run your Node.js projects with integrated debugging, IntelliSense, and other helpful features. If you encounter any issues or need further assistance, feel free to ask! 😊