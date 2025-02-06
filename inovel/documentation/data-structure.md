# JSON Data Structure of a STORY in an Interactive Novel

[Markdown formatting guidelines](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)

## Story
A _Story_ is a collection of _Chapters_.

A _Story_ has the following properties:

| Property | Type | Description |
| --- | --- | --- |
| **storyTitle** | _string_ | the title of the Story |
| **author** | _string_ | the author of the story (i.e. John Snow) |
| **date** | _date_ | the date when the story was first published (i.e. 2025-01-14) |
| **stylesheet** | _string_ | the file name of the .css stylesheet (i.e. default.css) |
| **chapterName** | _string_ | a string used for the chapter denomination (i.e. Chapter) |
| **endString** | _string_ | a string used for the end of the Story (i.e. The End.) |
| **inventoryString** | _string_ | a string used for the name of the Inventory (i.e. backpack) |
| **typingSpeed** | _int_ | the default time interval between each typed letter in milliseconds (i.e. 35) |
| **hasInventory** | _boolean_ | whether or not the Story has an Inventory |
| **variables** | _object_ | an array where each element is variable. This is used to declare all the variables needed in the _Story_. Each variable is an object. |
| **chapters** | _array_ | an array where each element is a chapter |

Example:

```json
"storyTitle": "Hamlet",
"author": "William Shakespeare",
"date": "2025-01-14",
"stylesheet": "default.css",
"chapterString": "Chapter",
"endString": "The End.",
"inventoryString": "Inventory",
"typingSpeed": 35,
"hasInventory":  true,
"variables": [],
"chapters": []
```

### Variables
An array of objects where each element represents a _Story_'s variable. The _variables_ array is used to declare all the variables that are going to be used in the Story. Each variable is an object with the following properties:

| Property | Type | Description |
| --- | --- | --- |
| **type** | _string_ | the name of the variable |
| **value** | _any_ | the variable's default value |
| **displayInUI** | _boolean_ | whether or not the variable is going to be displayed in the UI |

Example:

```json
"variables": [
	{
		"type": "characterName",
		"value": "",
		"displayInUI": false
	},
	{
		"type": "money",
		"value": 100,
		"displayInUI":  true
	}
]
```
## Chapter
A _Chapter_ is essentially a collection of _Paragraphs_.

Properties:
| Property | Type | Description |
| --- | --- | --- |
| **id** | _int_ | the name of the variable |
| **title** | _any_ | the variable's default value |
| **type** | _boolean_ | legal values: "storyStart", "regular", "storyEnd" |
| **paragraphs** | _boolean_ | whether or not the variable is going to be displayed in the UI |

Example:

```json
"id": 0,
"title": "Il Cavaliere Errante",
"type": "storyStart",
"paragraphs": []
```
## Paragraph
Paragraphs are the building blocks of an Interactive Novel. 
Paragraphs can have the following properties:

| Property | Type | Description |
| --- | --- | --- |
| **id** | _int_ | the name of the variable |
| **title** | _any_ | the variable's default value |
| **type** | _boolean_ | legal values: "storyStart", "regular", "storyEnd" |
| **paragraphs** | _boolean_ | whether or not the variable is going to be displayed in the UI |

    ID (unique, no two PARAGRAPHS have the same ID)
    TEXT BODY (String)
    KEYWORD (the keyword that the player can interact with, there can only be ONE KEYWORD for every PARAGRAPH)
    CHOICES (A series of CHOICES that the player can pick from to replace the KEYWORD)
    TYPE (chapterStart, regular, passThru, storyEnd, chapterEnd)

## Choice
Each CHOICE unlocks (leads to) a PARAGRAPH within the same CHAPTER.

Properties:
>> TEXT BODY (String)
>> DESTINATION ID (the ID of the PARAGRAPH unlocked by the CHOICE)
>> DEFAULT (Boolean): whether the CHOICE is the one displayed by default when the PARAGRAPH is first shown to the player.
