class Card {
    constructor(name, img) {
        this.name = name;
        this.img = img;
        this.isFlipped = false;
        this.element = this.#createCardElement();
    }

    #createCardElement() {
        const cardElement = document.createElement("div");
        cardElement.classList.add("cell");
        cardElement.innerHTML = `
          <div class="card" data-name="${this.name}">
              <div class="card-inner">
                  <div class="card-front"></div>
                  <div class="card-back">
                      <img src="${this.img}" alt="${this.name}">
                  </div>
              </div>
          </div>
      `;
        return cardElement;
    }

    #flip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.add("flipped");
    }

    #unflip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.remove("flipped");
    }

    toggleFlip() {
        if (this.isFlipped) this.#unflip()
        else this.#flip()
        this.isFlipped = !this.isFlipped
    }

    matches(otherCard) { return this.name == otherCard.name }
}

class Board {
    constructor(cards) {
        this.cards = cards;
        this.fixedGridElement = document.querySelector(".fixed-grid");
        this.gameBoardElement = document.getElementById("game-board");
    }

    #calculateColumns() {
        const numCards = this.cards.length;
        let columns = Math.floor(numCards / 2);

        columns = Math.max(2, Math.min(columns, 12));

        if (columns % 2 !== 0) {
            columns = columns === 11 ? 12 : columns - 1;
        }

        return columns;
    }

    #setGridColumns() {
        const columns = this.#calculateColumns();
        this.fixedGridElement.className = `fixed-grid has-${columns}-cols`;
    }

    render() {
        this.#setGridColumns();
        this.gameBoardElement.innerHTML = "";
        this.cards.forEach((card) => {
            card.element
                .querySelector(".card")
                .addEventListener("click", () => this.onCardClicked(card));
            this.gameBoardElement.appendChild(card.element);
        });
    }

    onCardClicked(card) {
        if (this.onCardClick) {
            this.onCardClick(card)
        }
    }

    shuffleCards() {
        this.cards = this.cards
            .map((a) => ({ sort: Math.random(), value: a }))
            .sort((a, b) => a.sort - b.sort)
            .map((a) => a.value)
    }

    flipDownAllCards() {
        this.cards.forEach(card => {
            if (card.isFlipped) {
                card.toggleFlip()
                card.isFlipped = false
            }
        })
    }

    reset() {
        this.flipDownAllCards()
        this.shuffleCards()
        this.render()
    }

    setOnCardClick(callback) {
        this.onCardClick = callback
    }
}

class MemoryGame {

    movementsCounter = document.getElementById("movements-counter")
    timerElement = document.getElementById("timer")
    pointsElement = document.getElementById("points")
    movementsPlayed = 0
    timer = 0
    playedTime = 0
    timeIsRunning = false

    constructor(board, flipDuration = 500) {
        this.board = board;
        this.flippedCards = [];
        this.matchedCards = [];
        if (flipDuration < 350 || isNaN(flipDuration) || flipDuration > 3000) {
            flipDuration = 350;
            alert(
                "La duración de la animación debe estar entre 350 y 3000 ms, se ha establecido a 350 ms"
            );
        }
        this.flipDuration = flipDuration;
        this.board.setOnCardClick(this.#handleCardClick.bind(this))
        this.board.reset();
        this.resetTimer()
    }

    #handleCardClick(card) {
        if (this.flippedCards.length < 2 && !card.isFlipped) {
            card.toggleFlip();
            this.flippedCards.push(card);

            if (this.flippedCards.length === 2) {
                this.movementsCounter.innerText = `Número de intentos: ${this.movementsPlayed + 1}`
                this.movementsPlayed++
                setTimeout(() => this.checkForMatch(), this.flipDuration);
            }
        }
    }

    checkForWin() {
        if (this.matchedCards.length == this.board.cards.length / 2) {
            this.stopTimer()
            this.timerElement.textContent = `Felicidades!!! Tardaste ${this.playedTime} seg.`
            this.pointsElement.textContent = `Tus Puntos son: ${Math.round(this.playedTime / this.movementsPlayed * 100)}`
        }
    }

    checkForMatch() {
        if (this.flippedCards[0].matches(this.flippedCards[1])) { this.matchedCards.push(this.flippedCards) }
        else {
            this.flippedCards.forEach(card => card.toggleFlip())
        }
        this.flippedCards = []
        this.checkForWin()
    }

    sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

    stopTimer() { this.timeIsRunning = false }

    async startTimer() {
        this.timer = Date.now()
        this.timeIsRunning = true
        while (this.timeIsRunning) {
            this.playedTime = Math.floor((Date.now() - this.timer) / 1000)
            this.updateTimer()
            await this.sleep(1000)
        }
    }

    updateTimer() {
        if (this.timerElement) this.timerElement.textContent = `Tiempo transcurrido: ${this.playedTime} seg.`
    }

    resetTimer() {
        this.stopTimer()
        this.playedTime = 0
        this.updateTimer()
        this.startTimer()
    }

    resetMovements() {
        this.movementsPlayed = 0
        this.movementsCounter.innerText = 'Número de intentos: 0'
    }

    resetGame() {
        this.flippedCards = []
        this.matchedCards = []
        this.pointsElement.textContent = ''
        this.resetMovements()
        this.board.reset()
        this.resetTimer()
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const cardsData = [
        { name: "Python", img: "./img/Python.svg" },
        { name: "JavaScript", img: "./img/JS.svg" },
        { name: "Java", img: "./img/Java.svg" },
        { name: "CSharp", img: "./img/CSharp.svg" },
        { name: "Go", img: "./img/Go.svg" },
        { name: "Ruby", img: "./img/Ruby.svg" },
    ];

    const cards = cardsData.flatMap((data) => [
        new Card(data.name, data.img),
        new Card(data.name, data.img),
    ]);
    const board = new Board(cards);
    const memoryGame = new MemoryGame(board, 1000);

    document.getElementById("restart-button").addEventListener("click", () => {
        memoryGame.resetGame();
    });
});
