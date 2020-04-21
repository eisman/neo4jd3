export default class NetworkData {
    container;
    info;

    node;
    nodes = [];

    relationship;
    relationshipOutline;
    relationshipOverlay;
    relationshipText;
    relationships = [];

    simulation;

    svg;
    svgNodes;
    svgRelationships;
    svgScale;
    svgTranslate;

    classes2colors = {};

    justLoaded = false;
    numClasses = 0;

    listeners: Map<string, Array<(any) => void>>;
}