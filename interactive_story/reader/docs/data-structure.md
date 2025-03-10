# Data Structure of an Interactive Novel
[Markdown formatting guidelines](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)

## Table of Contents
1. [Story](#Story)
	* [Variables](#Variables)
2. [Chapter](#Chapter)
3. [Paragraph](#Paragraph)
4. [Choice](#Choice)
    * [Variables](#Variables)
    * [Conditional Destinations](#Conditional-Destinations)

## Story
A _Story_ has the following properties:

| Property | Data Type | Description |
| --- | --- | --- |
| **title** | _string_ | The title of the Story (i.e. "The Lord of the Rings"). |
| **author** | _string_ | The author of the Story (i.e. "J.R.R. Tolkien"). |
| **date** | _date_ | The date when the Story was published |
| **stylesheet** | _string_ | A Story may have a bespoke CSS stylesheet. This is the stylesheet's file name. |
| **chapterString** | _string_ | A string used for the chapters headers. (deprecated)|
| **endString** | _string_ | A string used for the end of the Story. (deprecated) |
| **inventoryString** | _string_ | a string used as the Inventory display name (i.e. "Backpack") |
| **typingSpeed** | _int_ | the default time interval between each typed letter in milliseconds (i.e. 35). If the typing speed is 0 or lower, paragraphs are displayed immediately.|
| **hasInventory** | _boolean_ | Whether or not the Story has an Inventory |
| **variables** | _object_ | An array of objects where each object represents a Story's variable. This is used to declare all the variables needed in the Story. |
| **chapters** | _array_ | An array of objects where each object represents a Chapter of the Story. |

Example:

```json
"storyTitle": "The Lord of the Rings",
"author": "J.R.R. Tolkien",
"date": "1954-07-11",
"stylesheet": "fantasy.css",
"chapterString": "Chapter",
"endString": "The End.",
"inventoryString": "Inventory",
"typingSpeed": 35,
"hasInventory":  true,
"variables": [],
"chapters": []
```

### Variables
An array of objects where each object represents a _Story_'s variable. The _Variables_ array is used to declare all the variables that are going to be used in the _Story_. Each variable object has the following properties:

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
		"value": 100,
		"displayInUI": true,
		"displayName": "Gold Pieces"
	}
]
```
## Chapter
(deprecated) A _Chapter_ is essentially a collection of _Paragraphs_.
N.B. In the current implementation a _Story_ only has one _Chapter_. This is a future-proof implementatio that leaves an open option to have multiple chapters within a _Story_.

Properties:
| Property | Data Type | Description |
| --- | --- | --- |
| **id** | _int_ | The Chapter's unique numeric identifier. |
| **title** | _string_ | The Chapter's title. |
| **paragraphs** | _array of objects_ | An array of objects where each object is a Paragraph. |

Example:

```json
"id": 0,
"title": "The Fellowship of the Ring",
"paragraphs": []
```
## Paragraph
Paragraphs are the building blocks of a _Story_. 
Paragraphs have the following properties:

| Property | Data Type | Requirement | Description |
| --- | --- | --- | --- |
| **id** | _int_ | _mandatory_ | The Paragraph's unique numeric identifier. |
| **text_body** | _string_ | _mandatory_ | The paragraph's text. Can contain HTML tags. HTML tags will be parsed and added to the complete version of the paragraph (as opposed to the paragraph typed character by character).|
| **type** | _string_ | _mandatory_ | legal values: "interactive", "passThru", "infoBox". |
| **image** | _string_ | _optional_ | the relative path to an image. The image is always displayed after the full paragraph has been shown to the reader.|
| **destination_id** | _string_ | _optional_ | only for paragraph of type "passThru" and "infoBox" (the latter when you want to display an infobox in the middle of a story)|

## Choice
A _Choice_ is an option that the user can choose from the UI list that appears when they click on a Keyword.
Each _Choice_ has a destination_id, that dictates what's the next _Paragraph_ that is going to be displayed if the user picks that particular choice.
Optionally, a _Choice_ can modify one or more _Story_ variables.

| Property | Data Type | Requirement | Description |
| --- | --- | --- | --- |
| **text_body** | _string_ | _mandatory_ | The Choice's text |
| **destination_id** | _int_ | _mandatory_ | The default Paragraph id that is going to be displayed if the user selects the Choice. This can be overridden by _conditionalDestinations_ (see below).|
| **variables** | _array of objects_ | _optional_ | An array of objects where each object represents a change to the value of a _Story_'s variable. |
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

### Variables
An optional array of objects where each object represents a change of the value of a _Story_'s variable.

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

### Conditional Destinations
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