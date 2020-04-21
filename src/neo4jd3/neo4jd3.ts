import * as d3 from 'd3';
import {merge} from '../utils';
import * as converters from "../converters";
import NetworkState from "./state";
import TickerManager from "./managers/tick";
import StatefulHelper from "./managers/statefulHelper";
import NodesManager from './managers/nodes';
import InfoManager from "./managers/info";
import RelationshipsManager from "./managers/relationships";

export default class Neo4jd3 {
    private readonly state: NetworkState;

    private readonly ticker: TickerManager;
    private readonly helper: StatefulHelper;
    private readonly nodeManager: NodesManager;
    private readonly infoManager: InfoManager;
    private readonly relationshipsManager: RelationshipsManager;

    readonly VERSION = '0.01';

    constructor(selector: string, options: any) {
        this.state = new NetworkState();

        this.ticker = new TickerManager(this.state);
        this.helper = new StatefulHelper(this.state);
        this.infoManager = new InfoManager(this.state, this.helper);
        this.nodeManager = new NodesManager(this.state, this.helper, this.infoManager);
        this.relationshipsManager = new RelationshipsManager(this.state, this.helper, this.infoManager);

        this.initOptions(options);
        this.initGraph(selector);

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
            this.state.info = InfoManager.appendInfoPanel(this.state.container);
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
                    this.infoManager.clearInfo();
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

    appendRandomDataToNode(d, maxNodesToGenerate) {
        const data = this.randomD3Data(d, maxNodesToGenerate);
        this.updateWithNeo4jData(data);
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
        return converters.randomD3Data(d, maxNodesToGenerate, this.size(), () => this.helper.randomLabel());
    }

    size() {
        return {
            nodes: this.state.nodes.length,
            relationships: this.state.relationships.length
        };
    }

    updateWithD3Data(d3Data) {
        this.updateNodesAndRelationships(d3Data.nodes, d3Data.relationships);
    }

    updateWithNeo4jData(neo4jData) {
        let d3Data = this.neo4jDataToD3Data(neo4jData);
        this.updateWithD3Data(d3Data);
    }

    private updateNodesAndRelationships(n, r) {
        this.relationshipsManager.updateRelationships(r);
        this.nodeManager.updateNodes(n);

        this.state.simulation.nodes(this.state.nodes);
        this.state.simulation.force('link').links(this.state.relationships);
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