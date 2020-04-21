import colors from "../../data/colors";
import fontAwesomeIcons from "../../data/icons";

export default class NetworkState {
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

    options: any = {
        arrowSize: 4,
        colors: colors,
        highlight: undefined,
        iconMap: fontAwesomeIcons,
        icons: undefined,
        imageMap: {},
        pictograms: {},
        pictogramsLook: {},
        images: undefined,
        infoPanel: true,
        minCollision: undefined,
        neo4jData: undefined,
        neo4jDataUrl: undefined,
        nodeOutlineFillColor: undefined,
        nodeRadius: 25,
        relationshipColor: '#a5abb6',
        zoomFit: false,
        useId: true,
    };
}