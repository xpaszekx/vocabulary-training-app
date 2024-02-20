const swedishInput = document.getElementById("word-swedish");
const czechInput = document.getElementById("word-czech");
const catInput = document.getElementById("word-category");
const knownCats = document.getElementById("known-cats");
const modalWindow = document.getElementById("modal-window");
const selectCat = document.getElementById("select-cat");
const totalScore = [ 0, 0 ];

const CopyToClipboard = async (char) => await navigator.clipboard.writeText(char);

const clearInputs = () => {
    swedishInput.value = "";
    czechInput.value = "";
    catInput.value = "";
}

const loadCats = async () => {
    const res = await fetch(`/api/v1/loadCats`);
    const categories = await res.json();

    if (categories.length > 0) {
        knownCats.innerHTML = `
        <h2><a>&lt;</a>listed categories<a>&gt;</a></h2>
        <hr>
        <p class="listed-cats">${categories.map(e => e.category)}</p>`;
    }
}

// save to DB
const addToVoc = async (swedishInput, czechInput, category) => {
    if (swedishInput.value === "" || czechInput.value === "" ||
        category.value === "") {
        alert("Invalid input\n");
        clearInputs();
        return;
    }

    await fetch("/api/v1/saveNewVocab", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            swedish: swedishInput.value,
            czech: czechInput.value,
            category: category.value
        })
    });

    clearInputs();
    await loadCats();
}

window.onload = loadCats;

const loadCardWindows = (taskType, deckSize) => {
    const cardsEl = document.querySelector("#czech-div");
    const footerEl = document.querySelector("#modal-footer");

    if (deckSize < 2) {
        alert("Category isn't big enough, insert more words to practice!");
        modalWindow.innerHTML = "";
        return;
    }

    switch(taskType) {
        case "practicing":
                cardsEl.innerHTML = `<div class="card czech" id="czech-word"></div>`;
            break;
        case "testing":
            for (let i = 0; i < 4; i++) {
                cardsEl.innerHTML += `<div class="card czech" id="czech-word${i + 1}"></div>`;
            }
            footerEl.innerHTML += `<p class="score">score:</p>`
            break;
        default:
            break;
    }
}

const renderModal = async (taskType) => {
    const category = document.getElementById("task-cat").value;

    const res = await fetch(`/api/v1/fetchVocab?category=${category}`);
    const vocabulary = await res.json();

    modalWindow.innerHTML = `
        <div class="modal">
            <div>
                <span class="close" onclick="modalWindow.innerHTML = ''"><a>&lt;</a>x<a>&gt;</a></div>
                <div class="cards">
                    <div class="card swedish" id="swedish-div"></div>
                    <div id="czech-div"></div>
                </div>
                <div id="modal-footer">
                    <button id="next-btn">Start</button>
                </div>
            </div>
        </div>`;

    loadCardWindows(taskType, vocabulary.length);
    document.querySelector("#next-btn").onclick = () => {
        loadCards(vocabulary, taskType);
    }
}

const loadMode = async (mode) => {
    totalScore[0] = 0;
    totalScore[1] = 0;

    const res = await fetch(`/api/v1/loadCats`);
    let categories = await res.json();
    categories = categories.map((e) => e.category);

    selectCat.addEventListener("submit", function(e) {
        e.preventDefault();
    })

    selectCat.innerHTML = `
        <label for='task-cat' style='margin: auto'>Select the
            <a>&lt;</a>category<a>&gt;</a> you'd like to practice</label>
        <select name="wordset" id="task-cat">
            <option value="">mix</option>
            ${categories.map((cat) => `<option value="${cat}">${cat}</option>`).join('')}
        </select>
        <button type='submit' onclick='renderModal("${mode}")'>Start ${mode}</button>`;
}

const fillCard = (vocabulary, cardId, index) => {
    const el = document.querySelector(`${cardId}`);
    el.style.setProperty('background-color', 'lightslategrey');
    el.innerText = vocabulary[index];
    return el;
}

function highlightCards(correctWord, cards, choice) {
    totalScore[1]++;

    for (let i = 0; i < 4; i++) {
        if (cards[i].innerText === correctWord && i === choice) {
            cards[i].style.setProperty('background-color', 'forestgreen');
            totalScore[0] += 1;
            continue;
        }
        if (cards[i].innerText === correctWord && i !== choice) {
            cards[i].style.setProperty('background-color', 'blue');
            continue;
        }
        cards[i].style.setProperty('background-color', 'darkred');
    }

    let czechCardDiv = document.getElementById("czech-div");
    let elClone = czechCardDiv.cloneNode(true);
    czechCardDiv.parentNode.replaceChild(elClone, czechCardDiv);

    document.querySelector(".score").innerText = `score: ${totalScore[0]}/${totalScore[1]} ${ Math.round(totalScore[0] * 100.0 / totalScore[1]) }%`;
}

const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

const arrangeVocab = (vocabulary, correctWord) => {
    const correctIndex = vocabulary.indexOf(correctWord);
    vocabulary.splice(correctIndex, 1);
    vocabulary.unshift(correctWord);

    return shuffleArray(vocabulary.slice(0, 4));
};

const evaluateRound = (vocabulary, correctWord) => {
    // TODO: implement delete button for DB, maybe modal window to view vocab set list

    vocabulary = arrangeVocab(vocabulary, correctWord);
    const cards = [ ];

    for (let i = 0; i < 4; i++) {
        cards.push(fillCard(vocabulary, `#czech-word${i + 1}`, i));
        cards[i].addEventListener("click", () => {
            highlightCards(correctWord, cards, i);
        })
    }
}

// load from DB
const loadCards = (vocabulary, task) => {
    const swedishEl = document.querySelector("#swedish-div");

    document.getElementById("next-btn").innerText = "Next";
    let index = Math.floor(Math.random() * vocabulary.length);
    swedishEl.innerText = `${vocabulary[index].swedish}`;
    const czechWord = vocabulary[index].czech;

    if (task === "testing") {
        evaluateRound(vocabulary.map(e => e.czech), czechWord);
    } else {
        const czechEl = document.querySelector(".card.czech");
        czechEl.style.setProperty('font-size','2rem');
        czechEl.innerText = `${vocabulary[index].czech}`;
    }
}