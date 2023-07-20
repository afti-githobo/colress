import './App.css';
import colress from './colress.png'

import { useRef, useState, useCallback } from "react";

function App() {
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);
  const deckElems = useRef([]);
  const deckText = useRef('');
  const startingHandSize = useRef(7);
  const prizeCount = useRef(6);
  const deckPenetration = useRef(1);
  const simulations = useRef(25000);
  // stub for future feature - should be able to track odds of seeing arbitrary combindations of 2+ cards (or defined either/ors?) t1
  // const combos = useRef([]);
  // stub for future feature - should be able to track odds of seeing at least one of an arbitrary number of (different) cards t1
  // const eitherOrs = useRef([]);

  // These are used once we hit the experiment button, and should not be modified unless the button is pressed

  const hasData = useRef(false);
  // unique cards : how many times was this seen within starting hand + deck penetration?
  const cardCounts = useRef(new Map());
  // unique cards : how many times was this prized?
  const prizeCounts = useRef(new Map());
  // valid starters : how many times was each of these starters seen?
  const starters = useRef(new Map());
  // valid starters : how many times was this the only available starter?
  const soloStartersFound = useRef(new Map());
  // how many times did the simulation get a hand without a starter?
  const mulliganOccurences = useRef(0);


  function Card(name, quantity, isStarter) {
    this.name = name;
    this.quantity = quantity;
    this.isStarter = isStarter;
  }

  function Config() {
    return (
      <div>
        <h2>Parameters:</h2>
        <br />
        Starting hand size:
        <input
          name="Starting hand size"
          type="number"
          style={{marginLeft: 12, marginRight: 12}}
          defaultValue={startingHandSize.current}
          id={`config_handSize`}
          onInput={(e) => {
            if (e.target.value > 0) {
              startingHandSize.current = parseInt(e.target.value);
            }
            else {
              e.target.value = startingHandSize.current;
            }
            forceUpdate();
          }}
        />
        +
        <input
          name="Deck penetration"
          type="number"
          style={{marginLeft: 12}}
          defaultValue={deckPenetration.current}
          id={`config_deckPenetration`}
          onInput={(e) => {
            if (e.target.value > -1) {
              deckPenetration.current = parseInt(e.target.value);
            }
            else {
              e.target.value = deckPenetration.current;
            }
            forceUpdate();
          }}
        />
        <br />
        Prizes:
        <input
          name="Prizes"
          type="number"
          style={{marginLeft: 12}}
          defaultValue={prizeCount.current}
          id={`config_prizes`}
          onInput={(e) => {
            if (e.target.value > 0) {
              prizeCount.current = parseInt(e.target.value);
            }
            else {
              e.target.value = prizeCount.current;
            }
            forceUpdate();
          }}
        />
        <br />
        Simulation runs (more runs = better data):
        <input
          name="Simulations"
          type="number"
          style={{marginLeft: 12}}
          defaultValue={simulations.current}
          id={`config_simulations`}
          onInput={(e) => {
            if (e.target.value > 0) {
              simulations.current = parseInt(e.target.value);
            }
            else {
              e.target.value = simulations.current;
            }
            forceUpdate();
          }}
        />
      </div>
    )
  }
  
  function Decklist() {
    function naiveCopyDecklist() {
      if (deckText.current.length === 0) return;
      let lines = deckText.current.split(/\r?\n/);
      lines.forEach(line => {
        if (/([1-4])/.test(line[0]) && line[1] === ' ') {
          deckElems.current.push(new Card(line.substring(2), parseInt(line[0]), false));
        }
      });
      forceUpdate();
    }

    function addCard() {
      deckElems.current.push(new Card("", 1, false));
      forceUpdate();
    }
  
    function removeCard(index) {
      deckElems.current.splice(index, 1);
      forceUpdate();
    }

    function DecklistElement(index, cardName, quantity, isStarter) {
      return (
        <li key={`decklistElement${index}`}>
          <input
            name={`Card quantity #${index}`}
            title="Quantity of the card in the deck"
            style={{width: 24}}
            type="number"
            min="1"
            max="4"
            defaultValue={quantity}
            id={`listElem_cardQuantity_${index}`}
            onInput={(e) => {
              if (e.target.value < 5 && e.target.value > 0) {
                deckElems.current[index].quantity = parseInt(e.target.value);
              }
              else {
                e.target.value = deckElems.current[index].quantity;
              }
              forceUpdate();
            }}
          />
          <input
            name={`Card name #${index}`}
            title="Name of the card"
            type="text"
            defaultValue={cardName}
            id={`listElem_cardName_${index}`}
            onInput={(e) => {
              deckElems.current[index].name = e.target.value
            }}
          />
          <input
            name={`Is starter? #${index}`}
            title="Is this a Basic Pokémon?"
            type="checkbox"
            defaultChecked={isStarter}
            id={`isStarter_cardName_${index}`}
            onInput={(e) => {
              deckElems.current[index].isStarter = e.target.checked
              forceUpdate();
            }}
          />
          <button 
            title="Remove this card from the deck"
            onClick={() => {removeCard(index)}}
          >
            -
          </button>
        </li>
      );
    }

    let count = 0;
    deckElems.current.forEach(element => {
      count = count + element.quantity;
    });
    let i = 0;
    return (
      <div>
        <h2>Decklist:</h2>
        Total cards: {count}
        <br />
        <textarea 
          title = 'Copy/paste a PTCGL decklist here'
          defaultValue = {deckText.current}
          onChange = {(e) => {deckText.current = e.target.value}} 
        />
        <br />
        <button onClick={naiveCopyDecklist}>Import from PTCGL</button>
        <br />
        <ul>
          {deckElems.current.map((entry) => {
            let index = i;
            i++;
            return DecklistElement(
              index,
              entry.name,
              entry.quantity,
              entry.isStarter
            );
          })}
        </ul>
        <button onClick={addCard}>Add card</button>
      </div>

    );
  }

  function Data() {
    // array of all cards in the deck. shuffled before each simulation.
    let deck = [];

    function populateDeck() {
      deckElems.current.forEach(element => {
        if (element.isStarter) {
          starters.current.set(element.name, 0);
          soloStartersFound.current.set(element.name, 0);
        }
        for (let i = 0; i < element.quantity; i++) {
          deck.push(element.name);
        }
        cardCounts.current.set(element.name, [0, 0, 0, 0]);
        prizeCounts.current.set(element.name, [0, 0, 0, 0]);
      });
    }

    function shuffle() {
      for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * i);
        let cardA = deck[i];
        let cardB = deck[j];
        deck[i] = cardB;
        deck[j] = cardA;
      }
    }

    function experiment() {
      populateDeck();
      for (let i = 0; i < simulations.current; i++) {
        shuffle();

        let startersFoundThisHand = []
        let cardsFoundThisHand = new Map();
        let prizesFoundThisHand = new Map();

        for (let c = 0; c < startingHandSize.current; c++) {
          if (starters.current.has(deck[c])) {
            // only count starters once per opening hand - 1x Comfey and 3x Comfey are both Comfey starts and we don't want to skew the data
            if (!startersFoundThisHand.find(e => e === deck[c])) {
              startersFoundThisHand.push(deck[c]);
              // we can just push this directly to starters b/c by definition, we already know we're not mulliganning
              starters.current.set(deck[c], starters.current.get(deck[c]) + 1);
            }
          }
          if (!cardsFoundThisHand.has(deck[c])) {
            cardsFoundThisHand.set(deck[c], 1)
          }
          else cardsFoundThisHand.set(deck[c], cardsFoundThisHand.get(deck[c]) + 1);
        }
        if (startersFoundThisHand.length === 1) {
          soloStartersFound.current.set(startersFoundThisHand[0], soloStartersFound.current.get(startersFoundThisHand[0]) + 1);
        }
        else if (startersFoundThisHand.length === 0) {
          mulliganOccurences.current++;
          // only count cards/prizes for valid starting hands
          continue;
        } 
        else {
          // the order of prizes/deck penetration doesn't actually matter mathematically but let's be a Stickler
          for (let c = startingHandSize.current; c < startingHandSize.current + prizeCount.current; c++) {
            if (!prizesFoundThisHand.has(deck[c])) {
              prizesFoundThisHand.set(deck[c], 1)
            }
            else prizesFoundThisHand.set(deck[c], prizesFoundThisHand.get(deck[c]) + 1);
          }
          for (let c = startingHandSize.current + prizeCount.current; c < startingHandSize.current + prizeCount.current + deckPenetration.current; c++) {
            if (!cardsFoundThisHand.has(deck[c])) {
              cardsFoundThisHand.set(deck[c], 1)
            }
            else cardsFoundThisHand.set(deck[c], cardsFoundThisHand.get(deck[c]) + 1);
          }
        }
        cardsFoundThisHand.forEach((value, key) => {
          let v = value;
          let counts = cardCounts.current.get(key);
          if (v === 4) counts[3]++;
          if (v === 3) counts[2]++;
          if (v === 2) counts[1]++;
          counts[0]++;
          cardCounts.current.set(key, counts);
        });
        prizesFoundThisHand.forEach((value, key) => {
          let v = value;
          let counts = prizeCounts.current.get(key);
          if (v === 4) counts[3]++;
          if (v === 3) counts[2]++;
          if (v === 2) counts[1]++;
          counts[0]++;
          prizeCounts.current.set(key, counts);
        });
      }
      hasData.current = true;
      forceUpdate();
    }
    let sKeys = Array.from(starters.current.keys());
    let cKeys = Array.from(cardCounts.current.keys());
    let pKeys = Array.from(prizeCounts.current.keys());
    return (
      <div>
        <h2>Data:</h2>
        <button onClick={experiment}>Commence the experiment!</button>
        <h3>Starters:</h3> {
          hasData.current && (
            <table>
              <tbody>
                <tr>
                  <th>Card</th>
                  <th>Available</th>
                  <th>Only starter</th>
                </tr>
                {
                  sKeys.map((key) => { return(
                    <tr key={`starter_tr_${key}`}>
                      <td>{key}</td>
                      <td>{`${starters.current.get(key)} / ${simulations.current} (${starters.current.get(key) / simulations.current * 100}%}`}</td>
                      <td>{`${soloStartersFound.current.get(key)} / ${simulations.current} (${soloStartersFound.current.get(key) / simulations.current * 100}%)`}</td>
                    </tr>
                    )
                  })
                }
              </tbody>          
            </table>
          )
        }
        <h3>Turn 1:</h3> {
          hasData.current && (
            <table>
              <tbody>
                <tr>
                  <th>Card</th>
                  <th>1+</th>
                  <th>2+</th>
                  <th>3+</th>
                  <th>4</th>
                </tr>
                {
                  cKeys.map((key) => { return(
                    <tr key={`prize_tr_${key}`}>
                      <td>{key}</td>
                      <td>{`${cardCounts.current.get(key)[0]} / ${simulations.current} (${cardCounts.current.get(key)[0] / simulations.current * 100}%}`}</td>
                      <td>{`${cardCounts.current.get(key)[1]} / ${simulations.current} (${cardCounts.current.get(key)[1] / simulations.current * 100}%)`}</td>
                      <td>{`${cardCounts.current.get(key)[2]} / ${simulations.current} (${cardCounts.current.get(key)[2] / simulations.current * 100}%)`}</td>
                      <td>{`${cardCounts.current.get(key)[3]} / ${simulations.current} (${cardCounts.current.get(key)[3] / simulations.current * 100}%)`}</td>
                    </tr>
                    )
                  })
                }
              </tbody>          
            </table>
          )
        }
        <h3>Prizes:</h3> {
          hasData.current && (
            <table>
              <tbody>
                <tr>
                  <th>Card</th>
                  <th>1+</th>
                  <th>2+</th>
                  <th>3+</th>
                  <th>4</th>
                </tr>
                {
                  pKeys.map((key) => { return(
                    <tr key={`prize_tr_${key}`}>
                      <td>{key}</td>
                      <td>{`${prizeCounts.current.get(key)[0]} / ${simulations.current} (${prizeCounts.current.get(key)[0] / simulations.current * 100}%}`}</td>
                      <td>{`${prizeCounts.current.get(key)[1]} / ${simulations.current} (${prizeCounts.current.get(key)[1] / simulations.current * 100}%)`}</td>
                      <td>{`${prizeCounts.current.get(key)[2]} / ${simulations.current} (${prizeCounts.current.get(key)[2] / simulations.current * 100}%)`}</td>
                      <td>{`${prizeCounts.current.get(key)[3]} / ${simulations.current} (${prizeCounts.current.get(key)[3] / simulations.current * 100}%)`}</td>
                    </tr>
                    )
                  })
                }
              </tbody>          
            </table>
          )
        }
      </div>
    )
  }

  return (
  <div className="App">
    <h1>Colress's Experiment</h1>
    <img src={colress} alt="Colress's Experiment v0.1.0α" />
    <br />
    <a href="https://github.com/afti-githobo/colress">Github</a>
    <br />
    <a href="https://ko-fi.com/iafishman">Tip me on Ko-fi if this software is useful and you want me to keep adding features</a>
    <Config />
    <Decklist />
    <Data />
  </div>
  );
}

export default App;
