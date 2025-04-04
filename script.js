const letterBag = {
  A: 9, B: 2, C: 2, D: 4, E: 12, F: 2, G: 3, H: 2,
  I: 9, J: 1, K: 1, L: 4, M: 2, N: 6, O: 8, P: 2,
  Q: 1, R: 6, S: 4, T: 6, U: 4, V: 2, W: 2, X: 1,
  Y: 2, Z: 1
};

let deck = [];
let hand = [];
let score = 0;

function shuffleDeck() {
  for (let letter in letterBag) {
    for (let i = 0; i < letterBag[letter]; i++) {
      deck.push(letter);
    }
  }
  deck = deck.sort(() => Math.random() - 0.5);
}

function drawTiles(n = 7) {
  while (hand.length < n && deck.length > 0) {
    hand.push(deck.pop());
  }
  renderHand();
}

function renderHand() {
  const handDiv = document.getElementById('hand');
  handDiv.innerHTML = '';
  hand.forEach((letter, index) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.textContent = letter;
    tile.dataset.index = index;
    tile.onclick = () => tile.classList.toggle('selected');
    handDiv.appendChild(tile);
  });
}

function submitWord() {
  const input = document.getElementById('wordInput').value.toUpperCase();
  if (isValidWord(input)) {
    // TODO: check if word is possible with current hand
    // For now, assume valid and score it
    score += input.length * 5; // placeholder scoring
    document.getElementById('score').textContent = `Score: ${score}`;
    removeUsedLetters(input);
    drawTiles();
  } else {
    document.getElementById('message').textContent = "Invalid word!";
  }
}

function removeUsedLetters(word) {
  for (let char of word) {
    const index = hand.indexOf(char);
    if (index !== -1) hand.splice(index, 1);
  }
}

function isValidWord(word) {
  // Add dictionary check here or use API
  return word.length >= 2;
}

document.getElementById('submitWord').onclick = submitWord;
document.getElementById('drawTiles').onclick = () => drawTiles();
