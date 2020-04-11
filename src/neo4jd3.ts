import * as d3 from 'd3';
import fontAwesomeIcons from "./icons";
import colors from "./colors";
import {merge} from './utils';
import * as math from "./math";
import * as converters from "./converters";

export default class Neo4jd3 {
    private container;
    private info;

    private node;
    private nodes = [];

    private relationship;
    private relationshipOutline;
    private relationshipOverlay;
    private relationshipText;
    private relationships = [];

    private readonly simulation;

    private svg;
    private svgNodes;
    private svgRelationships;
    private svgScale;
    private svgTranslate;

    private classes2colors = {};

    private justLoaded = false;
    private numClasses = 0;

    private listeners: Map<string, Array<(any) => void>>;

    private options: any = {
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

    readonly VERSION = '0.01';

    constructor(selector: string, options: any) {
        this.initOptions(options);
        this.initGraph(selector);

        this.simulation = this.initSimulation();

        this.loadData();

        this.listeners = new Map();
    }

    private loadData() {
        if (this.options.neo4jData) {
            this.loadNeo4jData();
        } else if (this.options.neo4jDataUrl) {
            this.loadNeo4jDataFromUrl(this.options.neo4jDataUrl);
        }
    }

    private initGraph(selector: string) {
        this.container = d3.select(selector);
        this.container.attr('class', 'neo4jd3')
            .html('');

        if (this.options.infoPanel) {
            this.info = Neo4jd3.appendInfoPanel(this.container);
        }
        this.appendGraph(this.container);
    }

    private initOptions(options: any) {
        merge(this.options, options);

        this.initIconMap();
        this.initImageMap();

        if (this.options.icons) {
            this.options.showIcons = true;
        }
        if (!this.options.minCollision) {
            this.options.minCollision = this.options.nodeRadius * 2;
        }
    }

    private appendGraph(container) {
        this.svg = container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('class', 'neo4jd3-graph')
            .call(d3.zoom().on('zoom', () => {
                let scale = d3.event.transform.k;
                let translate = [d3.event.transform.x, d3.event.transform.y];

                if (this.svgTranslate) {
                    translate[0] += this.svgTranslate[0];
                    translate[1] += this.svgTranslate[1];
                }

                if (this.svgScale) {
                    scale *= this.svgScale;
                }

                this.svg.attr('transform', `translate(${translate[0]}, ${translate[1]}) scale(${scale})`);
            }))
            .on('dblclick.zoom', null)
            .on('click', _ => {
                if (this.info && d3.event.target.classList.contains('neo4jd3-graph')) {
                    this.clearInfo();
                }
            })
            .append('g')
            .attr('width', '100%')
            .attr('height', '100%');

        this.svgRelationships = this.svg.append('g')
            .attr('class', 'relationships');

        this.svgNodes = this.svg.append('g')
            .attr('class', 'nodes');
    }

    private appendImageToNode(node) {
        return node.append('image')
            .attr('height', d => this.icon(d) ? '24px' : '30px')
            .attr('x', d => this.icon(d) ? '5px' : '-15px')
            .attr('xlink:href', d => this.image(d))
            .attr('y', d => this.icon(d) ? '5px' : '-16px')
            .attr('width', d => this.icon(d) ? '24px' : '30px');
    }

    private appendPictogramToNode(node) {
        const options = this.options;

        const startX = this.options.pictogramsLook?.x || 5;
        const startY = this.options.pictogramsLook?.y || 0;
        const pictogramWidth = this.options.pictogramsLook?.width || 24;
        const pictogramHeight = this.options.pictogramsLook?.height || 24;
        const offset = this.options.pictogramsLook?.offset || 0;

        return node.each(function (d) {
            if (!d.hasOwnProperty("pictograms")) return;

            const pictograms: string[] = d.pictograms;
            const startPosition = startY + (-pictograms.length * (pictogramWidth + offset) + offset) / 2;

            pictograms.forEach((v, i) => {
                d3.select(this).append('image')
                    .attr('height', _ => `${pictogramHeight}px`)
                    .attr('x', `${startX}px`)
                    .attr('xlink:href', _ => {
                        return options.pictograms[v] || '';
                    })
                    .attr('y', _ =>
                        `${startPosition + i * pictogramHeight + (i == 0 ? 0 : offset)}px`
                    )
                    .attr('width', _ => `${pictogramWidth}px`);
            });
        });
    }

    private static appendInfoPanel(container) {
        return container.append('div')
            .attr('class', 'neo4jd3-info');
    }

    private appendInfoElement(cls, isNode, property, value = null) {
        const elem = this.info.append('a');

        elem.attr('href', '#')
            .attr('class', cls)
            .html(`<strong>${property}</strong>${value ? (': ' + value) : ''}`);

        if (!value) {
            elem.style('background-color', _ => {
                return this.options.nodeOutlineFillColor
                    ? this.options.nodeOutlineFillColor
                    : (isNode ? this.classToColor(property) : this.defaultColor());
            })
                .style('border-color', _ => {
                    return this.options.nodeOutlineFillColor
                        ? this.classToDarkenColor(this.options.nodeOutlineFillColor)
                        : (isNode
                            ? this.classToDarkenColor(property)
                            : this.defaultDarkenColor());
                })
                .style('color', _ => {
                    return this.options.nodeOutlineFillColor
                        ? this.classToDarkenColor(this.options.nodeOutlineFillColor)
                        : '#fff';
                });
        }
    }

    private appendInfoElementClass(cls, node) {
        this.appendInfoElement(cls, true, node);
    }

    private appendInfoElementProperty(cls, property, value) {
        this.appendInfoElement(cls, false, property, value);
    }

    private appendInfoElementRelationship(cls, relationship) {
        this.appendInfoElement(cls, false, relationship);
    }

    private appendNode() {
        return this.node.enter()
            .append('g')
            .attr('class', d => {
                let classes = 'node';

                if (this.icon(d)) {
                    classes += ' node-icon';
                }

                if (this.image(d)) {
                    classes += ' node-image';
                }

                if (this.options.highlight) {
                    for (let i = 0; i < this.options.highlight.length; i++) {
                        const highlight = this.options.highlight[i];
                        const isHighlighted = d.labels[0] === highlight.class &&
                            d.properties[highlight.property] === highlight.value;

                        if (isHighlighted) {
                            classes += ' node-highlighted';
                            break;
                        }
                    }
                }

                return classes;
            })
            .on('click', d => {
                d.fx = d.fy = null;

                if (this.info) {
                    this.updateInfo(d);
                }

                if (typeof this.options.onNodeClick === 'function') {
                    this.options.onNodeClick(d);
                }

                if (this.listeners.has('click')) {
                    this.listeners.get('click').forEach(v => v(d));
                }
            })
            .on('dblclick', d => {
                if (typeof this.options.onNodeDoubleClick === 'function') {
                    this.options.onNodeDoubleClick(d);
                }

                if (this.listeners.has('dblclick')) {
                    this.listeners.get('dblclick').forEach(v => v(d));
                }
            })
            .on('mouseenter', d => {
                if (typeof this.options.onNodeMouseEnter === 'function') {
                    this.options.onNodeMouseEnter(d);
                }

                if (this.listeners.has('mouseenter')) {
                    this.listeners.get('mouseenter').forEach(v => v(d));
                }
            })
            .on('mouseleave', d => {
                if (typeof this.options.onNodeMouseLeave === 'function') {
                    this.options.onNodeMouseLeave(d);
                }

                if (this.listeners.has('mouseleave')) {
                    this.listeners.get('mouseleave').forEach(v => v(d));
                }
            })
            .call(d3.drag()
                .on('start', d => this.dragStarted(d))
                .on('drag', d => Neo4jd3.dragged(d))
                .on('end', d => this.dragEnded(d)));
    }

    private appendNodeToGraph() {
        const node = this.appendNode();

        this.appendRingToNode(node);
        this.appendOutlineToNode(node);

        if (this.options.icons) {
            this.appendTextToNode(node);
        }

        if (this.options.images) {
            this.appendImageToNode(node);
        }

        if (this.options.pictograms) {
            this.appendPictogramToNode(node);
        }

        return node;
    }

    private appendOutlineToNode(node) {
        return node.append('circle')
            .attr('class', 'outline')
            .attr('r', this.options.nodeRadius)
            .style('fill', d => {
                return this.options.nodeOutlineFillColor
                    ? this.options.nodeOutlineFillColor
                    : this.classToColor(d.labels[0]);
            })
            .style('stroke', d => {
                return this.options.nodeOutlineFillColor
                    ? this.classToDarkenColor(this.options.nodeOutlineFillColor)
                    : this.classToDarkenColor(d.labels[0]);
            })
            .append('title').text(d => this.toString(d));
    }

    private appendRingToNode(node) {
        return node.append('circle')
            .attr('class', 'ring')
            .attr('r', this.options.nodeRadius * 1.16)
            .append('title').text(d => this.toString(d));
    }

    private appendTextToNode(node) {
        return node.append('text')
            .attr('class', d => `text${this.icon(d) ? ' icon' : ''}`)
            .attr('fill', '#ffffff')
            .attr('font-size', d => this.icon(d) ? `${this.options.nodeRadius}px` : '10px')
            .attr('pointer-events', 'none')
            .attr('text-anchor', 'middle')
            .attr('y', d => this.icon(d) ? `${Math.round(this.options.nodeRadius * 0.32)}px` : '4px')
            .html(d => {
                const _icon = this.icon(d);
                return _icon ? '&#x' + _icon : d.id;
            });
    }

    appendRandomDataToNode(d, maxNodesToGenerate) {
        const data = this.randomD3Data(d, maxNodesToGenerate);
        this.updateWithNeo4jData(data);
    }

    private appendRelationship() {
        return this.relationship.enter()
            .append('g')
            .attr('class', 'relationship')
            .on('dblclick', d => {
                if (typeof this.options.onRelationshipDoubleClick === 'function') {
                    this.options.onRelationshipDoubleClick(d);
                }
            })
            .on('click', d => {
                if (this.info) {
                    this.updateInfo(d);
                }
            })
    }

    private static appendOutlineToRelationship(r) {
        return r.append('path')
            .attr('class', 'outline')
            .attr('fill', '#a5abb6')
            .attr('stroke', 'none');
    }

    private static appendOverlayToRelationship(r) {
        return r.append('path')
            .attr('class', 'overlay');
    }

    private static appendTextToRelationship(r) {
        return r.append('text')
            .attr('class', 'text')
            .attr('fill', '#000000')
            .attr('font-size', '8px')
            .attr('pointer-events', 'none')
            .attr('text-anchor', 'middle')
            .text(d => {
                return d.type;
            });
    }

    private appendRelationshipToGraph() {
        const relationship = this.appendRelationship();
        const text = Neo4jd3.appendTextToRelationship(relationship);
        const outline = Neo4jd3.appendOutlineToRelationship(relationship);
        const overlay = Neo4jd3.appendOverlayToRelationship(relationship);

        return {
            outline: outline,
            overlay: overlay,
            relationship: relationship,
            text: text
        };
    }

    private classToColor(cls) {
        let color = this.classes2colors[cls];

        if (!color) {
            color = this.options.colors[this.numClasses % this.options.colors.length];
            this.classes2colors[cls] = color;
            this.numClasses++;
        }

        return color;
    }

    private classToDarkenColor(cls) {
        return d3.rgb(this.classToColor(cls)).darker(1);
    }

    private clearInfo() {
        this.info.html('');
    }

    private defaultColor() {
        return this.options.relationshipColor;
    }

    private defaultDarkenColor() {
        return d3.rgb(this.options.colors[this.options.colors.length - 1]).darker(1);
    }

    disableForces() {
        if (this.simulation) {
            this.simulation
                .force('collide', null)
                .force('charge', null)
                .force('link', null)
                .force('center', null);
        }
    }

    private dragEnded(d) {
        if (!d3.event.active) {
            this.simulation.alphaTarget(0);
        }

        if (typeof this.options.onNodeDragEnd === 'function') {
            this.options.onNodeDragEnd(d);
        }
    }

    private static dragged(d) {
        Neo4jd3.stickNode(d);
    }

    private dragStarted(d) {
        if (!d3.event.active) {
            this.simulation.alphaTarget(0.3).restart();
        }

        d.fx = d.x;
        d.fy = d.y;

        if (typeof this.options.onNodeDragStart === 'function') {
            this.options.onNodeDragStart(d);
        }
    }

    private icon(d) {
        let code;

        if (this.options.iconMap && this.options.showIcons && this.options.icons) {
            if (this.options.icons[d.labels[0]] && this.options.iconMap[this.options.icons[d.labels[0]]]) {
                code = this.options.iconMap[this.options.icons[d.labels[0]]];
            } else if (this.options.iconMap[d.labels[0]]) {
                code = this.options.iconMap[d.labels[0]];
            } else if (this.options.icons[d.labels[0]]) {
                code = this.options.icons[d.labels[0]];
            }
        }

        return code;
    }

    private image(d) {
        let value, property, label, img;

        if (this.options.images) {
            const imagesForLabel = this.options.imageMap[d.labels[0]];

            if (imagesForLabel) {
                let imgLevel = 0;

                for (let i = 0; i < imagesForLabel.length; i++) {
                    const labelPropertyValue = imagesForLabel[i].split('|');

                    switch (labelPropertyValue.length) {
                        case 3:
                            value = labelPropertyValue[2];
                        /* falls through */
                        case 2:
                            property = labelPropertyValue[1];
                        /* falls through */
                        case 1:
                            label = labelPropertyValue[0];
                    }

                    if (d.labels[0] === label &&
                        (!property || d.properties[property] !== undefined) &&
                        (!value || d.properties[property] === value)) {
                        if (labelPropertyValue.length > imgLevel) {
                            img = this.options.images[imagesForLabel[i]];
                            imgLevel = labelPropertyValue.length;
                        }
                    }
                }
            }
        }

        return img;
    }

    private initIconMap() {
        Object.keys(this.options.iconMap).forEach(iconMapKey => {
            const keys = iconMapKey.split(',');
            const value = this.options.iconMap[iconMapKey];

            keys.forEach(key => {
                this.options.iconMap[key] = value;
            });
        });
    }

    private initImageMap() {
        Object.keys(this.options.images).forEach(key => {
            const keys = key.split('|');
            const tag = keys[0];

            if (!this.options.imageMap[tag]) {
                this.options.imageMap[tag] = [key];
            } else {
                this.options.imageMap[tag].push(key);
            }
        })
    }

    private initSimulation() {
        return d3.forceSimulation()
            .force('collide', d3.forceCollide().radius(() => this.options.minCollision)
                .iterations(2))
            .force('charge', d3.forceManyBody())
            .force('link', d3.forceLink().id(d => (d as any).id))
            .force('center', d3.forceCenter(
                this.svg.node().parentElement.parentElement.clientWidth / 2,
                this.svg.node().parentElement.parentElement.clientHeight / 2
            ))
            .on('tick', () => {
                this.tick();
            })
            .on('end', () => {
                if (this.options.zoomFit && !this.justLoaded) {
                    this.justLoaded = true;
                    this.zoomFit();
                }
            });
    }

    private loadNeo4jData() {
        this.nodes = [];
        this.relationships = [];

        this.updateWithNeo4jData(this.options.neo4jData);
    }

    private loadNeo4jDataFromUrl(neo4jDataUrl) {
        this.nodes = [];
        this.relationships = [];

        d3.json(neo4jDataUrl).then(data => {
            this.updateWithNeo4jData(data);
        });
    }

    neo4jDataToD3Data(data) {
        return converters.neo4jDataToD3Data(data);
    }

    on(eventType: string, listener: (any) => void): this {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }

        this.listeners.get(eventType).push(listener);

        return this;
    }

    randomD3Data(d, maxNodesToGenerate) {
        return converters.randomD3Data(d, maxNodesToGenerate, this.size(), () => this.randomLabel());
    }

    private randomLabel() {
        const icons = Object.keys(this.options.iconMap);
        return icons[icons.length * Math.random() << 0];
    }

    size() {
        return {
            nodes: this.nodes.length,
            relationships: this.relationships.length
        };
    }

    private static stickNode(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    private tick() {
        this.tickNodes();
        this.tickRelationships();
    }

    private tickNodes() {
        if (this.node) {
            this.node.attr('transform', d => `translate(${d.x}, ${d.y})`);
        }
    }

    private tickRelationships() {
        if (this.relationship) {
            this.relationship.attr('transform', d => {
                const angle = math.rotation(d.source, d.target);
                return `translate(${d.source.x}, ${d.source.y}) rotate(${angle})`;
            });

            this.tickRelationshipsTexts();
            this.tickRelationshipsOutlines();
            this.tickRelationshipsOverlays();
        }
    }

    private tickRelationshipsOutlines() {
        let network = this;

        this.relationship.each(function () {
            let rel = d3.select(this),
                outline = rel.select('.outline'),
                text = rel.select('.text');

            outline.attr('d', function (d: any) {
                let center = {x: 0, y: 0},
                    angle = math.rotation(d.source, d.target),
                    textBoundingBox = (text.node() as SVGGraphicsElement).getBBox(),
                    textPadding = 5,
                    u = math.unitaryVector(d.source, d.target),
                    textMargin = {
                        x: (d.target.x - d.source.x - (textBoundingBox.width + textPadding) * u.x) * 0.5,
                        y: (d.target.y - d.source.y - (textBoundingBox.width + textPadding) * u.y) * 0.5
                    },
                    n = math.unitaryNormalVector(d.source, d.target),
                    rotatedPointA1 = math.rotatePoint(center, {
                        x: (network.options.nodeRadius + 1) * u.x - n.x,
                        y: (network.options.nodeRadius + 1) * u.y - n.y
                    }, angle),
                    rotatedPointB1 = math.rotatePoint(center, {x: textMargin.x - n.x, y: textMargin.y - n.y}, angle),
                    rotatedPointC1 = math.rotatePoint(center, {x: textMargin.x, y: textMargin.y}, angle),
                    rotatedPointD1 = math.rotatePoint(center, {
                        x: (network.options.nodeRadius + 1) * u.x,
                        y: (network.options.nodeRadius + 1) * u.y
                    }, angle),
                    rotatedPointA2 = math.rotatePoint(center, {
                        x: d.target.x - d.source.x - textMargin.x - n.x,
                        y: d.target.y - d.source.y - textMargin.y - n.y
                    }, angle),
                    rotatedPointB2 = math.rotatePoint(center, {
                        x: d.target.x - d.source.x - (network.options.nodeRadius + 1) * u.x - n.x - u.x * network.options.arrowSize,
                        y: d.target.y - d.source.y - (network.options.nodeRadius + 1) * u.y - n.y - u.y * network.options.arrowSize
                    }, angle),
                    rotatedPointC2 = math.rotatePoint(center, {
                        x: d.target.x - d.source.x - (network.options.nodeRadius + 1) * u.x - n.x + (n.x - u.x) * network.options.arrowSize,
                        y: d.target.y - d.source.y - (network.options.nodeRadius + 1) * u.y - n.y + (n.y - u.y) * network.options.arrowSize
                    }, angle),
                    rotatedPointD2 = math.rotatePoint(center, {
                        x: d.target.x - d.source.x - (network.options.nodeRadius + 1) * u.x,
                        y: d.target.y - d.source.y - (network.options.nodeRadius + 1) * u.y
                    }, angle),
                    rotatedPointE2 = math.rotatePoint(center, {
                        x: d.target.x - d.source.x - (network.options.nodeRadius + 1) * u.x + (-n.x - u.x) * network.options.arrowSize,
                        y: d.target.y - d.source.y - (network.options.nodeRadius + 1) * u.y + (-n.y - u.y) * network.options.arrowSize
                    }, angle),
                    rotatedPointF2 = math.rotatePoint(center, {
                        x: d.target.x - d.source.x - (network.options.nodeRadius + 1) * u.x - u.x * network.options.arrowSize,
                        y: d.target.y - d.source.y - (network.options.nodeRadius + 1) * u.y - u.y * network.options.arrowSize
                    }, angle),
                    rotatedPointG2 = math.rotatePoint(center, {
                        x: d.target.x - d.source.x - textMargin.x,
                        y: d.target.y - d.source.y - textMargin.y
                    }, angle);

                return 'M ' + rotatedPointA1.x + ' ' + rotatedPointA1.y +
                    ' L ' + rotatedPointB1.x + ' ' + rotatedPointB1.y +
                    ' L ' + rotatedPointC1.x + ' ' + rotatedPointC1.y +
                    ' L ' + rotatedPointD1.x + ' ' + rotatedPointD1.y +
                    ' Z M ' + rotatedPointA2.x + ' ' + rotatedPointA2.y +
                    ' L ' + rotatedPointB2.x + ' ' + rotatedPointB2.y +
                    ' L ' + rotatedPointC2.x + ' ' + rotatedPointC2.y +
                    ' L ' + rotatedPointD2.x + ' ' + rotatedPointD2.y +
                    ' L ' + rotatedPointE2.x + ' ' + rotatedPointE2.y +
                    ' L ' + rotatedPointF2.x + ' ' + rotatedPointF2.y +
                    ' L ' + rotatedPointG2.x + ' ' + rotatedPointG2.y +
                    ' Z';
            });
        });
    }

    private tickRelationshipsOverlays() {
        this.relationshipOverlay.attr('d', d => {
            let center = {x: 0, y: 0},
                angle = math.rotation(d.source, d.target),
                n1 = math.unitaryNormalVector(d.source, d.target),
                n = math.unitaryNormalVector(d.source, d.target, 50),
                rotatedPointA = math.rotatePoint(center, {x: 0 - n.x, y: 0 - n.y}, angle),
                rotatedPointB = math.rotatePoint(center, {
                    x: d.target.x - d.source.x - n.x,
                    y: d.target.y - d.source.y - n.y
                }, angle),
                rotatedPointC = math.rotatePoint(center, {
                    x: d.target.x - d.source.x + n.x - n1.x,
                    y: d.target.y - d.source.y + n.y - n1.y
                }, angle),
                rotatedPointD = math.rotatePoint(center, {x: 0 + n.x - n1.x, y: 0 + n.y - n1.y}, angle);

            return 'M ' + rotatedPointA.x + ' ' + rotatedPointA.y +
                ' L ' + rotatedPointB.x + ' ' + rotatedPointB.y +
                ' L ' + rotatedPointC.x + ' ' + rotatedPointC.y +
                ' L ' + rotatedPointD.x + ' ' + rotatedPointD.y +
                ' Z';
        });
    }

    private tickRelationshipsTexts() {
        this.relationshipText.attr('transform', d => {
            const angle = (math.rotation(d.source, d.target) + 360) % 360;
            const mirror = angle > 90 && angle < 270;
            const center = {x: 0, y: 0};
            const n = math.unitaryNormalVector(d.source, d.target);
            const nWeight = mirror ? 2 : -3;
            const point = {
                x: (d.target.x - d.source.x) * 0.5 + n.x * nWeight,
                y: (d.target.y - d.source.y) * 0.5 + n.y * nWeight
            };
            const rotatedPoint = math.rotatePoint(center, point, angle);

            return `translate(${rotatedPoint.x}, ${rotatedPoint.y}) rotate(${mirror ? 180 : 0})`;
        });
    }

    private toString(d) {
        let s = d.labels ? d.labels[0] : d.type;

        s += ' (<id>: ' + d.id;

        Object.keys(d.properties).forEach(function (property) {
            s += ', ' + property + ': ' + JSON.stringify(d.properties[property]);
        });

        s += ')';

        return s;
    }

    updateWithD3Data(d3Data) {
        this.updateNodesAndRelationships(d3Data.nodes, d3Data.relationships);
    }

    updateWithNeo4jData(neo4jData) {
        let d3Data = this.neo4jDataToD3Data(neo4jData);
        this.updateWithD3Data(d3Data);
    }

    private updateInfo(d) {
        this.clearInfo();

        if (d.labels) {
            this.appendInfoElementClass('class', d.labels[0]);
        } else {
            this.appendInfoElementRelationship('class', d.type);
        }

        if (this.options.useId) {
            this.appendInfoElementProperty('property', '&lt;id&gt;', d.id);
        }

        Object.keys(d.properties).forEach(property => {
            this.appendInfoElementProperty('property', property, JSON.stringify(d.properties[property]));
        });
    }

    private updateNodes(n) {
        Array.prototype.push.apply(this.nodes, n);

        this.node = this.svgNodes.selectAll('.node')
            .data(this.nodes, d => d.id);
        const nodeEnter = this.appendNodeToGraph();
        this.node = nodeEnter.merge(this.node);
    }

    private updateNodesAndRelationships(n, r) {
        this.updateRelationships(r);
        this.updateNodes(n);

        this.simulation.nodes(this.nodes);
        this.simulation.force('link').links(this.relationships);
    }

    private updateRelationships(r) {
        Array.prototype.push.apply(this.relationships, r);

        this.relationship = this.svgRelationships.selectAll('.relationship')
            .data(this.relationships, d => {
                return d.id;
            });

        let relationshipEnter = this.appendRelationshipToGraph();

        this.relationship = relationshipEnter.relationship.merge(this.relationship);

        this.relationshipOutline = this.svg.selectAll('.relationship .outline');
        this.relationshipOutline = relationshipEnter.outline.merge(this.relationshipOutline);

        this.relationshipOverlay = this.svg.selectAll('.relationship .overlay');
        this.relationshipOverlay = relationshipEnter.overlay.merge(this.relationshipOverlay);

        this.relationshipText = this.svg.selectAll('.relationship .text');
        this.relationshipText = relationshipEnter.text.merge(this.relationshipText);
    }

    private zoomFit() {
        let bounds = this.svg.node().getBBox(),
            parent = this.svg.node().parentElement.parentElement,
            fullWidth = parent.clientWidth,
            fullHeight = parent.clientHeight,
            width = bounds.width,
            height = bounds.height,
            midX = bounds.x + width / 2,
            midY = bounds.y + height / 2;

        if (width === 0 || height === 0) {
            return; // nothing to fit
        }

        this.svgScale = 0.85 / Math.max(width / fullWidth, height / fullHeight);
        this.svgTranslate = [fullWidth / 2 - this.svgScale * midX, fullHeight / 2 - this.svgScale * midY];

        this.svg.attr('transform', 'translate(' + this.svgTranslate[0] + ', ' + this.svgTranslate[1] + ') scale(' + this.svgScale + ')');
//        smoothTransform(svgTranslate, svgScale);
    }
}