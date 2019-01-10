import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import StepContent from './components/step-content-component';

class App extends Component {
    render() {      
        return (
            <div>
                <StepContent />
            </div>
        );
    }
}

ReactDOM.render(<App />, document.querySelector('.container'));