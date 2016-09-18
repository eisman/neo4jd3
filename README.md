# neo4jd3.js

[Neo4j](https://github.com/neo4j) graph visualization using [D3.js](https://github.com/d3/d3).

![neo3jd3.js](https://eisman.github.io/neo4jd3/img/neo4jd3.jpg?v=2)

## Features

* Neo4j's JSON graph format.
* Force simulation.
* Info panel that shows nodes and relationships information on hover.
* Double click callbacks.
* Custom node colors by node type.
* Text or [Font Awesome](http://fontawesome.io/) icon nodes.
* Sticky nodes (drag to stick, single click to unstick).
* Dynamic graph update (e.g. double click a node to expand it).
* Relationship auto-orientation.
* Zoom, pan, auto fit.
* Compatible with D3.js v4.

## Running

Clone the repository, install all dependencies, build and serve the project:

```bash
> git clone https://github.com/eisman/neo4jd3.git
> npm install
> gulp
```

Open `http://localhost:8080` in your favourite browser.

## Documentation

```javascript
var neo4jd3 = new Neo4jd3('.selector', options);
```

### Options

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| **icons** | *object* | Map node labels to [Font Awesome icons](http://fontawesome.io/icons).<br>Example:<br>`{`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'Address': 'home',`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'BirthDate': 'calendar-o',`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'Password': 'asterisk',`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'Phone': 'phone',`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'User': 'user'`<br>`}`. |
| **infoPanel** | *boolean* | Show the information panel: `true`, `false`. Default: `true`. |
| **minCollision** | *int* | Minimum distance between nodes. Default: 2 * *nodeRadius*. |
| **neo4jDataUrl** | *string* | URL of the endpoint that serves the graph in [Neo4j data format](#neo4j-data-format). |
| **nodeRadius** | *int* | Radius of nodes. Default: 25. |
| **onNodeClick** | *function* | Callback function to be executed when the user clicks a node. |
| **onNodeDoubleClick** | *function* | Callback function to be executed when the user double clicks a node. |
| **onNodeDragEnd** | *function* | Callback function to be executed when the user finishes dragging a node. |
| **onNodeDragStart** | *function* | Callback function to be executed when the user starts dragging a node. |
| **onNodeMouseEnter** | *function* | Callback function to be executed when the mouse enters a node. |
| **onNodeMouseLeave** | *function* | Callback function to be executed when the mouse leaves a node. |
| **onRelationshipDoubleClick** | *function* | Callback function to be executed when the user double clicks a relationship. |
| **zoomFit** | *boolean* | Adjust the graph to the container once it has been loaded: `true`, `false`. Default: `false`. |

### JavaScript API

| Function | Description |
| -------- | ----------- |
| **appendRandomDataToNode**(*d*, *maxNodesToGenerate*) | Generates between 1 and *maxNodesToGenerate* random nodes connected to node *d* and updates the graph data. |
| **neo4jDataToD3Data**(*data*) | Converts data from [Neo4j data format](#neo4j-data-format) to [D3.js data format](#d3js-data-format). |
| **randomD3Data**(*d*, *maxNodesToGenerate*) | Generates between 1 and *maxNodesToGenerate* random nodes connected to node *d*. |
| **size**() | Returns the number of nodes and relationships.<br>Example:<br>`{`<br>&nbsp;&nbsp;&nbsp;&nbsp;`nodes: 25,`<br>&nbsp;&nbsp;&nbsp;&nbsp;`relationships: 50`<br>`}` |
| **updateWithD3Data**(*d3Data*) | Updates the graph data using the [D3.js data format](#d3js-data-format). |
| **updateWithNeo4jData**(*neo4jData*) | Updates the graph data using the [Neo4j data format](#neo4j-data-format). |
| **version**() | Returns the version of neo4jd3.js.<br>Example: `'0.0.1'` |

### Documentation

#### D3.js data format

```
{
    "nodes": [
        {
            "id": "1",
            "labels": ["User"],
            "properties": {
                "userId": "eisman"
            }
        },
        {
            "id": "8",
            "labels": ["Project"],
            "properties": {
                "name": "neo4jd3",
                "title": "neo4jd3.js",
                "description": "Neo4j graph visualization using D3.js.",
                "url": "https://eisman.github.io/neo4jd3"
            }
        }
    ],
    "relationships": [
        {
            "id": "7",
            "type": "DEVELOPES",
            "startNode": "1",
            "endNode": "8",
            "properties": {
                "from": 1470002400000
            },
            "source": "1",
            "target": "8",
            "linknum": 1
        }
    ]
}
```

#### Neo4j data format

```
{
    "results": [
        {
            "columns": ["user", "entity"],
            "data": [
                {
                    "graph": {
                        "nodes": [
                            {
                                "id": "1",
                                "labels": ["User"],
                                "properties": {
                                    "userId": "eisman"
                                }
                            },
                            {
                                "id": "8",
                                "labels": ["Project"],
                                "properties": {
                                    "name": "neo4jd3",
                                    "title": "neo4jd3.js",
                                    "description": "Neo4j graph visualization using D3.js.",
                                    "url": "https://eisman.github.io/neo4jd3"
                                }
                            }
                        ],
                        "relationships": [
                            {
                                "id": "7",
                                "type": "DEVELOPES",
                                "startNode": "1",
                                "endNode": "8",
                                "properties": {
                                    "from": 1470002400000
                                }
                            }
                        ]
                    }
                }
            ]
        }
    ],
    "errors": []
}
```

### Example

Live example @ [https://eisman.github.io/neo4jd3/](https://eisman.github.io/neo4jd3/)

```javascript
var neo4jd3 = new Neo4jd3('#neo4jd3', {
    icons: {
        'Address': 'home',
        'Api': 'gear',
        'BirthDate': 'birthday-cake',
        'Cookie': 'paw',
        'CreditCard': 'credit-card',
        'Device': 'laptop',
        'Email': 'at',
        'Git': 'git',
        'Github': 'github',
        'icons': 'font-awesome',
        'Ip': 'map-marker',
        'Issues': 'exclamation-circle',
        'Language': 'language',
        'Options': 'sliders',
        'Password': 'asterisk',
        'Phone': 'phone',
        'Project': 'folder-open',
        'SecurityChallengeAnswer': 'commenting',
        'User': 'user',
        'zoomFit': 'arrows-alt',
        'zoomIn': 'search-plus',
        'zoomOut': 'search-minus'
    },
    minCollision: 60,
    neo4jDataUrl: 'json/neo4jData.json',
    nodeRadius: 25,
    onNodeDoubleClick: function(node) {
        var maxNodes = 5,
            data = neo4jd3.randomD3Data(node, maxNodes);
        neo4jd3.updateWithD3Data(data);
    },
    zoomFit: true
});
```

## What's coming?

* More than one relationship between two nodes.
* Performance optimization.
* Testing.

## Copyright and license

Code and documentation copyright 2016 the author. Code released under the [MIT license](LICENSE). Docs released under [Creative Commons](docs/LICENSE).
