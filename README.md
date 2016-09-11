# neo4jd3.js

[Neo4j](https://github.com/neo4j) graph visualization using [D3.js](https://github.com/d3/d3).

![neo3jd3.js](https://eisman.github.io/neo4jd3/img/neo4jd3.jpg?v=2)

## Features

* Neo4j's JSON graph format.
* Force simulation.
* Info panel that shows nodes and relationships information on hover.
* Double click callbacks.
* Custom node colors by node type.
* [Font Awesome](http://fontawesome.io/) icon nodes.
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
| **dataUrl** | *string* | URL of the endpoint that serves the graph in JSON format. |
| **icons** | *object* | Map node labels to [Font Awesome icons](http://fontawesome.io/icons).<br>Example:<br>`{`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'Address': 'home',`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'BirthDate': 'calendar-o',`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'EncryptedPassword': 'asterisk',`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'NameSignature': 'pencil',`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'Phone': 'phone',`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'Player': 'user',`<br>&nbsp;&nbsp;&nbsp;&nbsp;`'SecurityChallengeAnswer': 'comment'`<br>`}`. |
| **infoPanel** | *boolean* | Show the information panel: `true`, `false`. Default: `true`. |
| **minCollision** | *int* | Minimum distance between nodes. Default: 2 * *nodeRadius*. |
| **nodeRadius** | *int* | Radius of nodes. Default: 25. |
| **onNodeDoubleClick** | *function* | Callback function to be executed when the user double clicks a node. |
| **onRelationshipDoubleClick** | *function* | Callback function to be executed when the user double clicks a relationship. |
| **zoomFit** | *boolean* | Adjust the graph to the container once it has been loaded: `true`, `false`. Default: `false`. |

### Example

Live example @ [https://eisman.github.io/neo4jd3/](https://eisman.github.io/neo4jd3/)

```javascript
var neo4jd3 = new Neo4jd3('#neo4jd3', {
    dataUrl: 'json/data.json',
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
    nodeRadius: 25,
    onNodeDoubleClick: function(node) {
        console.log('double click on node: ' + JSON.stringify(node));
    },
    onRelationshipDoubleClick: function(relationship) {
        console.log('double click on relationship: ' + JSON.stringify(relationship));
    },
    zoomFit: true
});
```

## What's next?

* More than one relationship between two nodes.
* JavaScript API.

## Copyright and license

Code and documentation copyright 2016 the author. Code released under the [MIT license](LICENSE). Docs released under [Creative Commons](docs/LICENSE).
