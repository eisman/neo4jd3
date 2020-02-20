import * as d3 from 'd3';

export default class Neo4jd3 {
    private readonly container;
    private graph;

    private readonly info;

    private node;
    private nodes = [];

    private relationship;
    private relationshipOutline;
    private relationshipOverlay;
    private relationshipText;
    private relationships = [];

    private selector;
    private simulation;

    private svg;
    private svgNodes;
    private svgRelationships;
    private svgScale;
    private svgTranslate;

    private classes2colors = {};

    private justLoaded = false;
    private numClasses = 0;

    private options: any = {
        arrowSize: 4,
        colors: this.colors(),
        highlight: undefined,
        iconMap: this.fontAwesomeIcons(),
        icons: undefined,
        imageMap: {},
        images: undefined,
        infoPanel: true,
        minCollision: undefined,
        neo4jData: undefined,
        neo4jDataUrl: undefined,
        nodeOutlineFillColor: undefined,
        nodeRadius: 25,
        relationshipColor: '#a5abb6',
        zoomFit: false
    };

    readonly VERSION = '0.01';

    constructor(selector: string, options: any) {
        this.initIconMap();

        this.merge(this.options, options);

        if (this.options.icons) {
            this.options.showIcons = true;
        }

        if (!this.options.minCollision) {
            this.options.minCollision = this.options.nodeRadius * 2;
        }

        this.initImageMap();

        this.selector = selector;

        this.container = d3.select(selector);

        this.container.attr('class', 'neo4jd3')
            .html('');

        if (this.options.infoPanel) {
            this.info = this.appendInfoPanel(this.container);
        }

        this.appendGraph(this.container);

        this.simulation = this.initSimulation();

        if (this.options.neo4jData) {
            this.loadNeo4jData();
        } else if (options.neo4jDataUrl) {
            this.loadNeo4jDataFromUrl(options.neo4jDataUrl);
        }
    }

    appendGraph(container) {
        this.svg = container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('class', 'neo4jd3-graph')
            .call(d3.zoom().on('zoom', () => {
                let scale = d3.event.transform.k,
                    translate = [d3.event.transform.x, d3.event.transform.y];

                if (this.svgTranslate) {
                    translate[0] += this.svgTranslate[0];
                    translate[1] += this.svgTranslate[1];
                }

                if (this.svgScale) {
                    scale *= this.svgScale;
                }

                this.svg.attr('transform', 'translate(' + translate[0] + ', ' + translate[1] + ') scale(' + scale + ')');
            }))
            .on('dblclick.zoom', null)
            .append('g')
            .attr('width', '100%')
            .attr('height', '100%');

        this.svgRelationships = this.svg.append('g')
            .attr('class', 'relationships');

        this.svgNodes = this.svg.append('g')
            .attr('class', 'nodes');
    }

    appendImageToNode(node) {
        return node.append('image')
            .attr('height', d => {
                return this.icon(d) ? '24px' : '30px';
            })
            .attr('x', d => {
                return this.icon(d) ? '5px' : '-15px';
            })
            .attr('xlink:href', d => {
                return this.image(d);
            })
            .attr('y', d => {
                return this.icon(d) ? '5px' : '-16px';
            })
            .attr('width', d => {
                return this.icon(d) ? '24px' : '30px';
            });
    }

    appendInfoPanel(container) {
        return container.append('div')
            .attr('class', 'neo4jd3-info');
    }

    appendInfoElement(cls, isNode, property, value = null) {
        let elem = this.info.append('a');

        elem.attr('href', '#')
            .attr('class', cls)
            .html('<strong>' + property + '</strong>' + (value ? (': ' + value) : ''));

        if (!value) {
            elem.style('background-color', _ => {
                return this.options.nodeOutlineFillColor ? this.options.nodeOutlineFillColor : (isNode ? this.class2color(property) : this.defaultColor());
            })
                .style('border-color', _ => {
                    return this.options.nodeOutlineFillColor ? this.class2darkenColor(this.options.nodeOutlineFillColor) : (isNode ? this.class2darkenColor(property) : this.defaultDarkenColor());
                })
                .style('color', _ => {
                    return this.options.nodeOutlineFillColor ? this.class2darkenColor(this.options.nodeOutlineFillColor) : '#fff';
                });
        }
    }

    appendInfoElementClass(cls, node) {
        this.appendInfoElement(cls, true, node);
    }

    appendInfoElementProperty(cls, property, value) {
        this.appendInfoElement(cls, false, property, value);
    }

    appendInfoElementRelationship(cls, relationship) {
        this.appendInfoElement(cls, false, relationship);
    }

    appendNode() {
        return this.node.enter()
            .append('g')
            .attr('class', d => {
                let highlight, i,
                    classes = 'node';

                if (this.icon(d)) {
                    classes += ' node-icon';
                }

                if (this.image(d)) {
                    classes += ' node-image';
                }

                if (this.options.highlight) {
                    for (i = 0; i < this.options.highlight.length; i++) {
                        highlight = this.options.highlight[i];

                        if (d.labels[0] === highlight.class && d.properties[highlight.property] === highlight.value) {
                            classes += ' node-highlighted';
                            break;
                        }
                    }
                }

                return classes;
            })
            .on('click', d => {
                d.fx = d.fy = null;

                if (typeof this.options.onNodeClick === 'function') {
                    this.options.onNodeClick(d);
                }
            })
            .on('dblclick', d => {
                this.stickNode(d);

                if (typeof this.options.onNodeDoubleClick === 'function') {
                    this.options.onNodeDoubleClick(d);
                }
            })
            .on('mouseenter', d => {
                if (this.info) {
                    this.updateInfo(d);
                }

                if (typeof this.options.onNodeMouseEnter === 'function') {
                    this.options.onNodeMouseEnter(d);
                }
            })
            .on('mouseleave', d => {
                if (this.info) {
                    this.clearInfo();
                }

                if (typeof this.options.onNodeMouseLeave === 'function') {
                    this.options.onNodeMouseLeave(d);
                }
            })
            .call(d3.drag()
                .on('start', d => this.dragStarted(d))
                .on('drag', d => this.dragged(d))
                .on('end', d => this.dragEnded(d)));
    }

    appendNodeToGraph() {
        let n = this.appendNode();

        this.appendRingToNode(n);
        this.appendOutlineToNode(n);

        if (this.options.icons) {
            this.appendTextToNode(n);
        }

        if (this.options.images) {
            this.appendImageToNode(n);
        }

        return n;
    }

    appendOutlineToNode(node) {
        return node.append('circle')
            .attr('class', 'outline')
            .attr('r', this.options.nodeRadius)
            .style('fill', d => {
                return this.options.nodeOutlineFillColor ? this.options.nodeOutlineFillColor : this.class2color(d.labels[0]);
            })
            .style('stroke', d => {
                return this.options.nodeOutlineFillColor ? this.class2darkenColor(this.options.nodeOutlineFillColor) : this.class2darkenColor(d.labels[0]);
            })
            .append('title').text(_ => {
                return toString();
            });
    }

    appendRingToNode(node) {
        return node.append('circle')
            .attr('class', 'ring')
            .attr('r', this.options.nodeRadius * 1.16)
            .append('title').text(_ => {
                return toString();
            });
    }

    appendTextToNode(node) {
        return node.append('text')
            .attr('class', d => {
                return 'text' + (this.icon(d) ? ' icon' : '');
            })
            .attr('fill', '#ffffff')
            .attr('font-size', d => {
                return this.icon(d) ? (this.options.nodeRadius + 'px') : '10px';
            })
            .attr('pointer-events', 'none')
            .attr('text-anchor', 'middle')
            .attr('y', d => {
                return this.icon(d) ? (Math.round(this.options.nodeRadius * 0.32) + 'px') : '4px';
            })
            .html(d => {
                let _icon = this.icon(d);
                return _icon ? '&#x' + _icon : d.id;
            });
    }

    appendRandomDataToNode(d, maxNodesToGenerate) {
        let data = this.randomD3Data(d, maxNodesToGenerate);
        this.updateWithNeo4jData(data);
    }

    appendRelationship() {
        return this.relationship.enter()
            .append('g')
            .attr('class', 'relationship')
            .on('dblclick', d => {
                if (typeof this.options.onRelationshipDoubleClick === 'function') {
                    this.options.onRelationshipDoubleClick(d);
                }
            })
            .on('mouseenter', d => {
                if (this.info) {
                    this.updateInfo(d);
                }
            })
    }

    appendOutlineToRelationship(r) {
        return r.append('path')
            .attr('class', 'outline')
            .attr('fill', '#a5abb6')
            .attr('stroke', 'none');
    }

    appendOverlayToRelationship(r) {
        return r.append('path')
            .attr('class', 'overlay');
    }

    appendTextToRelationship(r) {
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

    appendRelationshipToGraph() {
        let relationship = this.appendRelationship(),
            text = this.appendTextToRelationship(relationship),
            outline = this.appendOutlineToRelationship(relationship),
            overlay = this.appendOverlayToRelationship(relationship);

        return {
            outline: outline,
            overlay: overlay,
            relationship: relationship,
            text: text
        };
    }

    class2color(cls) {
        let color = this.classes2colors[cls];

        if (!color) {
//            color = options.colors[Math.min(numClasses, options.colors.length - 1)];
            color = this.options.colors[this.numClasses % this.options.colors.length];
            this.classes2colors[cls] = color;
            this.numClasses++;
        }

        return color;
    }

    class2darkenColor(cls) {
        return d3.rgb(this.class2color(cls)).darker(1);
    }

    clearInfo() {
        this.info.html('');
    }

    color() {
        return this.options.colors[this.options.colors.length * Math.random() << 0];
    }

    colors() {
        // d3.schemeCategory10,
        // d3.schemeCategory20,
        return [
            '#68bdf6', // light blue
            '#6dce9e', // green #1
            '#faafc2', // light pink
            '#f2baf6', // purple
            '#ff928c', // light red
            '#fcea7e', // light yellow
            '#ffc766', // light orange
            '#405f9e', // navy blue
            '#a5abb6', // dark gray
            '#78cecb', // green #2,
            '#b88cbb', // dark purple
            '#ced2d9', // light gray
            '#e84646', // dark red
            '#fa5f86', // dark pink
            '#ffab1a', // dark orange
            '#fcda19', // dark yellow
            '#797b80', // black
            '#c9d96f', // pistacchio
            '#47991f', // green #3
            '#70edee', // turquoise
            '#ff75ea'  // pink
        ];
    }

    contains(array, id) {
        let filter = array.filter(elem => elem.id === id);

        return filter.length > 0;
    }

    defaultColor() {
        return this.options.relationshipColor;
    }

    defaultDarkenColor() {
        return d3.rgb(this.options.colors[this.options.colors.length - 1]).darker(1);
    }

    dragEnded(d) {
        if (!d3.event.active) {
            this.simulation.alphaTarget(0);
        }

        if (typeof this.options.onNodeDragEnd === 'function') {
            this.options.onNodeDragEnd(d);
        }
    }

    dragged(d) {
        this.stickNode(d);
    }

    dragStarted(d) {
        if (!d3.event.active) {
            this.simulation.alphaTarget(0.3).restart();
        }

        d.fx = d.x;
        d.fy = d.y;

        if (typeof this.options.onNodeDragStart === 'function') {
            this.options.onNodeDragStart(d);
        }
    }

    extend(obj1, obj2) {
        let obj = {};

        this.merge(obj, obj1);
        this.merge(obj, obj2);

        return obj;
    }

    fontAwesomeIcons() {
        return {
            'glass': 'f000',
            'music': 'f001',
            'search': 'f002',
            'envelope-o': 'f003',
            'heart': 'f004',
            'star': 'f005',
            'star-o': 'f006',
            'user': 'f007',
            'film': 'f008',
            'th-large': 'f009',
            'th': 'f00a',
            'th-list': 'f00b',
            'check': 'f00c',
            'remove,close,times': 'f00d',
            'search-plus': 'f00e',
            'search-minus': 'f010',
            'power-off': 'f011',
            'signal': 'f012',
            'gear,cog': 'f013',
            'trash-o': 'f014',
            'home': 'f015',
            'file-o': 'f016',
            'clock-o': 'f017',
            'road': 'f018',
            'download': 'f019',
            'arrow-circle-o-down': 'f01a',
            'arrow-circle-o-up': 'f01b',
            'inbox': 'f01c',
            'play-circle-o': 'f01d',
            'rotate-right,repeat': 'f01e',
            'refresh': 'f021',
            'list-alt': 'f022',
            'lock': 'f023',
            'flag': 'f024',
            'headphones': 'f025',
            'volume-off': 'f026',
            'volume-down': 'f027',
            'volume-up': 'f028',
            'qrcode': 'f029',
            'barcode': 'f02a',
            'tag': 'f02b',
            'tags': 'f02c',
            'book': 'f02d',
            'bookmark': 'f02e',
            'print': 'f02f',
            'camera': 'f030',
            'font': 'f031',
            'bold': 'f032',
            'italic': 'f033',
            'text-height': 'f034',
            'text-width': 'f035',
            'align-left': 'f036',
            'align-center': 'f037',
            'align-right': 'f038',
            'align-justify': 'f039',
            'list': 'f03a',
            'dedent,outdent': 'f03b',
            'indent': 'f03c',
            'video-camera': 'f03d',
            'photo,image,picture-o': 'f03e',
            'pencil': 'f040',
            'map-marker': 'f041',
            'adjust': 'f042',
            'tint': 'f043',
            'edit,pencil-square-o': 'f044',
            'share-square-o': 'f045',
            'check-square-o': 'f046',
            'arrows': 'f047',
            'step-backward': 'f048',
            'fast-backward': 'f049',
            'backward': 'f04a',
            'play': 'f04b',
            'pause': 'f04c',
            'stop': 'f04d',
            'forward': 'f04e',
            'fast-forward': 'f050',
            'step-forward': 'f051',
            'eject': 'f052',
            'chevron-left': 'f053',
            'chevron-right': 'f054',
            'plus-circle': 'f055',
            'minus-circle': 'f056',
            'times-circle': 'f057',
            'check-circle': 'f058',
            'question-circle': 'f059',
            'info-circle': 'f05a',
            'crosshairs': 'f05b',
            'times-circle-o': 'f05c',
            'check-circle-o': 'f05d',
            'ban': 'f05e',
            'arrow-left': 'f060',
            'arrow-right': 'f061',
            'arrow-up': 'f062',
            'arrow-down': 'f063',
            'mail-forward,share': 'f064',
            'expand': 'f065',
            'compress': 'f066',
            'plus': 'f067',
            'minus': 'f068',
            'asterisk': 'f069',
            'exclamation-circle': 'f06a',
            'gift': 'f06b',
            'leaf': 'f06c',
            'fire': 'f06d',
            'eye': 'f06e',
            'eye-slash': 'f070',
            'warning,exclamation-triangle': 'f071',
            'plane': 'f072',
            'calendar': 'f073',
            'random': 'f074',
            'comment': 'f075',
            'magnet': 'f076',
            'chevron-up': 'f077',
            'chevron-down': 'f078',
            'retweet': 'f079',
            'shopping-cart': 'f07a',
            'folder': 'f07b',
            'folder-open': 'f07c',
            'arrows-v': 'f07d',
            'arrows-h': 'f07e',
            'bar-chart-o,bar-chart': 'f080',
            'twitter-square': 'f081',
            'facebook-square': 'f082',
            'camera-retro': 'f083',
            'key': 'f084',
            'gears,cogs': 'f085',
            'comments': 'f086',
            'thumbs-o-up': 'f087',
            'thumbs-o-down': 'f088',
            'star-half': 'f089',
            'heart-o': 'f08a',
            'sign-out': 'f08b',
            'linkedin-square': 'f08c',
            'thumb-tack': 'f08d',
            'external-link': 'f08e',
            'sign-in': 'f090',
            'trophy': 'f091',
            'github-square': 'f092',
            'upload': 'f093',
            'lemon-o': 'f094',
            'phone': 'f095',
            'square-o': 'f096',
            'bookmark-o': 'f097',
            'phone-square': 'f098',
            'twitter': 'f099',
            'facebook-f,facebook': 'f09a',
            'github': 'f09b',
            'unlock': 'f09c',
            'credit-card': 'f09d',
            'feed,rss': 'f09e',
            'hdd-o': 'f0a0',
            'bullhorn': 'f0a1',
            'bell': 'f0f3',
            'certificate': 'f0a3',
            'hand-o-right': 'f0a4',
            'hand-o-left': 'f0a5',
            'hand-o-up': 'f0a6',
            'hand-o-down': 'f0a7',
            'arrow-circle-left': 'f0a8',
            'arrow-circle-right': 'f0a9',
            'arrow-circle-up': 'f0aa',
            'arrow-circle-down': 'f0ab',
            'globe': 'f0ac',
            'wrench': 'f0ad',
            'tasks': 'f0ae',
            'filter': 'f0b0',
            'briefcase': 'f0b1',
            'arrows-alt': 'f0b2',
            'group,users': 'f0c0',
            'chain,link': 'f0c1',
            'cloud': 'f0c2',
            'flask': 'f0c3',
            'cut,scissors': 'f0c4',
            'copy,files-o': 'f0c5',
            'paperclip': 'f0c6',
            'save,floppy-o': 'f0c7',
            'square': 'f0c8',
            'navicon,reorder,bars': 'f0c9',
            'list-ul': 'f0ca',
            'list-ol': 'f0cb',
            'strikethrough': 'f0cc',
            'underline': 'f0cd',
            'table': 'f0ce',
            'magic': 'f0d0',
            'truck': 'f0d1',
            'pinterest': 'f0d2',
            'pinterest-square': 'f0d3',
            'google-plus-square': 'f0d4',
            'google-plus': 'f0d5',
            'money': 'f0d6',
            'caret-down': 'f0d7',
            'caret-up': 'f0d8',
            'caret-left': 'f0d9',
            'caret-right': 'f0da',
            'columns': 'f0db',
            'unsorted,sort': 'f0dc',
            'sort-down,sort-desc': 'f0dd',
            'sort-up,sort-asc': 'f0de',
            'envelope': 'f0e0',
            'linkedin': 'f0e1',
            'rotate-left,undo': 'f0e2',
            'legal,gavel': 'f0e3',
            'dashboard,tachometer': 'f0e4',
            'comment-o': 'f0e5',
            'comments-o': 'f0e6',
            'flash,bolt': 'f0e7',
            'sitemap': 'f0e8',
            'umbrella': 'f0e9',
            'paste,clipboard': 'f0ea',
            'lightbulb-o': 'f0eb',
            'exchange': 'f0ec',
            'cloud-download': 'f0ed',
            'cloud-upload': 'f0ee',
            'user-md': 'f0f0',
            'stethoscope': 'f0f1',
            'suitcase': 'f0f2',
            'bell-o': 'f0a2',
            'coffee': 'f0f4',
            'cutlery': 'f0f5',
            'file-text-o': 'f0f6',
            'building-o': 'f0f7',
            'hospital-o': 'f0f8',
            'ambulance': 'f0f9',
            'medkit': 'f0fa',
            'fighter-jet': 'f0fb',
            'beer': 'f0fc',
            'h-square': 'f0fd',
            'plus-square': 'f0fe',
            'angle-double-left': 'f100',
            'angle-double-right': 'f101',
            'angle-double-up': 'f102',
            'angle-double-down': 'f103',
            'angle-left': 'f104',
            'angle-right': 'f105',
            'angle-up': 'f106',
            'angle-down': 'f107',
            'desktop': 'f108',
            'laptop': 'f109',
            'tablet': 'f10a',
            'mobile-phone,mobile': 'f10b',
            'circle-o': 'f10c',
            'quote-left': 'f10d',
            'quote-right': 'f10e',
            'spinner': 'f110',
            'circle': 'f111',
            'mail-reply,reply': 'f112',
            'github-alt': 'f113',
            'folder-o': 'f114',
            'folder-open-o': 'f115',
            'smile-o': 'f118',
            'frown-o': 'f119',
            'meh-o': 'f11a',
            'gamepad': 'f11b',
            'keyboard-o': 'f11c',
            'flag-o': 'f11d',
            'flag-checkered': 'f11e',
            'terminal': 'f120',
            'code': 'f121',
            'mail-reply-all,reply-all': 'f122',
            'star-half-empty,star-half-full,star-half-o': 'f123',
            'location-arrow': 'f124',
            'crop': 'f125',
            'code-fork': 'f126',
            'unlink,chain-broken': 'f127',
            'question': 'f128',
            'info': 'f129',
            'exclamation': 'f12a',
            'superscript': 'f12b',
            'subscript': 'f12c',
            'eraser': 'f12d',
            'puzzle-piece': 'f12e',
            'microphone': 'f130',
            'microphone-slash': 'f131',
            'shield': 'f132',
            'calendar-o': 'f133',
            'fire-extinguisher': 'f134',
            'rocket': 'f135',
            'maxcdn': 'f136',
            'chevron-circle-left': 'f137',
            'chevron-circle-right': 'f138',
            'chevron-circle-up': 'f139',
            'chevron-circle-down': 'f13a',
            'html5': 'f13b',
            'css3': 'f13c',
            'anchor': 'f13d',
            'unlock-alt': 'f13e',
            'bullseye': 'f140',
            'ellipsis-h': 'f141',
            'ellipsis-v': 'f142',
            'rss-square': 'f143',
            'play-circle': 'f144',
            'ticket': 'f145',
            'minus-square': 'f146',
            'minus-square-o': 'f147',
            'level-up': 'f148',
            'level-down': 'f149',
            'check-square': 'f14a',
            'pencil-square': 'f14b',
            'external-link-square': 'f14c',
            'share-square': 'f14d',
            'compass': 'f14e',
            'toggle-down,caret-square-o-down': 'f150',
            'toggle-up,caret-square-o-up': 'f151',
            'toggle-right,caret-square-o-right': 'f152',
            'euro,eur': 'f153',
            'gbp': 'f154',
            'dollar,usd': 'f155',
            'rupee,inr': 'f156',
            'cny,rmb,yen,jpy': 'f157',
            'ruble,rouble,rub': 'f158',
            'won,krw': 'f159',
            'bitcoin,btc': 'f15a',
            'file': 'f15b',
            'file-text': 'f15c',
            'sort-alpha-asc': 'f15d',
            'sort-alpha-desc': 'f15e',
            'sort-amount-asc': 'f160',
            'sort-amount-desc': 'f161',
            'sort-numeric-asc': 'f162',
            'sort-numeric-desc': 'f163',
            'thumbs-up': 'f164',
            'thumbs-down': 'f165',
            'youtube-square': 'f166',
            'youtube': 'f167',
            'xing': 'f168',
            'xing-square': 'f169',
            'youtube-play': 'f16a',
            'dropbox': 'f16b',
            'stack-overflow': 'f16c',
            'instagram': 'f16d',
            'flickr': 'f16e',
            'adn': 'f170',
            'bitbucket': 'f171',
            'bitbucket-square': 'f172',
            'tumblr': 'f173',
            'tumblr-square': 'f174',
            'long-arrow-down': 'f175',
            'long-arrow-up': 'f176',
            'long-arrow-left': 'f177',
            'long-arrow-right': 'f178',
            'apple': 'f179',
            'windows': 'f17a',
            'android': 'f17b',
            'linux': 'f17c',
            'dribbble': 'f17d',
            'skype': 'f17e',
            'foursquare': 'f180',
            'trello': 'f181',
            'female': 'f182',
            'male': 'f183',
            'gittip,gratipay': 'f184',
            'sun-o': 'f185',
            'moon-o': 'f186',
            'archive': 'f187',
            'bug': 'f188',
            'vk': 'f189',
            'weibo': 'f18a',
            'renren': 'f18b',
            'pagelines': 'f18c',
            'stack-exchange': 'f18d',
            'arrow-circle-o-right': 'f18e',
            'arrow-circle-o-left': 'f190',
            'toggle-left,caret-square-o-left': 'f191',
            'dot-circle-o': 'f192',
            'wheelchair': 'f193',
            'vimeo-square': 'f194',
            'turkish-lira,try': 'f195',
            'plus-square-o': 'f196',
            'space-shuttle': 'f197',
            'slack': 'f198',
            'envelope-square': 'f199',
            'wordpress': 'f19a',
            'openid': 'f19b',
            'institution,bank,university': 'f19c',
            'mortar-board,graduation-cap': 'f19d',
            'yahoo': 'f19e',
            'google': 'f1a0',
            'reddit': 'f1a1',
            'reddit-square': 'f1a2',
            'stumbleupon-circle': 'f1a3',
            'stumbleupon': 'f1a4',
            'delicious': 'f1a5',
            'digg': 'f1a6',
            'pied-piper-pp': 'f1a7',
            'pied-piper-alt': 'f1a8',
            'drupal': 'f1a9',
            'joomla': 'f1aa',
            'language': 'f1ab',
            'fax': 'f1ac',
            'building': 'f1ad',
            'child': 'f1ae',
            'paw': 'f1b0',
            'spoon': 'f1b1',
            'cube': 'f1b2',
            'cubes': 'f1b3',
            'behance': 'f1b4',
            'behance-square': 'f1b5',
            'steam': 'f1b6',
            'steam-square': 'f1b7',
            'recycle': 'f1b8',
            'automobile,car': 'f1b9',
            'cab,taxi': 'f1ba',
            'tree': 'f1bb',
            'spotify': 'f1bc',
            'deviantart': 'f1bd',
            'soundcloud': 'f1be',
            'database': 'f1c0',
            'file-pdf-o': 'f1c1',
            'file-word-o': 'f1c2',
            'file-excel-o': 'f1c3',
            'file-powerpoint-o': 'f1c4',
            'file-photo-o,file-picture-o,file-image-o': 'f1c5',
            'file-zip-o,file-archive-o': 'f1c6',
            'file-sound-o,file-audio-o': 'f1c7',
            'file-movie-o,file-video-o': 'f1c8',
            'file-code-o': 'f1c9',
            'vine': 'f1ca',
            'codepen': 'f1cb',
            'jsfiddle': 'f1cc',
            'life-bouy,life-buoy,life-saver,support,life-ring': 'f1cd',
            'circle-o-notch': 'f1ce',
            'ra,resistance,rebel': 'f1d0',
            'ge,empire': 'f1d1',
            'git-square': 'f1d2',
            'git': 'f1d3',
            'y-combinator-square,yc-square,hacker-news': 'f1d4',
            'tencent-weibo': 'f1d5',
            'qq': 'f1d6',
            'wechat,weixin': 'f1d7',
            'send,paper-plane': 'f1d8',
            'send-o,paper-plane-o': 'f1d9',
            'history': 'f1da',
            'circle-thin': 'f1db',
            'header': 'f1dc',
            'paragraph': 'f1dd',
            'sliders': 'f1de',
            'share-alt': 'f1e0',
            'share-alt-square': 'f1e1',
            'bomb': 'f1e2',
            'soccer-ball-o,futbol-o': 'f1e3',
            'tty': 'f1e4',
            'binoculars': 'f1e5',
            'plug': 'f1e6',
            'slideshare': 'f1e7',
            'twitch': 'f1e8',
            'yelp': 'f1e9',
            'newspaper-o': 'f1ea',
            'wifi': 'f1eb',
            'calculator': 'f1ec',
            'paypal': 'f1ed',
            'google-wallet': 'f1ee',
            'cc-visa': 'f1f0',
            'cc-mastercard': 'f1f1',
            'cc-discover': 'f1f2',
            'cc-amex': 'f1f3',
            'cc-paypal': 'f1f4',
            'cc-stripe': 'f1f5',
            'bell-slash': 'f1f6',
            'bell-slash-o': 'f1f7',
            'trash': 'f1f8',
            'copyright': 'f1f9',
            'at': 'f1fa',
            'eyedropper': 'f1fb',
            'paint-brush': 'f1fc',
            'birthday-cake': 'f1fd',
            'area-chart': 'f1fe',
            'pie-chart': 'f200',
            'line-chart': 'f201',
            'lastfm': 'f202',
            'lastfm-square': 'f203',
            'toggle-off': 'f204',
            'toggle-on': 'f205',
            'bicycle': 'f206',
            'bus': 'f207',
            'ioxhost': 'f208',
            'angellist': 'f209',
            'cc': 'f20a',
            'shekel,sheqel,ils': 'f20b',
            'meanpath': 'f20c',
            'buysellads': 'f20d',
            'connectdevelop': 'f20e',
            'dashcube': 'f210',
            'forumbee': 'f211',
            'leanpub': 'f212',
            'sellsy': 'f213',
            'shirtsinbulk': 'f214',
            'simplybuilt': 'f215',
            'skyatlas': 'f216',
            'cart-plus': 'f217',
            'cart-arrow-down': 'f218',
            'diamond': 'f219',
            'ship': 'f21a',
            'user-secret': 'f21b',
            'motorcycle': 'f21c',
            'street-view': 'f21d',
            'heartbeat': 'f21e',
            'venus': 'f221',
            'mars': 'f222',
            'mercury': 'f223',
            'intersex,transgender': 'f224',
            'transgender-alt': 'f225',
            'venus-double': 'f226',
            'mars-double': 'f227',
            'venus-mars': 'f228',
            'mars-stroke': 'f229',
            'mars-stroke-v': 'f22a',
            'mars-stroke-h': 'f22b',
            'neuter': 'f22c',
            'genderless': 'f22d',
            'facebook-official': 'f230',
            'pinterest-p': 'f231',
            'whatsapp': 'f232',
            'server': 'f233',
            'user-plus': 'f234',
            'user-times': 'f235',
            'hotel,bed': 'f236',
            'viacoin': 'f237',
            'train': 'f238',
            'subway': 'f239',
            'medium': 'f23a',
            'yc,y-combinator': 'f23b',
            'optin-monster': 'f23c',
            'opencart': 'f23d',
            'expeditedssl': 'f23e',
            'battery-4,battery-full': 'f240',
            'battery-3,battery-three-quarters': 'f241',
            'battery-2,battery-half': 'f242',
            'battery-1,battery-quarter': 'f243',
            'battery-0,battery-empty': 'f244',
            'mouse-pointer': 'f245',
            'i-cursor': 'f246',
            'object-group': 'f247',
            'object-ungroup': 'f248',
            'sticky-note': 'f249',
            'sticky-note-o': 'f24a',
            'cc-jcb': 'f24b',
            'cc-diners-club': 'f24c',
            'clone': 'f24d',
            'balance-scale': 'f24e',
            'hourglass-o': 'f250',
            'hourglass-1,hourglass-start': 'f251',
            'hourglass-2,hourglass-half': 'f252',
            'hourglass-3,hourglass-end': 'f253',
            'hourglass': 'f254',
            'hand-grab-o,hand-rock-o': 'f255',
            'hand-stop-o,hand-paper-o': 'f256',
            'hand-scissors-o': 'f257',
            'hand-lizard-o': 'f258',
            'hand-spock-o': 'f259',
            'hand-pointer-o': 'f25a',
            'hand-peace-o': 'f25b',
            'trademark': 'f25c',
            'registered': 'f25d',
            'creative-commons': 'f25e',
            'gg': 'f260',
            'gg-circle': 'f261',
            'tripadvisor': 'f262',
            'odnoklassniki': 'f263',
            'odnoklassniki-square': 'f264',
            'get-pocket': 'f265',
            'wikipedia-w': 'f266',
            'safari': 'f267',
            'chrome': 'f268',
            'firefox': 'f269',
            'opera': 'f26a',
            'internet-explorer': 'f26b',
            'tv,television': 'f26c',
            'contao': 'f26d',
            '500px': 'f26e',
            'amazon': 'f270',
            'calendar-plus-o': 'f271',
            'calendar-minus-o': 'f272',
            'calendar-times-o': 'f273',
            'calendar-check-o': 'f274',
            'industry': 'f275',
            'map-pin': 'f276',
            'map-signs': 'f277',
            'map-o': 'f278',
            'map': 'f279',
            'commenting': 'f27a',
            'commenting-o': 'f27b',
            'houzz': 'f27c',
            'vimeo': 'f27d',
            'black-tie': 'f27e',
            'fonticons': 'f280',
            'reddit-alien': 'f281',
            'edge': 'f282',
            'credit-card-alt': 'f283',
            'codiepie': 'f284',
            'modx': 'f285',
            'fort-awesome': 'f286',
            'usb': 'f287',
            'product-hunt': 'f288',
            'mixcloud': 'f289',
            'scribd': 'f28a',
            'pause-circle': 'f28b',
            'pause-circle-o': 'f28c',
            'stop-circle': 'f28d',
            'stop-circle-o': 'f28e',
            'shopping-bag': 'f290',
            'shopping-basket': 'f291',
            'hashtag': 'f292',
            'bluetooth': 'f293',
            'bluetooth-b': 'f294',
            'percent': 'f295',
            'gitlab': 'f296',
            'wpbeginner': 'f297',
            'wpforms': 'f298',
            'envira': 'f299',
            'universal-access': 'f29a',
            'wheelchair-alt': 'f29b',
            'question-circle-o': 'f29c',
            'blind': 'f29d',
            'audio-description': 'f29e',
            'volume-control-phone': 'f2a0',
            'braille': 'f2a1',
            'assistive-listening-systems': 'f2a2',
            'asl-interpreting,american-sign-language-interpreting': 'f2a3',
            'deafness,hard-of-hearing,deaf': 'f2a4',
            'glide': 'f2a5',
            'glide-g': 'f2a6',
            'signing,sign-language': 'f2a7',
            'low-vision': 'f2a8',
            'viadeo': 'f2a9',
            'viadeo-square': 'f2aa',
            'snapchat': 'f2ab',
            'snapchat-ghost': 'f2ac',
            'snapchat-square': 'f2ad',
            'pied-piper': 'f2ae',
            'first-order': 'f2b0',
            'yoast': 'f2b1',
            'themeisle': 'f2b2',
            'google-plus-circle,google-plus-official': 'f2b3',
            'fa,font-awesome': 'f2b4'
        };
    }

    icon(d) {
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

    image(d) {
        let i, imagesForLabel, img, imgLevel, label, labelPropertyValue, property, value;

        if (this.options.images) {
            imagesForLabel = this.options.imageMap[d.labels[0]];

            if (imagesForLabel) {
                imgLevel = 0;

                for (i = 0; i < imagesForLabel.length; i++) {
                    labelPropertyValue = imagesForLabel[i].split('|');

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

    initIconMap() {
        Object.keys(this.options.iconMap).forEach(key => {
            let keys = key.split(','),
                value = this.options.iconMap[key];

            keys.forEach(key => {
                this.options.iconMap[key] = value;
            });
        });
    }

    initImageMap() {
        let key, keys;

        for (key in this.options.images) {
            if (this.options.images.hasOwnProperty(key)) {
                keys = key.split('|');

                if (!this.options.imageMap[keys[0]]) {
                    this.options.imageMap[keys[0]] = [key];
                } else {
                    this.options.imageMap[keys[0]].push(key);
                }
            }
        }
    }

    initSimulation() {
        return d3.forceSimulation()
            //                           .velocityDecay(0.8)
            //                           .force('x', d3.force().strength(0.002))
            //                           .force('y', d3.force().strength(0.002))
            .force('collide', d3.forceCollide().radius(() => {
                return this.options.minCollision;
            }).iterations(2))
            .force('charge', d3.forceManyBody())
            .force('link', d3.forceLink().id(d => {
                return (d as any).id;
                // return d.index.toString();
            }))
            .force('center', d3.forceCenter(this.svg.node().parentElement.parentElement.clientWidth / 2, this.svg.node().parentElement.parentElement.clientHeight / 2))
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

    loadNeo4jData() {
        this.nodes = [];
        this.relationships = [];

        this.updateWithNeo4jData(this.options.neo4jData);
    }

    /**
     * @deprecated
     */
    loadNeo4jDataFromUrl(neo4jDataUrl) {
        // this.nodes = [];
        // this.relationships = [];

        // d3.json(neo4jDataUrl, (error, data) => {
        //     if (error) {
        //         throw error;
        //     }
        //
        //     this.updateWithNeo4jData(data);
        // });
    }

    merge(target, source) {
        Object.keys(source).forEach(function (property) {
            target[property] = source[property];
        });
    }

    neo4jDataToD3Data(data) {
        let graph = {
            nodes: [],
            relationships: []
        };

        data.results.forEach(result => {
            result.data.forEach(data => {
                data.graph.nodes.forEach(node => {
                    if (!this.contains(graph.nodes, node.id)) {
                        graph.nodes.push(node);
                    }
                });

                data.graph.relationships.forEach(function (relationship) {
                    relationship.source = relationship.startNode;
                    relationship.target = relationship.endNode;
                    graph.relationships.push(relationship);
                });

                data.graph.relationships.sort(function (a, b) {
                    if (a.source > b.source) {
                        return 1;
                    } else if (a.source < b.source) {
                        return -1;
                    } else {
                        if (a.target > b.target) {
                            return 1;
                        }

                        if (a.target < b.target) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }
                });

                for (let i = 0; i < data.graph.relationships.length; i++) {
                    if (i !== 0 && data.graph.relationships[i].source === data.graph.relationships[i - 1].source && data.graph.relationships[i].target === data.graph.relationships[i - 1].target) {
                        data.graph.relationships[i].linknum = data.graph.relationships[i - 1].linknum + 1;
                    } else {
                        data.graph.relationships[i].linknum = 1;
                    }
                }
            });
        });

        return graph;
    }

    randomD3Data(d, maxNodesToGenerate) {
        let data = {
                nodes: [],
                relationships: []
            },
            i,
            label,
            node,
            numNodes = (maxNodesToGenerate * Math.random() << 0) + 1,
            relationship,
            s = this.size();

        for (i = 0; i < numNodes; i++) {
            label = this.randomLabel();

            node = {
                id: s.nodes + 1 + i,
                labels: [label],
                properties: {
                    random: label
                },
                x: d.x,
                y: d.y
            };

            data.nodes[data.nodes.length] = node;

            relationship = {
                id: s.relationships + 1 + i,
                type: label.toUpperCase(),
                startNode: d.id,
                endNode: s.nodes + 1 + i,
                properties: {
                    from: Date.now()
                },
                source: d.id,
                target: s.nodes + 1 + i,
                linknum: s.relationships + 1 + i
            };

            data.relationships[data.relationships.length] = relationship;
        }

        return data;
    }

    randomLabel() {
        let icons = Object.keys(this.options.iconMap);
        return icons[icons.length * Math.random() << 0];
    }

    rotate(cx, cy, x, y, angle) {
        let radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;

        return {x: nx, y: ny};
    }

    rotatePoint(c, p, angle) {
        return this.rotate(c.x, c.y, p.x, p.y, angle);
    }

    rotation(source, target) {
        return Math.atan2(target.y - source.y, target.x - source.x) * 180 / Math.PI;
    }

    size() {
        return {
            nodes: this.nodes.length,
            relationships: this.relationships.length
        };
    }

    stickNode(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    tick() {
        this.tickNodes();
        this.tickRelationships();
    }

    tickNodes() {
        if (this.node) {
            this.node.attr('transform', function (d) {
                return 'translate(' + d.x + ', ' + d.y + ')';
            });
        }
    }

    tickRelationships() {
        if (this.relationship) {
            this.relationship.attr('transform',  d => {
                let angle = this.rotation(d.source, d.target);
                return 'translate(' + d.source.x + ', ' + d.source.y + ') rotate(' + angle + ')';
            });

            this.tickRelationshipsTexts();
            this.tickRelationshipsOutlines();
            this.tickRelationshipsOverlays();
        }
    }

    tickRelationshipsOutlines() {
        let network = this;

        this.relationship.each(function() {
            let rel = d3.select(this),
                outline = rel.select('.outline'),
                text = rel.select('.text');

            outline.attr('d', function(d: any) {
                let center = {x: 0, y: 0},
                    angle = network.rotation(d.source, d.target),
                    textBoundingBox = (text.node() as SVGGraphicsElement).getBBox(),
                    textPadding = 5,
                    u = network.unitaryVector(d.source, d.target),
                    textMargin = {
                        x: (d.target.x - d.source.x - (textBoundingBox.width + textPadding) * u.x) * 0.5,
                        y: (d.target.y - d.source.y - (textBoundingBox.width + textPadding) * u.y) * 0.5
                    },
                    n = network.unitaryNormalVector(d.source, d.target),
                    rotatedPointA1 = network.rotatePoint(center, {
                        x: (network.options.nodeRadius + 1) * u.x - n.x,
                        y: (network.options.nodeRadius + 1) * u.y - n.y
                    }, angle),
                    rotatedPointB1 = network.rotatePoint(center, {x: textMargin.x - n.x, y: textMargin.y - n.y}, angle),
                    rotatedPointC1 = network.rotatePoint(center, {x: textMargin.x, y: textMargin.y}, angle),
                    rotatedPointD1 = network.rotatePoint(center, {
                        x: (network.options.nodeRadius + 1) * u.x,
                        y: (network.options.nodeRadius + 1) * u.y
                    }, angle),
                    rotatedPointA2 = network.rotatePoint(center, {
                        x: d.target.x - d.source.x - textMargin.x - n.x,
                        y: d.target.y - d.source.y - textMargin.y - n.y
                    }, angle),
                    rotatedPointB2 = network.rotatePoint(center, {
                        x: d.target.x - d.source.x - (network.options.nodeRadius + 1) * u.x - n.x - u.x * network.options.arrowSize,
                        y: d.target.y - d.source.y - (network.options.nodeRadius + 1) * u.y - n.y - u.y * network.options.arrowSize
                    }, angle),
                    rotatedPointC2 = network.rotatePoint(center, {
                        x: d.target.x - d.source.x - (network.options.nodeRadius + 1) * u.x - n.x + (n.x - u.x) * network.options.arrowSize,
                        y: d.target.y - d.source.y - (network.options.nodeRadius + 1) * u.y - n.y + (n.y - u.y) * network.options.arrowSize
                    }, angle),
                    rotatedPointD2 = network.rotatePoint(center, {
                        x: d.target.x - d.source.x - (network.options.nodeRadius + 1) * u.x,
                        y: d.target.y - d.source.y - (network.options.nodeRadius + 1) * u.y
                    }, angle),
                    rotatedPointE2 = network.rotatePoint(center, {
                        x: d.target.x - d.source.x - (network.options.nodeRadius + 1) * u.x + (-n.x - u.x) * network.options.arrowSize,
                        y: d.target.y - d.source.y - (network.options.nodeRadius + 1) * u.y + (-n.y - u.y) * network.options.arrowSize
                    }, angle),
                    rotatedPointF2 = network.rotatePoint(center, {
                        x: d.target.x - d.source.x - (network.options.nodeRadius + 1) * u.x - u.x * network.options.arrowSize,
                        y: d.target.y - d.source.y - (network.options.nodeRadius + 1) * u.y - u.y * network.options.arrowSize
                    }, angle),
                    rotatedPointG2 = network.rotatePoint(center, {
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

    tickRelationshipsOverlays() {
        this.relationshipOverlay.attr('d', d => {
            let center = {x: 0, y: 0},
                angle = this.rotation(d.source, d.target),
                n1 = this.unitaryNormalVector(d.source, d.target),
                n = this.unitaryNormalVector(d.source, d.target, 50),
                rotatedPointA = this.rotatePoint(center, {x: 0 - n.x, y: 0 - n.y}, angle),
                rotatedPointB = this.rotatePoint(center, {
                    x: d.target.x - d.source.x - n.x,
                    y: d.target.y - d.source.y - n.y
                }, angle),
                rotatedPointC = this.rotatePoint(center, {
                    x: d.target.x - d.source.x + n.x - n1.x,
                    y: d.target.y - d.source.y + n.y - n1.y
                }, angle),
                rotatedPointD = this.rotatePoint(center, {x: 0 + n.x - n1.x, y: 0 + n.y - n1.y}, angle);

            return 'M ' + rotatedPointA.x + ' ' + rotatedPointA.y +
                ' L ' + rotatedPointB.x + ' ' + rotatedPointB.y +
                ' L ' + rotatedPointC.x + ' ' + rotatedPointC.y +
                ' L ' + rotatedPointD.x + ' ' + rotatedPointD.y +
                ' Z';
        });
    }

    tickRelationshipsTexts() {
        this.relationshipText.attr('transform', d => {
            let angle = (this.rotation(d.source, d.target) + 360) % 360,
                mirror = angle > 90 && angle < 270,
                center = {x: 0, y: 0},
                n = this.unitaryNormalVector(d.source, d.target),
                nWeight = mirror ? 2 : -3,
                point = {
                    x: (d.target.x - d.source.x) * 0.5 + n.x * nWeight,
                    y: (d.target.y - d.source.y) * 0.5 + n.y * nWeight
                },
                rotatedPoint = this.rotatePoint(center, point, angle);

            return 'translate(' + rotatedPoint.x + ', ' + rotatedPoint.y + ') rotate(' + (mirror ? 180 : 0) + ')';
        });
    }

    toString(d) {
        let s = d.labels ? d.labels[0] : d.type;

        s += ' (<id>: ' + d.id;

        Object.keys(d.properties).forEach(function (property) {
            s += ', ' + property + ': ' + JSON.stringify(d.properties[property]);
        });

        s += ')';

        return s;
    }

    unitaryNormalVector(source, target, newLength = null) {
        let center = {x: 0, y: 0},
            vector = this.unitaryVector(source, target, newLength);

        return this.rotatePoint(center, vector, 90);
    }

    unitaryVector(source, target, newLength = null) {
        let length = Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2)) / Math.sqrt(newLength || 1);

        return {
            x: (target.x - source.x) / length,
            y: (target.y - source.y) / length,
        };
    }

    updateWithD3Data(d3Data) {
        this.updateNodesAndRelationships(d3Data.nodes, d3Data.relationships);
    }

    updateWithNeo4jData(neo4jData) {
        let d3Data = this.neo4jDataToD3Data(neo4jData);
        this.updateWithD3Data(d3Data);
    }

    updateInfo(d) {
        this.clearInfo();

        if (d.labels) {
            this.appendInfoElementClass('class', d.labels[0]);
        } else {
            this.appendInfoElementRelationship('class', d.type);
        }

        this.appendInfoElementProperty('property', '&lt;id&gt;', d.id);

        Object.keys(d.properties).forEach(property => {
            this.appendInfoElementProperty('property', property, JSON.stringify(d.properties[property]));
        });
    }

    updateNodes(n) {
        Array.prototype.push.apply(this.nodes, n);

        this.node = this.svgNodes.selectAll('.node')
            .data(this.nodes, function (d) {
                return d.id;
            });
        let nodeEnter = this.appendNodeToGraph();
        this.node = nodeEnter.merge(this.node);
    }

    updateNodesAndRelationships(n, r) {
        this.updateRelationships(r);
        this.updateNodes(n);

        this.simulation.nodes(this.nodes);
        this.simulation.force('link').links(this.relationships);
    }

    updateRelationships(r) {
        Array.prototype.push.apply(this.relationships, r);

        this.relationship = this.svgRelationships.selectAll('.relationship')
            .data(this.relationships,  d => {
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

    version() {
        return this.VERSION;
    }

    zoomFit() {
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

    // Default exported methods:
    // appendRandomDataToNode: appendRandomDataToNode,
    // neo4jDataToD3Data: neo4jDataToD3Data,
    // randomD3Data: randomD3Data,
    // size: size,
    // updateWithD3Data: updateWithD3Data,
    // updateWithNeo4jData: updateWithNeo4jData,
    // version: version
}