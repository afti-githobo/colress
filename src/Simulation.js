class Simulation{
    constructor(deckElems = [], simulations = 0, cardCounts = new Map(), prizeCounts = new Map(), starters = new Map(), soloStartersFound = new Map(), mulliganOccurences = 0) {
        this.deckElems = deckElems;
        // how many times did we run this simulation?
        this.simulations = simulations;
        // unique cards : how many times was this seen within starting hand + deck penetration?
        this.cardCounts = cardCounts;
        // unique cards : how many times was this prized?
        this.prizeCounts = prizeCounts;
        // valid starters : how many times was each of these starters seen?
        this.starters = starters;
        // valid starters : how many times was this the only available starter?
        this.soloStartersFound = soloStartersFound;
        // how many times did the simulation get a hand without a starter?
        this.mulliganOccurences = mulliganOccurences;
    }
}