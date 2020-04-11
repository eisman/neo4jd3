import {contains} from "./utils";

export function neo4jDataToD3Data(data) {
    const graph = {
        nodes: [],
        relationships: []
    };

    data.results.forEach(result => {
        result.data.forEach(data => {
            data.graph.nodes.forEach(node => {
                if (!contains(graph.nodes, node.id)) {
                    graph.nodes.push(node);
                }
            });

            data.graph.relationships.forEach(relationship => {
                relationship.source = relationship.startNode;
                relationship.target = relationship.endNode;
                graph.relationships.push(relationship);
            });

            data.graph.relationships.sort((a, b) => {
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
                const isLinkNum = i !== 0 &&
                    data.graph.relationships[i].source === data.graph.relationships[i - 1].source &&
                    data.graph.relationships[i].target === data.graph.relationships[i - 1].target;

                if (isLinkNum) {
                    data.graph.relationships[i].linknum = data.graph.relationships[i - 1].linknum + 1;
                } else {
                    data.graph.relationships[i].linknum = 1;
                }
            }
        });
    });

    return graph;
}