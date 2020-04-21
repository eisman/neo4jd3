import NetworkState from "../state";
import InfoManager from "./info";
import StatefulHelper from "./statefulHelper";

export default class RelationshipsManager {
    private readonly state: NetworkState;
    private readonly helper: StatefulHelper;
    private readonly infoManager: InfoManager;

    constructor(state: NetworkState, helper: StatefulHelper, infoManager: InfoManager) {
        this.state = state;
        this.helper = helper;
        this.infoManager = infoManager;
    }

    updateRelationships(r) {
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
                    this.infoManager.updateInfo(d);
                }
            })
    }

    private appendRelationshipToGraph() {
        const relationship = this.appendRelationship();
        const text = RelationshipsManager.appendTextToRelationship(relationship);
        const outline = RelationshipsManager.appendOutlineToRelationship(relationship);
        const overlay = RelationshipsManager.appendOverlayToRelationship(relationship);

        return {
            outline: outline,
            overlay: overlay,
            relationship: relationship,
            text: text
        };
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
}