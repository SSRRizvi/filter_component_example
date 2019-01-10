import React, { Component } from 'react';
import HtmlToReact, { Parser } from 'html-to-react';
import axios from 'axios';
import _ from 'lodash';

import SimpleComponent from './simple-component';

const filterStore = {
    foo: true,
    receiverModel: 'Hopper 3'
}

// evaluate filter key value pairs against the store
function evaluateFilterAgainstStore(filter) {
    return _.isMatch(filterStore, filter);
}

// return true if the the node implements data-filter-if and needs to be evaluated against 
// the filter store.
function isFilterNode(node) {
    return node && node.attribs && _.has(node.attribs, 'data-filter-if');
}

// return true if the node parent implements the data-filter-value and needs to have its innerHTML
// replaced a value from the filter store.
function isFilterValueNode(node) {
    return node && node.attribs && _.has(node.attribs, 'data-filter-value');
}

// return true if the node implements data-replace-with and needs to have its innerHTML replaced with
// a react component.
function isReplaceWithNode(node) {
    return node && node.attribs && _.has(node.attribs, 'data-replace-with');
}

// all nodes are valid for processing.
function isValidNode() {
    return true;
}

function applyCreateElementWithChildren(node, children, index) {
    return React.createElement
        .apply(null, 
               [node.name, _.extend(node.attribs, {key: index})]
               .concat(children)
              );
}

const processNodeDefinitions = new HtmlToReact.ProcessNodeDefinitions(React);

const processingInstructions = [{
        shouldProcessNode: function(node) {
            return isFilterNode(node);
        },
        processNode: function(node, children, index) {
            if (evaluateFilterAgainstStore(JSON.parse(node.attribs['data-filter-if']))) {
                return applyCreateElementWithChildren(node, children, index);
            } else {
                return false;
            }
        }
    }, {        
        shouldProcessNode: function(node) {
            return isFilterValueNode(node);
        },
        processNode: function(node, children) {
            if (_.has(filterStore, node.attribs['data-filter-value'])) {
                return filterStore[node.attribs['data-filter-value']];
            } else {
                return '';
            }
        }
    }, {
        shouldProcessNode: function(node) {
            return isReplaceWithNode(node);            
        },
        processNode: function(node, children, index) {            
            return React.createElement(SimpleComponent, { filter: filterStore });
        }
    }, {
        shouldProcessNode: function(node) {
            return true;
        },
        processNode: processNodeDefinitions.processDefaultNode
    }];

class StepContent extends Component {        
    constructor(props) {
        super(props);
        
        this.state = { content: '<div></div>' };
    }
    
    componentDidMount() {
        var self = this;
        
        axios.get('../fake-api/steps/1/content')
            .then(function (response) {
               self.setState({ content: response.data });
        });
    }
    
    render() {
        const parser = new Parser();
        return parser.parseWithInstructions(this.state.content, isValidNode, processingInstructions);
    }
}

export default StepContent;