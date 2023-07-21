function Config( 
    {
    startingHandSize,
    onChangeStartingHandSize,
    deckPenetration,
    onChangeDeckPenetration,
    prizeCount,
    onChangePrizeCount,
    simulations,
    onChangeSimulations
    })
 {
    return (
      <div>
        <h2>Parameters:</h2>
        <br />
        Starting hand size:
        <input
          name="Starting hand size"
          type="number"
          style={{marginLeft: 12, marginRight: 12}}
          defaultValue={startingHandSize}
          id={`config_handSize`}
          onInput={(e) => {
            if (e.target.value > 0) {
              onChangeStartingHandSize(parseInt(e.target.value));
            }
            else {
              e.target.value = startingHandSize;
            }
          }}
        />
        +
        <input
          name="Deck penetration"
          type="number"
          style={{marginLeft: 12}}
          defaultValue={deckPenetration}
          id={`config_deckPenetration`}
          onInput={(e) => {
            if (e.target.value > -1) {
              onChangeDeckPenetration(parseInt(e.target.value));
            }
            else {
              e.target.value = deckPenetration;
            }
          }}
        />
        <br />
        Prizes:
        <input
          name="Prizes"
          type="number"
          style={{marginLeft: 12}}
          defaultValue={prizeCount}
          id={`config_prizes`}
          onInput={(e) => {
            if (e.target.value > 0) {
              onChangePrizeCount(parseInt(e.target.value));
            }
            else {
              e.target.value = prizeCount;
            }
          }}
        />
        <br />
        Simulation runs (more runs = better data):
        <input
          name="Simulations"
          type="number"
          style={{marginLeft: 12}}
          defaultValue={simulations}
          id={`config_simulations`}
          onInput={(e) => {
            if (e.target.value > 0) {
              onChangeSimulations(parseInt(e.target.value));
            }
            else {
              e.target.value = simulations;
            }
          }}
        />
      </div>
    )
  }

export default Config;