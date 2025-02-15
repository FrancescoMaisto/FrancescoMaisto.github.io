// Variables
let variableDeclaration = [];
let dynamicVars = {}; // a collection of unique objects (i.e. characterName, money, health, etc.)
let emptyUndoObject = { type: false };
let undoArray = [[emptyUndoObject]]; // Initialize undoArray with the initial element

function setDynamicVars() {
    // Cycle through the variables declaration array in the JSON file to create an object of unique dynamic variables
    variableDeclaration = storyData.story.variables;
    variableDeclaration.forEach(variable => {
        dynamicVars[variable.name] = variable.value;
    });
}
function setVariables(choice) {
    // We set dynamic variables and inventory items
    const variables = choice.variables;
    const pIndex = undoArray.push([]) - 1;

    if (variables) {
        variables.forEach(variable => {
            const { type, value, operation, name } = variable;
            let undoOperation;

            if (type === VAR_TYPE.INVENTORY_ITEM) {
                if (operation === VAR_OPERATION.ADD) {
                    inventoryArray.push(value);
                    setDynamicVariable(type, value);
                    undoOperation = VAR_OPERATION.REMOVE;
                } else if (operation === VAR_OPERATION.REMOVE) {
                    removeItemFromInventory(variable);
                    undoOperation = VAR_OPERATION.ADD;
                }
                refreshInventory();
                undoArray[pIndex].push({ type, value, operation: undoOperation });
            } else {
                const varType = getVariableType(name);
                const currentValue = varType === VAR_TYPE.NUMBER ? Number(dynamicVars[name]) : dynamicVars[name];
                const newValue = varType === VAR_TYPE.NUMBER ? Number(value) : value;

                let varValue;
                switch (operation) {
                    case VAR_OPERATION.SET:
                        varValue = value;
                        break;
                    case VAR_OPERATION.ADD:
                        varValue = currentValue + newValue;
                        break;
                    case VAR_OPERATION.REMOVE:
                        varValue = currentValue - newValue;
                        break;
                }

                undoArray[pIndex].push({ type: name, value: currentValue, operation: VAR_OPERATION.SET });
                setDynamicVariable(name, varValue);
                updateUiCounter(name, varValue);
            }
        });
    } else {
        pushEmptyUndoEntry(pIndex);
    }
}
function pushEmptyUndoEntry(pIndex) {
    undoArray[pIndex].push(emptyUndoObject);
}
function getDisplayName(variableName) {
    const variable = variableDeclaration.find(variable => variable.name === variableName);
    return variable ? variable.displayName : undefined;
}
function getVariableType(variableName) {
    const variable = variableDeclaration.find(variable => variable.name === variableName);
    return variable ? variable.type : undefined;
}
function undoVariables(pIndex) {
    // We execute an UNDO only if the player is going back to a previous paragraph
    if (pIndex < paragraphsArray.length - 1) {
        // Iterate through the undoArray from the end to pIndex + 1
        for (let i = undoArray.length - 1; i > pIndex; i--) {
            const undoSubArray = undoArray[i];

            // Process each undo item in the sub-array
            undoSubArray.forEach(undoItem => {
                // ADD/REMOVE items from the inventory
                if (undoItem.type === VAR_TYPE.INVENTORY_ITEM) {
                    if (undoItem.operation === VAR_OPERATION.ADD) {
                        inventoryArray.push(undoItem.value);
                    } else if (undoItem.operation === VAR_OPERATION.REMOVE) {
                        removeItemFromInventory(undoItem);
                    }
                    refreshInventory();
                } else {
                    setDynamicVariable(undoItem.type, undoItem.value);
                    updateUiCounter(undoItem.type, undoItem.value);
                }
            });
        }

        // Remove all elements in undoArray after pIndex + 1
        undoArray.length = pIndex + 1;
    }
}
function setDynamicVariable(name, value) {
    dynamicVars[name] = value;
    console.log("[addDynamicVariable] Setting dynamicVar: name= " + name + ", value= " + value);
}

// Undo Array

// Each entry must correspond to the paragraphsArray index
// Each entry is an object with the following properties:
// variable.type
// variable.name
// variable.value
// variable.operation

// Before working on the undoArray it would probably be best to figure out other type of variable changes and operations?
// ==================================
// VARIABLE DECLARATION
// ==================================
// variable.type (the only type existing so far is "number", "string" as "inventory" is a special case.
// variable.name
// variable.displayName
// variable.value

// ==================================
// VARIABLE CHANGE
// ==================================
// variable.type (necessary?)
// variable.name
// variable.value
// variable.operation