import App from '../App'

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
      cardCounts.current = new Map();
      prizeCounts.current = new Map();
      starters.current = new Map(); 
      soloStartersFound.current = new Map();
      mulliganOccurences.current = 0;
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
            <div>
              Mulligans: {mulliganOccurences.current} / {simulations.current} ({mulliganOccurences.current / simulations.current * 100}%)
              <br />
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
            </div>      
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

export default Data;