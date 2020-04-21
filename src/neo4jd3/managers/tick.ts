import NetworkState from "../state";
import * as math from "../../math";
import * as d3 from "d3";

export default class TickerManager {
    private readonly state: NetworkState;

    constructor(state: NetworkState) {
        this.state = state;
    }

    tick() {
        this.tickNodes();
        this.tickRelationships();
    }

    private tickNodes() {
        if (this.state.node) {
            this.state.node.attr('transform', d => `translate(${d.x}, ${d.y})`);
        }
    }

    private tickRelationships() {
        if (this.state.relationship) {
            this.state.relationship.attr('transform', d => {
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

        this.state.relationship.each(function () {
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
                        x: (network.state.options.nodeRadius + 1) * u.x - n.x,
                        y: (network.state.options.nodeRadius + 1) * u.y - n.y
                    }, angle),
                    rotatedPointB1 = math.rotatePoint(center, {x: textMargin.x - n.x, y: textMargin.y - n.y}, angle),
                    rotatedPointC1 = math.rotatePoint(center, {x: textMargin.x, y: textMargin.y}, angle),
                    rotatedPointD1 = math.rotatePoint(center, {
                        x: (network.state.options.nodeRadius + 1) * u.x,
                        y: (network.state.options.nodeRadius + 1) * u.y
                    }, angle),
                    rotatedPointA2 = math.rotatePoint(center, {
                        x: d.target.x - d.source.x - textMargin.x - n.x,
                        y: d.target.y - d.source.y - textMargin.y - n.y
                    }, angle),
                    rotatedPointB2 = math.rotatePoint(center, {
                        x: d.target.x - d.source.x - (network.state.options.nodeRadius + 1) * u.x - n.x - u.x * network.state.options.arrowSize,
                        y: d.target.y - d.source.y - (network.state.options.nodeRadius + 1) * u.y - n.y - u.y * network.state.options.arrowSize
                    }, angle),
                    rotatedPointC2 = math.rotatePoint(center, {
                        x: d.target.x - d.source.x - (network.state.options.nodeRadius + 1) * u.x - n.x + (n.x - u.x) * network.state.options.arrowSize,
                        y: d.target.y - d.source.y - (network.state.options.nodeRadius + 1) * u.y - n.y + (n.y - u.y) * network.state.options.arrowSize
                    }, angle),
                    rotatedPointD2 = math.rotatePoint(center, {
                        x: d.target.x - d.source.x - (network.state.options.nodeRadius + 1) * u.x,
                        y: d.target.y - d.source.y - (network.state.options.nodeRadius + 1) * u.y
                    }, angle),
                    rotatedPointE2 = math.rotatePoint(center, {
                        x: d.target.x - d.source.x - (network.state.options.nodeRadius + 1) * u.x + (-n.x - u.x) * network.state.options.arrowSize,
                        y: d.target.y - d.source.y - (network.state.options.nodeRadius + 1) * u.y + (-n.y - u.y) * network.state.options.arrowSize
                    }, angle),
                    rotatedPointF2 = math.rotatePoint(center, {
                        x: d.target.x - d.source.x - (network.state.options.nodeRadius + 1) * u.x - u.x * network.state.options.arrowSize,
                        y: d.target.y - d.source.y - (network.state.options.nodeRadius + 1) * u.y - u.y * network.state.options.arrowSize
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
        this.state.relationshipOverlay.attr('d', d => {
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
        this.state.relationshipText.attr('transform', d => {
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
}