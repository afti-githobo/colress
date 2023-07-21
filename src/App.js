import './App.css';
import colress from './colress.png'
import Config from './components/Config'
import Decklist from '.components/Decklist'
import Data from '.components/Data'
import Simulation from './Simulation'

import { useRef, useState, useCallback } from "react";

class App extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      deckElems: [],
      deckText: '',
      startingHandSize: 7,
      prizeCount : 6,
      deckPenetration : 1,
      simulationCount : 25000,
      simulations : []
    };
  }

  render() {
    return (
      <div className="App">
        <h1>Colress's Experiment v0.1.2α</h1>
        <img src={colress} alt="Colress's Experiment" />
        <br />
        <a href="https://github.com/afti-githobo/colress">Github</a>
        <br />
        <a href="https://ko-fi.com/iafishman">Tip me on Ko-fi if this software is useful and you want me to keep adding features</a>
        <Config 
          startingHandSize={this.state.startingHandSize} 
          onChangeStartingHandSize={(value) => {this.setState({startingHandSize : value})}}
          prizeCount={this.state.prizeCount}
          onChangePrizeCount={(value) => {this.setState({prizeCount : value})}}
          deckPenetration={this.state.deckPenetration}
          onChangeDeckPenetration={(value) => {this.setState({deckPenetration : value})}}
          simulationCount={this.state.prizeCount}
          onChangeSimulations={(value) => {this.setState({simulationCount : value})}}
        />
        <Decklist />
        <Data />
      </div>
    );
  }
}

export default App;
