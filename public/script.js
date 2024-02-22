const swedishInput = document.getElementById("word-swedish");
const czechInput = document.getElementById("word-czech");
const catInput = document.getElementById("word-category");
const viewCat = document.getElementById("view-cat");
const viewCatHeader = document.getElementById("view-cat-header");
const modalWindow = document.getElementById("modal-window");
const selectCat = document.getElementById("select-cat");
const totalScore = [ 0, 0 ];
let cards = [ ];
let isTestingActive = false;

const resetScore = () => totalScore.fill(0);

catInput.addEventListener("keyup", async (e) => {
    if (e.key === "Enter") {
        await addToVoc(swedishInput, czechInput, catInput);
    }
})

modalWindow.addEventListener("keyup", (e) => {
    if (e.key === "Escape") {
        resetScore();
        modalWindow.innerHTML = "";
    }
})

const CopyToClipboard = async (char) => await navigator.clipboard.writeText(char);

const clearInputs = () => [swedishInput, czechInput, catInput].forEach(input => input.value = "");

const focusWindow = (el) => {
    el.tabIndex = 0;
    el.focus();
}

const viewCats = async () => {
    const res = await fetch(`/api/v1/viewCats?category=${document.querySelector("#view-cats").value}`);
    let catDic = await res.json();

    modalWindow.innerHTML = `
        <div class="modal category">
            <div>
                <span class="close" onclick="modalWindow.innerHTML = ''"><a>&lt;</a>x<a>&gt;</a>
            </div>
            <div id="category-table">
                <table>
                    <tr>
                        <th>swedish</th><th>czech</th>
                    </tr>
                    ${catDic.map((catDic) => `<tr><td>${catDic.swedish}</td><td>${catDic.czech}
                        </td></tr>`).join('')}
                </table>
            </div>
        </div>`

    focusWindow(modalWindow);
}

const loadCats = async () => {
    const res = await fetch(`/api/v1/loadCats`);
    let categories = await res.json();
    categories = categories.map((e) => e.category);

    viewCat.addEventListener("submit", function(e) {
        e.preventDefault();
    })

    if (categories.length > 0) {
        viewCatHeader.innerHTML = `
            <h2><a>&lt;</a>view categories<a>&gt;</a></h2>
            <hr>`;
        viewCat.innerHTML = `
            <label for='view-cats' style='margin: auto'>Select the
                <a>&lt;</a>category<a>&gt;</a> you'd like to practice</label>
            <select name="view-cats" id="view-cats">
                <option value="">all</option>
                ${categories.map((cat) => `<option value="${cat}">${cat}</option>`).join('')}
            </select>
            <button type='submit' onclick='viewCats()'>View set</button>`;
    }
}

const loadSuggestions = async () => {
    const res = await fetch(`/api/v1/loadCats`);
    let categories = await res.json();
    categories = categories.map((e) => e.category);

    document.getElementById("suggestions").innerHTML = `
    ${categories.map((cat) => `<option value="${cat}"></option>`).join('')}`;
}

const updateCats = async () => {
    await loadSuggestions();
    await loadCats();
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
    await updateCats();
}

window.onload = updateCats;

const delFromVoc = async (swedishInput, czechInput, category) => {
    if (swedishInput.value === "" && czechInput.value === "" &&
        category.value === "") {
        alert("Invalid input\n");
        clearInputs();
        return;
    }

    const value = swedishInput.value || czechInput.value || category.value;
    const type = swedishInput.value ? "swedish" : czechInput.value ? "czech" : "category";

    await fetch("/api/v1/delFromVocab", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            type: type,
            value: value
        })
    });

    clearInputs();
    await updateCats();
}

const loadCardWindows = (taskType, deckSize) => {
    const swedishDiv = document.querySelector( "#swedish-div")
    const czechDiv = document.querySelector("#czech-div");
    const footerEl = document.querySelector("#modal-footer");

    if (deckSize < 1) {
        alert("Category isn't big enough, insert more words to practice!");
        modalWindow.innerHTML = "";
        return;
    }

    switch(taskType) {
        case "practicing":
                swedishDiv.innerHTML = `<div class="card practice" id="card-swedish"></div>`
                czechDiv.innerHTML = `<div class="card practice" id="czech-practice"></div>`;
            break;
        case "testing":
            swedishDiv.innerHTML = `<div class="card swedish testing" id="card-swedish"></div>`
            czechDiv.innerHTML = `<div id="czech-testing-div">`

            swedishDiv.style.width = '80%';
            swedishDiv.style.paddingTop = '5px';
            czechDiv.style.width = '110%';
            const czechCardsInner = document.querySelector("#czech-testing-div");

            for (let i = 0; i < 4; i++) {
                czechCardsInner.innerHTML += `<div class="card czech testing" id="czech-testing${i + 1}"></div>`;
            }
            footerEl.innerHTML += `<p class="score">score:</p>`
            break;
        default:
            break;
    }
}

const renderModal = async (task) => {
    const category = document.getElementById("task-cat").value;

    const res = await fetch(`/api/v1/fetchVocab?category=${category}`);
    const vocabulary = await res.json();

    modalWindow.innerHTML = `
        <div class="modal content">
            <div>
            <span class="close" onclick="modalWindow.innerHTML = ''"><a>&lt;</a>x<a>&gt;</a>
            </div>
            <div class="cards">
                <div id="swedish-div"></div>
                <div id="czech-div"></div>
            </div>
            <div id="modal-footer">
                <button id="next-btn">Start</button>
            </div>
        </div>`;

    focusWindow(modalWindow);
    loadCardWindows(task, vocabulary.length);
    document.querySelector("#next-btn").onclick = () => {
        loadCards(vocabulary, task);
    }
    modalWindow.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            loadCards(vocabulary, task);
        }
    })
}

const loadMode = async (mode) => {
    resetScore();

    const res = await fetch(`/api/v1/loadCats`);
    let categories = await res.json();
    categories = categories.map((e) => e.category);

    selectCat.addEventListener("submit", function(e) {
        e.preventDefault();
    })

    selectCat.innerHTML = `
        <label for='task-cat' style='margin: auto'>Select the
            <a>&lt;</a>category<a>&gt;</a> you'd like to practice</label>
        <select name="select-cats" id="task-cat">
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
    isTestingActive = false;

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
    if (isTestingActive) {
        highlightCards(correctWord, cards, NaN);
    }

    vocabulary = arrangeVocab(vocabulary, correctWord);
    isTestingActive = true;
    cards = [];

    for (let i = 0; i < 4; i++) {
        cards.push(fillCard(vocabulary, `#czech-testing${i + 1}`, i));
        cards[i].addEventListener("click", () => {
            highlightCards(correctWord, cards, i);
        })
    }
}

// load from DB
const loadCards = async (vocabulary, task) => {
    const swedishEl = document.querySelector("#card-swedish");

    document.getElementById("next-btn").innerText = "Next";
    let index = Math.floor(Math.random() * vocabulary.length);
    swedishEl.innerText = `${vocabulary[index].swedish}`;
    const czechWord = vocabulary[index].czech;

    if (task === "testing") {
        evaluateRound(vocabulary.map(e => e.czech), czechWord);
    } else {
        document.querySelector("#czech-practice").innerText = `${vocabulary[index].czech}`;
    }
}