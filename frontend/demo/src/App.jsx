import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Main from './components/Main';
import Main2 from './components/Main2';
import Main3 from './components/Main3';
import Main4 from './components/Main4';
import Nav from './components/Nav';
import Header from './components/Header';
import '../node_modules/@oliasoft-open-source/react-ui-library/dist/global.css';
import './App.scss';  // Make sure this import is correct based on where App.scss is located


function App() {
    return (
        <Router>
            <Header />
            <div className="container">
                <div className="sidebar">
                    <Nav />
                </div>
                <div className="content">
                    <Switch>
                        <Route exact path="/" component={Main2} />
                        <Route path="/main2" component={Main2} />
                        <Route path="/main3" component={Main3} />
                        <Route path="/main4" component={Main4} />

                        {/* Add other routes as needed */}
                    </Switch>
                </div>
            </div>
        </Router>
    );
}

export default App;
