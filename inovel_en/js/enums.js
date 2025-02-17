class PAR_TYPE {
    static CHAPTER_START = "chapterStart";
    static CHAPTER_END = "chapterEnd";
    static REGULAR = "regular";
    static PASS_THRU = "passThru";
    static STORY_END = "storyEnd";
    static INFO_BOX = "infoBox";
}
class VAR_TYPE {
    static INVENTORY_ITEM = "inventoryItem";
    static STRING = "string";
    static NUMBER = "number";
}
class VAR_OPERATION {
    static SET = "set";
    static ADD = "add";
    static REMOVE = "remove";
}
class CONDITIONS {
    static HAS_ITEM = "hasItem";
    static HAS_VISITED_PARAGRAPH = "hasVisitedParagraph"; // not yet implemented
    static EQUAL_TO = "equalTo";// not yet implemented
    static HIGHER_THAN = "higherThan";// not yet implemented
    static LOWER_THAN = "lowerThan";// not yet implemented
}