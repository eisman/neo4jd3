import NetworkState from "../state";
import StatefulHelper from "./statefulHelper";

export default class InfoManager {
    private readonly state: NetworkState;
    private readonly helper: StatefulHelper;

    constructor(state: NetworkState, helper: StatefulHelper) {
        this.state = state;
        this.helper = helper;
    }

    updateInfo(d) {
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

    static appendInfoPanel(container) {
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
                    : (isNode ? this.helper.classToColor(property) : this.helper.defaultColor());
            })
                .style('border-color', _ => {
                    return this.state.options.nodeOutlineFillColor
                        ? this.helper.classToDarkenColor(this.state.options.nodeOutlineFillColor)
                        : (isNode
                            ? this.helper.classToDarkenColor(property)
                            : this.helper.defaultDarkenColor());
                })
                .style('color', _ => {
                    return this.state.options.nodeOutlineFillColor
                        ? this.helper.classToDarkenColor(this.state.options.nodeOutlineFillColor)
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

    clearInfo() {
        this.state.info.html('');
    }
}