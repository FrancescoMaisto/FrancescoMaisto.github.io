class TEXT {
    static DIALOG_HEADER_DELETE = "Delete Block?";
    static DIALOG_HEADER_NEWSTORY = "Start a new story?";
    static DIALOG_MESSAGE_DELETE = "Are you sure you want to delete this block?";
    static DIALOG_MESSAGE_NEWSTORY = "Starting a new story will delete the current story.<br>Make sure to save the current story if you want to keep it.";
    static DIALOG_BUTTON_OK = "OK";
    static DIALOG_BUTTON_CANCEL = "Cancel";

    static BUTTON_ADD_CHOICE = "🎯 Add Choice";
    static BUTTON_ADD_CHOICE_TOOLTIP = "Add a new choice to this interactive block";
    static BUTTON_DELETE = "🗑️ Delete...";
    static BUTTON_DELETE_TOOLTIP = "Delete this block";

    static NEW_PARAGRAPH_INTERACTIVE = "This is an Interactive block. Replace this text with your own and make sure to add a {keyword} tag. Then create Choices for this block using the '" + this.BUTTON_ADD_CHOICE + "'.";
    static NEW_PARAGRAPH_PASSTHRU = "This is a Pass-Through block. Replace this text with your own.";
    static NEW_PARAGRAPH_INFOBOX = "This is an Info-Box block. Replace this text with your own.";
}