import App from '../App'
import Card from './Card'

function Decklist({
    deckElems,
    onChangeDeckElems
}) {
    function naiveCopyDecklist() {
      if (App.deckText.current.length === 0) return;
      let lines = deckText.current.split(/\r?\n/);
      lines.forEach(line => {
        if (/([1-4])/.test(line[0]) && line[1] === ' ') {
          deckElems.current.push(new Card(line.substring(2), parseInt(line[0]), false));
        }
      });
      App.forceUpdate();
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

export default Decklist;