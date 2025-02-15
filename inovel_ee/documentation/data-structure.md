# JSON Data Structure of a Story
[Markdown formatting guidelines](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)

## Story
A _Story_ is a collection of _Chapters_.

A _Story_ has the following properties:

| Property | Data Type | Description |
| --- | --- | --- |
| **title** | _string_ | The title of the Story. |
| **author** | _string_ | The author of the Story. |
| **date** | _date_ | The date when the story was first published |
| **stylesheet** | _string_ | The file name of the .css stylesheet. |
| **chapterName** | _string_ | A string used for the chapter name. |
| **endString** | _string_ | A string used for the end of the Story. |
| **inventoryString** | _string_ | a string used for the name of the Inventory (i.e. backpack) |
| **typingSpeed** | _int_ | the default time interval between each typed letter in milliseconds (i.e. 35) |
| **hasInventory** | _boolean_ | Whether or not the Story has an Inventory |
| **variables** | _object_ | An array of objects where each object represents a Story's variable. This is used to declare all the variables needed in the Story. |
| **chapters** | _array_ | An array of objects where each object represents a Chapter of the Story. |

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
An array of objects where each object represents a _Story_'s variable. The _variables_ array is used to declare all the variables that are going to be used in the Story. Each variable object has the following properties:

| Property | Data Type | Requirement | Description |
| --- | --- | --- | --- |
| **type** | _string_ | _mandatory_ | The variable's data type. Legal values: "string", "number". |
| **name** | _string_ | _mandatory_ | The variable's name. |
| **value** | _string_ | _mandatory_ | The variable's default value. |
| **displayInUI** | _boolean_ | _mandatory_ | Whether or not the variable is going to be displayed in the UI. |
| **displayName** | _string_ | _optional_ | The name that is going to be displayed in the UI. |

Example:

```json
"variables": [
	{
		"type": "string",
		"name": "characterName",
		"value": "",
		"displayInUI": false
	},
	{
		"type": "number",
		"name": "money",
		"displayName": "Denari",
		"value": 100,
		"displayInUI": true
	}
]
```
## Chapter
A _Chapter_ is essentially a collection of _Paragraphs_.

Properties:
| Property | Data Type | Description |
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

| Property | Data Type | Description |
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

## Choices (array)
A Choice is an option that the user can choose from the list that appears when the user clicks on a Keyword.
Each Choice typically dictates the next Paragraph that is going to be displayed.

| Property | Data Type | Requirement | Description |
| --- | --- | --- | --- |
| **text_body** | _string_ | _mandatory_ | The Choice's text |
| **destination_id** | _int_ | _mandatory_ | The default Paragraph id that is going to be displayed if the user selects the Choice. This can be overridden by _conditionalDestinations_ (see below).|
| **variables** | _array of objects_ | _optional_ | An array of objects where each object represents a change to a game's variable. |
| **conditionalDestinations** | _array of objects_ | _optional_ | An array of objects where each object represents a condition that, if met, will set a different destination id than the default one. |

Example:
```json
"choices": [
		{
			"text_body": "armor",
			"destination_id": 13,
			"variables": [],
			"conditionalDestinations": []
		},
		{
			"text_body": "sword",
			"destination_id": 14,
			"variables": [],
			"conditionalDestinations": []
		}
]
```

### Variables (array)
An optional array of objects where each object represents a request to update the value of a game's variable.

| Property | Data Type | Description |
| --- | --- | --- |
| **type** | _string_ | The type of the variable. |
| **value** | _any_ | The variable's value that is going to be updated according to the _operation_. |
| **operation** | _string_ | The type of operation to perform. Legal values: "set", "add", "subtract". |

Example:
```json
"variables": [
	{
		"type": "inventoryItem",
		"value": "sword",
		"operation": "add"
	}
]
```

### Conditional Destinations (array)
An array of objects where each object represents a condition that, if met, will set a different destination id than the default one.

| Property | Data Type | Description |
| --- | --- | --- |
| **condition** | _string_ | the type of condition. Legal values: "hasItem", "hasVisitedParagraph" |
| **value** | _any_ | the variable's value that applies to the condition |
| **destination_id** | _int_ | The id of the Paragraph that will be displayed if the condition is met |

Example
```json
"conditionalDestinations": [
	{
		"condition": "hasItem",
		"value": "corazza",
		"destination_id": 15
	}
]
```
