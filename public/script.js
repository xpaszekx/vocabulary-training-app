const secondInput = document.getElementById("word-second");
const nativeInput = document.getElementById("word-native");
const catInput = document.getElementById("word-category");
const viewCat = document.getElementById("view-cat");
const viewCatHeader = document.getElementById("view-cat-header");
const modalWindow = document.getElementById("modal-window");
const selectCat = document.getElementById("select-cat");
const totalScore = [ 0, 0 ];
let langKeyValue;
let cards = [ ];
let isTestingActive = false;

catInput.addEventListener("keyup", async (e) => {
    if (e.key === "Enter") {
        await addToVoc(secondInput, nativeInput, catInput);
        focusWindow(secondInput);
    }
})

modalWindow.addEventListener("keyup", (e) => {
    if (e.key === "Escape") {
        resetScore();
    }
})

document.querySelector("#langkeys").addEventListener("keyup", async (e) => {
    if (e.key === "Enter") {
        await updateSections();
    }
})

const resetScore = () => {
    totalScore.fill(0);
    isTestingActive = false;
    modalWindow.innerHTML = "";
}

const CopyToClipboard = async (char) => {
    await navigator.clipboard.writeText(char);
    focusWindow(secondInput);
}

const clearInputs = () => [secondInput, nativeInput, catInput].forEach(input => input.value = "");

const focusWindow = (el) => {
    el.tabIndex = 0;
    el.focus();
}

const viewCats = async () => {
    const res = await fetch(`/api/v1/viewCats?category=${document.querySelector("#view-cats").value}&langKey=${langKeyValue}`);
    let catDic = await res.json();

    modalWindow.innerHTML = `
        <div class="modal category">
            <div>
                <span class="close" onclick="modalWindow.innerHTML = ''"><a>&lt;</a>x<a>&gt;</a>
            </div>
            <div id="category-table">
                <table>
                    <tr>
                        <th>${langKeyValue}</th><th>czech</th>
                    </tr>
                    ${catDic.map((catDic) => `<tr><td>${catDic.second}</td><td>${catDic.native}
                        </td></tr>`).join('')}
                </table>
            </div>
        </div>`

    focusWindow(modalWindow);
}

const loadCats = async () => {
    const res = await fetch(`/api/v1/loadCats?langKey=${langKeyValue}`);
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
                <a>&lt;</a>category<a>&gt;</a> you'd like to view</label>
            <select name="view-cats" id="view-cats">
                <option value="">all</option>
                ${categories.map((cat) => `<option value="${cat}">${cat}</option>`).join('')}
            </select>
            <button type='submit' onclick='viewCats()'>View</button>`;
    } else {
        viewCatHeader.innerHTML = "";
        viewCat.innerHTML = "";
    }
}

const loadSuggestions = async () => {
    const res = await fetch(`/api/v1/loadCats?langKey=${langKeyValue}`);
    let categories = await res.json();
    categories = categories.map((e) => e.category);

    document.getElementById("suggestions").innerHTML = `
    ${categories.map((cat) => `<option value="${cat}"></option>`).join('')}`;
}

const updateSections = async () => {
    langKeyValue = document.getElementById("langkey-input").value;

    await loadSuggestions();
    await loadCats();
    selectCat.innerHTML = "";

    document.querySelector("#foreign-label").innerHTML = `
    enter word in <a>&lt;</a>${langKeyValue}<a>&gt;</a>`;
}

const loadLangKeys = async () => {
    const res = await fetch(`/api/v1/loadLangKeys`);
    let langKeys = await res.json();

    document.querySelector("#langkeys").innerHTML = `
            <label for='langkey-input' style='margin: auto'>Select the
            <a>&lt;</a>language<a>&gt;</a> you'd like to practice</label>
            <input type="text" id="langkey-input" placeholder="swedish" list="langkey-list"/>
            <datalist id="langkey-list">
                ${langKeys.map((key) => `<option value="${key.lang_key}">${key.lang_key}</option>`).join('')}
            </datalist>
            <button type='submit' onclick="updateSections()">Select language</button>`;
}

const addToVoc = async (secondInput, nativeInput, category) => {
    if (secondInput.value === "" || nativeInput.value === "" ||
        category.value === "" || !langKeyValue) {
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
            second: secondInput.value,
            native: nativeInput.value,
            category: category.value,
            langKey: langKeyValue
        })
    });

    clearInputs();
    await updateSections();
}

window.onload = loadLangKeys;

const delFromVoc = async (secondInput, nativeInput, category) => {
    if (secondInput.value === "" && nativeInput.value === "" &&
        category.value === "") {
        alert("Invalid input\n");
        clearInputs();
        return;
    }

    const value = secondInput.value || nativeInput.value || category.value;
    const type = secondInput.value ? "second" : nativeInput.value ? "native" : "category";

    await fetch("/api/v1/delFromVocab", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            type: type,
            value: value,
            langKey: langKeyValue
        })
    });

    clearInputs();
    await updateSections();
}

const loadCardWindows = (taskType, deckSize) => {
    const secondDiv = document.querySelector( "#second-div")
    const nativeDiv = document.querySelector("#native-div");
    const footerEl = document.querySelector("#modal-footer");

    if (deckSize < 1) {
        alert("Category isn't big enough, insert more words to practice!");
        modalWindow.innerHTML = "";
        return;
    }

    switch(taskType) {
        case "practicing":
                secondDiv.innerHTML = `<div class="card practice" id="card-second"></div>`
                nativeDiv.innerHTML = `<div class="card practice" id="native-practice"></div>`;
            break;
        case "testing":
            secondDiv.innerHTML = `<div class="card second testing" id="card-second"></div>`
            nativeDiv.innerHTML = `<div id="native-testing-div">`

            secondDiv.style.width = '80%';
            secondDiv.style.paddingTop = '5px';
            nativeDiv.style.width = '110%';
            const nativeCardsInner = document.querySelector("#native-testing-div");

            for (let i = 0; i < 4; i++) {
                nativeCardsInner.innerHTML += `<div class="card native testing" id="native-testing${i + 1}"></div>`;
            }
            footerEl.innerHTML += `<p class="score">score:</p>`
            break;
        default:
            break;
    }
}

const renderModal = async (task) => {
    resetScore();

    const category = document.getElementById("task-cat").value;

    const res = await fetch(`/api/v1/fetchVocab?category=${category}&langKey=${langKeyValue}`);
    const vocabulary = await res.json();

    modalWindow.innerHTML = `
        <div class="modal content">
            <div>
            <span class="close" onclick="resetScore()"><a>&lt;</a>x<a>&gt;</a>
            </div>
            <div class="cards">
                <div id="second-div"></div>
                <div id="native-div"></div>
            </div>
            <div id="modal-footer">
                <button id="next-btn">Start</button>
            </div>
        </div>`;

    selectCat.innerHTML = "";

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

    const res = await fetch(`/api/v1/loadCats?langKey=${langKeyValue}`);
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

    let nativeCardDiv = document.getElementById("native-div");
    let elClone = nativeCardDiv.cloneNode(true);
    nativeCardDiv.parentNode.replaceChild(elClone, nativeCardDiv);
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
        highlightCards(correctWord, cards, undefined);
    }

    vocabulary = arrangeVocab(vocabulary, correctWord);
    isTestingActive = true;
    cards = [];

    for (let i = 0; i < 4; i++) {
        cards.push(fillCard(vocabulary, `#native-testing${i + 1}`, i));
        cards[i].addEventListener("click", () => {
            highlightCards(correctWord, cards, i);
        })
    }
}

const loadCards = async (vocabulary, task) => {
    const secondEl = document.querySelector("#card-second");

    document.getElementById("next-btn").innerText = "Next";
    let index = Math.floor(Math.random() * vocabulary.length);
    secondEl.innerText = `${vocabulary[index].second}`;
    const nativeWord = vocabulary[index].native;

    if (task === "testing") {
        evaluateRound(vocabulary.map(e => e.native), nativeWord);
    } else {
        document.querySelector("#native-practice").innerText = `${vocabulary[index].native}`;
    }
}