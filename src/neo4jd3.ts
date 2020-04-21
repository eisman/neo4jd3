import * as d3 from 'd3';
import {merge} from './utils';
import * as converters from "./converters";
import NetworkData from "./networkData";
import Ticker from "./ticker";

export default class Neo4jd3 {
    private state: NetworkData;

    private ticker: Ticker;

    readonly VERSION = '0.01';

    constructor(selector: string, options: any) {
        this.initOptions(options);
        this.initGraph(selector);

        this.ticker = new Ticker(this.state);

        this.state.simulation = this.initSimulation();

        this.loadData();

        this.state.listeners = new Map();
    }

    private loadData() {
        if (this.state.options.neo4jData) {
            this.loadNeo4jData();
        } else if (this.state.options.neo4jDataUrl) {
            this.loadNeo4jDataFromUrl(this.state.options.neo4jDataUrl);
        }
    }

    private initGraph(selector: string) {
        this.state.container = d3.select(selector);
        this.state.container.attr('class', 'neo4jd3')
            .html('');

        if (this.state.options.infoPanel) {
            this.state.info = Neo4jd3.appendInfoPanel(this.state.container);
        }
        this.appendGraph(this.state.container);
    }

    private initOptions(options: any) {
        merge(this.state.options, options);

        this.initIconMap();
        this.initImageMap();

        if (this.state.options.icons) {
            this.state.options.showIcons = true;
        }
        if (!this.state.options.minCollision) {
            this.state.options.minCollision = this.state.options.nodeRadius * 2;
        }
    }

    private appendGraph(container) {
        this.state.svg = container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('class', 'neo4jd3-graph')
            .call(d3.zoom().on('zoom', () => {
                let scale = d3.event.transform.k;
                let translate = [d3.event.transform.x, d3.event.transform.y];

                if (this.state.svgTranslate) {
                    translate[0] += this.state.svgTranslate[0];
                    translate[1] += this.state.svgTranslate[1];
                }

                if (this.state.svgScale) {
                    scale *= this.state.svgScale;
                }

                this.state.svg.attr('transform', `translate(${translate[0]}, ${translate[1]}) scale(${scale})`);
            }))
            .on('dblclick.zoom', null)
            .on('click', _ => {
                if (this.state.info && d3.event.target.classList.contains('neo4jd3-graph')) {
                    this.clearInfo();
                }
            })
            .append('g')
            .attr('width', '100%')
            .attr('height', '100%');

        this.state.svgRelationships = this.state.svg.append('g')
            .attr('class', 'relationships');

        this.state.svgNodes = this.state.svg.append('g')
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
        const options = this.state.options;

        const startX = this.state.options.pictogramsLook?.x || 5;
        const startY = this.state.options.pictogramsLook?.y || 0;
        const pictogramWidth = this.state.options.pictogramsLook?.width || 24;
        const pictogramHeight = this.state.options.pictogramsLook?.height || 24;
        const offset = this.state.options.pictogramsLook?.offset || 0;

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
        const elem = this.state.info.append('a');

        elem.attr('href', '#')
            .attr('class', cls)
            .html(`<strong>${property}</strong>${value ? (': ' + value) : ''}`);

        if (!value) {
            elem.style('background-color', _ => {
                return this.state.options.nodeOutlineFillColor
                    ? this.state.options.nodeOutlineFillColor
                    : (isNode ? this.classToColor(property) : this.defaultColor());
            })
                .style('border-color', _ => {
                    return this.state.options.nodeOutlineFillColor
                        ? this.classToDarkenColor(this.state.options.nodeOutlineFillColor)
                        : (isNode
                            ? this.classToDarkenColor(property)
                            : this.defaultDarkenColor());
                })
                .style('color', _ => {
                    return this.state.options.nodeOutlineFillColor
                        ? this.classToDarkenColor(this.state.options.nodeOutlineFillColor)
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
        return this.state.node.enter()
            .append('g')
            .attr('class', d => {
                let classes = 'node';

                if (this.icon(d)) {
                    classes += ' node-icon';
                }

                if (this.image(d)) {
                    classes += ' node-image';
                }

                if (this.state.options.highlight) {
                    for (let i = 0; i < this.state.options.highlight.length; i++) {
                        const highlight = this.state.options.highlight[i];
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

                if (this.state.info) {
                    this.updateInfo(d);
                }

                if (typeof this.state.options.onNodeClick === 'function') {
                    this.state.options.onNodeClick(d);
                }

                if (this.state.listeners.has('click')) {
                    this.state.listeners.get('click').forEach(v => v(d));
                }
            })
            .on('dblclick', d => {
                if (typeof this.state.options.onNodeDoubleClick === 'function') {
                    this.state.options.onNodeDoubleClick(d);
                }

                if (this.state.listeners.has('dblclick')) {
                    this.state.listeners.get('dblclick').forEach(v => v(d));
                }
            })
            .on('mouseenter', d => {
                if (typeof this.state.options.onNodeMouseEnter === 'function') {
                    this.state.options.onNodeMouseEnter(d);
                }

                if (this.state.listeners.has('mouseenter')) {
                    this.state.listeners.get('mouseenter').forEach(v => v(d));
                }
            })
            .on('mouseleave', d => {
                if (typeof this.state.options.onNodeMouseLeave === 'function') {
                    this.state.options.onNodeMouseLeave(d);
                }

                if (this.state.listeners.has('mouseleave')) {
                    this.state.listeners.get('mouseleave').forEach(v => v(d));
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

        if (this.state.options.icons) {
            this.appendTextToNode(node);
        }

        if (this.state.options.images) {
            this.appendImageToNode(node);
        }

        if (this.state.options.pictograms) {
            this.appendPictogramToNode(node);
        }

        return node;
    }

    private appendOutlineToNode(node) {
        return node.append('circle')
            .attr('class', 'outline')
            .attr('r', this.state.options.nodeRadius)
            .style('fill', d => {
                return this.state.options.nodeOutlineFillColor
                    ? this.state.options.nodeOutlineFillColor
                    : this.classToColor(d.labels[0]);
            })
            .style('stroke', d => {
                return this.state.options.nodeOutlineFillColor
                    ? this.classToDarkenColor(this.state.options.nodeOutlineFillColor)
                    : this.classToDarkenColor(d.labels[0]);
            })
            .append('title').text(d => this.toString(d));
    }

    private appendRingToNode(node) {
        return node.append('circle')
            .attr('class', 'ring')
            .attr('r', this.state.options.nodeRadius * 1.16)
            .append('title').text(d => this.toString(d));
    }

    private appendTextToNode(node) {
        return node.append('text')
            .attr('class', d => `text${this.icon(d) ? ' icon' : ''}`)
            .attr('fill', '#ffffff')
            .attr('font-size', d => this.icon(d) ? `${this.state.options.nodeRadius}px` : '10px')
            .attr('pointer-events', 'none')
            .attr('text-anchor', 'middle')
            .attr('y', d => this.icon(d) ? `${Math.round(this.state.options.nodeRadius * 0.32)}px` : '4px')
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
        return this.state.relationship.enter()
            .append('g')
            .attr('class', 'relationship')
            .on('dblclick', d => {
                if (typeof this.state.options.onRelationshipDoubleClick === 'function') {
                    this.state.options.onRelationshipDoubleClick(d);
                }
            })
            .on('click', d => {
                if (this.state.info) {
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
        let color = this.state.classes2colors[cls];

        if (!color) {
            color = this.state.options.colors[this.state.numClasses % this.state.options.colors.length];
            this.state.classes2colors[cls] = color;
            this.state.numClasses++;
        }

        return color;
    }

    private classToDarkenColor(cls) {
        return d3.rgb(this.classToColor(cls)).darker(1);
    }

    private clearInfo() {
        this.state.info.html('');
    }

    private defaultColor() {
        return this.state.options.relationshipColor;
    }

    private defaultDarkenColor() {
        return d3.rgb(this.state.options.colors[this.state.options.colors.length - 1]).darker(1);
    }

    disableForces() {
        if (this.state.simulation) {
            this.state.simulation
                .force('collide', null)
                .force('charge', null)
                .force('link', null)
                .force('center', null);
        }
    }

    private dragEnded(d) {
        if (!d3.event.active) {
            this.state.simulation.alphaTarget(0);
        }

        if (typeof this.state.options.onNodeDragEnd === 'function') {
            this.state.options.onNodeDragEnd(d);
        }
    }

    private static dragged(d) {
        Neo4jd3.stickNode(d);
    }

    private dragStarted(d) {
        if (!d3.event.active) {
            this.state.simulation.alphaTarget(0.3).restart();
        }

        d.fx = d.x;
        d.fy = d.y;

        if (typeof this.state.options.onNodeDragStart === 'function') {
            this.state.options.onNodeDragStart(d);
        }
    }

    private icon(d) {
        let code;

        if (this.state.options.iconMap && this.state.options.showIcons && this.state.options.icons) {
            if (this.state.options.icons[d.labels[0]] && this.state.options.iconMap[this.state.options.icons[d.labels[0]]]) {
                code = this.state.options.iconMap[this.state.options.icons[d.labels[0]]];
            } else if (this.state.options.iconMap[d.labels[0]]) {
                code = this.state.options.iconMap[d.labels[0]];
            } else if (this.state.options.icons[d.labels[0]]) {
                code = this.state.options.icons[d.labels[0]];
            }
        }

        return code;
    }

    private image(d) {
        let value, property, label, img;

        if (this.state.options.images) {
            const imagesForLabel = this.state.options.imageMap[d.labels[0]];

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
                            img = this.state.options.images[imagesForLabel[i]];
                            imgLevel = labelPropertyValue.length;
                        }
                    }
                }
            }
        }

        return img;
    }

    private initIconMap() {
        Object.keys(this.state.options.iconMap).forEach(iconMapKey => {
            const keys = iconMapKey.split(',');
            const value = this.state.options.iconMap[iconMapKey];

            keys.forEach(key => {
                this.state.options.iconMap[key] = value;
            });
        });
    }

    private initImageMap() {
        Object.keys(this.state.options.images).forEach(key => {
            const keys = key.split('|');
            const tag = keys[0];

            if (!this.state.options.imageMap[tag]) {
                this.state.options.imageMap[tag] = [key];
            } else {
                this.state.options.imageMap[tag].push(key);
            }
        })
    }

    private initSimulation() {
        return d3.forceSimulation()
            .force('collide', d3.forceCollide().radius(() => this.state.options.minCollision)
                .iterations(2))
            .force('charge', d3.forceManyBody())
            .force('link', d3.forceLink().id(d => (d as any).id))
            .force('center', d3.forceCenter(
                this.state.svg.node().parentElement.parentElement.clientWidth / 2,
                this.state.svg.node().parentElement.parentElement.clientHeight / 2
            ))
            .on('tick', () => {
                this.ticker.tick();
            })
            .on('end', () => {
                if (this.state.options.zoomFit && !this.state.justLoaded) {
                    this.state.justLoaded = true;
                    this.zoomFit();
                }
            });
    }

    private loadNeo4jData() {
        this.state.nodes = [];
        this.state.relationships = [];

        this.updateWithNeo4jData(this.state.options.neo4jData);
    }

    private loadNeo4jDataFromUrl(neo4jDataUrl) {
        this.state.nodes = [];
        this.state.relationships = [];

        d3.json(neo4jDataUrl).then(data => {
            this.updateWithNeo4jData(data);
        });
    }

    neo4jDataToD3Data(data) {
        return converters.neo4jDataToD3Data(data);
    }

    on(eventType: string, listener: (any) => void): this {
        if (!this.state.listeners.has(eventType)) {
            this.state.listeners.set(eventType, []);
        }

        this.state.listeners.get(eventType).push(listener);

        return this;
    }

    randomD3Data(d, maxNodesToGenerate) {
        return converters.randomD3Data(d, maxNodesToGenerate, this.size(), () => this.randomLabel());
    }

    private randomLabel() {
        const icons = Object.keys(this.state.options.iconMap);
        return icons[icons.length * Math.random() << 0];
    }

    size() {
        return {
            nodes: this.state.nodes.length,
            relationships: this.state.relationships.length
        };
    }

    private static stickNode(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
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

        if (this.state.options.useId) {
            this.appendInfoElementProperty('property', '&lt;id&gt;', d.id);
        }

        Object.keys(d.properties).forEach(property => {
            this.appendInfoElementProperty('property', property, JSON.stringify(d.properties[property]));
        });
    }

    private updateNodes(n) {
        Array.prototype.push.apply(this.state.nodes, n);

        this.state.node = this.state.svgNodes.selectAll('.node')
            .data(this.state.nodes, d => d.id);
        const nodeEnter = this.appendNodeToGraph();
        this.state.node = nodeEnter.merge(this.state.node);
    }

    private updateNodesAndRelationships(n, r) {
        this.updateRelationships(r);
        this.updateNodes(n);

        this.state.simulation.nodes(this.state.nodes);
        this.state.simulation.force('link').links(this.state.relationships);
    }

    private updateRelationships(r) {
        Array.prototype.push.apply(this.state.relationships, r);

        this.state.relationship = this.state.svgRelationships.selectAll('.relationship')
            .data(this.state.relationships, d => {
                return d.id;
            });

        const relationshipEnter = this.appendRelationshipToGraph();

        this.state.relationship = relationshipEnter.relationship.merge(this.state.relationship);

        this.state.relationshipOutline = this.state.svg.selectAll('.relationship .outline');
        this.state.relationshipOutline = relationshipEnter.outline.merge(this.state.relationshipOutline);

        this.state.relationshipOverlay = this.state.svg.selectAll('.relationship .overlay');
        this.state.relationshipOverlay = relationshipEnter.overlay.merge(this.state.relationshipOverlay);

        this.state.relationshipText = this.state.svg.selectAll('.relationship .text');
        this.state.relationshipText = relationshipEnter.text.merge(this.state.relationshipText);
    }

    private zoomFit() {
        const bounds = this.state.svg.node().getBBox();
        const parent = this.state.svg.node().parentElement.parentElement;
        const fullWidth = parent.clientWidth;
        const fullHeight = parent.clientHeight;
        const width = bounds.width;
        const height = bounds.height;
        const midX = bounds.x + width / 2;
        const midY = bounds.y + height / 2;

        if (width === 0 || height === 0) {
            return; // nothing to fit
        }

        this.state.svgScale = 0.85 / Math.max(width / fullWidth, height / fullHeight);
        this.state.svgTranslate = [fullWidth / 2 - this.state.svgScale * midX, fullHeight / 2 - this.state.svgScale * midY];

        this.state.svg.attr('transform', `translate(${this.state.svgTranslate[0]}, ${this.state.svgTranslate[1]}) scale(${this.state.svgScale})`);
    }
}