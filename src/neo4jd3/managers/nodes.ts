import NetworkState from "../state";
import * as d3 from "d3";
import StatefulHelper from "./statefulHelper";
import InfoManager from "./info";

export default class NodesManager {
    private readonly state: NetworkState;
    private readonly helper: StatefulHelper;
    private readonly infoManager: InfoManager;

    constructor(state: NetworkState, helper: StatefulHelper, infoManager: InfoManager) {
        this.state = state;
        this.helper = helper;
        this.infoManager = infoManager;
    }

    updateNodes(n) {
        Array.prototype.push.apply(this.state.nodes, n);

        this.state.node = this.state.svgNodes.selectAll('.node')
            .data(this.state.nodes, d => d.id);
        const nodeEnter = this.appendNodeToGraph();
        this.state.node = nodeEnter.merge(this.state.node);
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

    private appendNode() {
        return this.state.node.enter()
            .append('g')
            .attr('class', d => {
                let classes = 'node';

                if (this.helper.icon(d)) {
                    classes += ' node-icon';
                }

                if (this.helper.image(d)) {
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
                    this.infoManager.updateInfo(d);
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
                .on('start', d => this.helper.dragStarted(d))
                .on('drag', d => StatefulHelper.dragged(d))
                .on('end', d => this.helper.dragEnded(d)));
    }

    private appendOutlineToNode(node) {
        return node.append('circle')
            .attr('class', 'outline')
            .attr('r', this.state.options.nodeRadius)
            .style('fill', d => {
                return this.state.options.nodeOutlineFillColor
                    ? this.state.options.nodeOutlineFillColor
                    : this.helper.classToColor(d.labels[0]);
            })
            .style('stroke', d => {
                return this.state.options.nodeOutlineFillColor
                    ? this.helper.classToDarkenColor(this.state.options.nodeOutlineFillColor)
                    : this.helper.classToDarkenColor(d.labels[0]);
            })
            .append('title').text(d => this.helper.toString(d));
    }

    private appendRingToNode(node) {
        return node.append('circle')
            .attr('class', 'ring')
            .attr('r', this.state.options.nodeRadius * 1.16)
            .append('title').text(d => this.helper.toString(d));
    }

    private appendTextToNode(node) {
        return node.append('text')
            .attr('class', d => `text${this.helper.icon(d) ? ' icon' : ''}`)
            .attr('fill', '#ffffff')
            .attr('font-size', d => this.helper.icon(d) ? `${this.state.options.nodeRadius}px` : '10px')
            .attr('pointer-events', 'none')
            .attr('text-anchor', 'middle')
            .attr('y', d => this.helper.icon(d) ? `${Math.round(this.state.options.nodeRadius * 0.32)}px` : '4px')
            .html(d => {
                const _icon = this.helper.icon(d);
                return _icon ? '&#x' + _icon : d.id;
            });
    }

    private appendImageToNode(node) {
        return node.append('image')
            .attr('height', d => this.helper.icon(d) ? '24px' : '30px')
            .attr('x', d => this.helper.icon(d) ? '5px' : '-15px')
            .attr('xlink:href', d => this.helper.image(d))
            .attr('y', d => this.helper.icon(d) ? '5px' : '-16px')
            .attr('width', d => this.helper.icon(d) ? '24px' : '30px');
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
}