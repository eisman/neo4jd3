import * as d3 from "d3";
import NetworkState from "../state";

export default class StatefulHelper {
    private readonly state: NetworkState;

    constructor(state: NetworkState) {
        this.state = state;
    }

    dragEnded(d) {
        if (!d3.event.active) {
            this.state.simulation.alphaTarget(0);
        }

        if (typeof this.state.options.onNodeDragEnd === 'function') {
            this.state.options.onNodeDragEnd(d);
        }
    }

    static dragged(d) {
        StatefulHelper.stickNode(d);
    }

    dragStarted(d) {
        if (!d3.event.active) {
            this.state.simulation.alphaTarget(0.3).restart();
        }

        d.fx = d.x;
        d.fy = d.y;

        if (typeof this.state.options.onNodeDragStart === 'function') {
            this.state.options.onNodeDragStart(d);
        }
    }

    icon(d) {
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

    image(d) {
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

    private static stickNode(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
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

    classToColor(cls) {
        let color = this.state.classes2colors[cls];

        if (!color) {
            color = this.state.options.colors[this.state.numClasses % this.state.options.colors.length];
            this.state.classes2colors[cls] = color;
            this.state.numClasses++;
        }

        return color;
    }

    classToDarkenColor(cls) {
        return d3.rgb(this.classToColor(cls)).darker(1);
    }

    defaultColor() {
        return this.state.options.relationshipColor;
    }

    defaultDarkenColor() {
        return d3.rgb(this.state.options.colors[this.state.options.colors.length - 1]).darker(1);
    }

    randomLabel() {
        const icons = Object.keys(this.state.options.iconMap);
        return icons[icons.length * Math.random() << 0];
    }
}