const swedishInput = document.getElementById("word-swedish");
const czechInput = document.getElementById("word-czech");
const wordSet = document.getElementById("word-set");
const knownSets = document.getElementById("known-sets");

async function CopyToClipboard(char) {
    await navigator.clipboard.writeText(char);
}

const clearInputs = () => {
    swedishInput.value = "";
    czechInput.value = "";
    wordSet.value = "";
}

let sets = JSON.parse(localStorage.getItem("sets")) || [];
let vocabulary = JSON.parse(localStorage.getItem("vocabulary")) || {};

const addToVoc = (swedishInput, czechInput, wordSet) => {
    if (swedishInput.value === "" || czechInput.value === "" ||
        wordSet.value === "") {
        alert("Invalid input\n");
        clearInputs();
        return;
    }

    if (!vocabulary[wordSet.value]) {
        sets.push(wordSet.value);
        vocabulary[wordSet.value] = [ ];
    }

    console.log(swedishInput.value, czechInput.value);
    vocabulary[wordSet.value].push({ swedish: swedishInput.value, czech: czechInput.value });

    localStorage.setItem("vocabulary", JSON.stringify(vocabulary));
    localStorage.setItem("sets", JSON.stringify(sets));
    clearInputs();
}

const loadSets = () => {
    if (sets.length > 0) {
        knownSets.innerHTML += `
        <h2><a>&lt;</a>listed sets<a>&gt;</a></h2>
        <hr>
        <p class="listed-sets">${sets}</p>`;
    }
}

window.onload = loadSets;

const modalWindow = document.getElementById("modal-window");

const runCards = (taskType) => {
    const setPracticeInput = document.getElementById(taskType);
    if (!vocabulary[setPracticeInput.value]) {
        alert("Select a valid set to practice!\n");
        modalWindow.innerHTML = "";
        return;
    }
    modalWindow.innerHTML = `
        <div class="modal">
            <div class="modal-content">
                <span class="close" onclick="modalWindow.innerHTML = ''"><a>&lt;</a>x<a>&gt;</a></div>
                <div class="cards">
                    <div class="word-div" id="swedish-word"></div>
                    <div class="word-div" id="czech-word"></div>
                </div>
                <div>
                    <button id="nextBtn">Continue</button>
                </div>
            </div>
        </div>`;

    const swedishEl = document.querySelector("#swedish-word");
    const czechEl = document.querySelector("#czech-word");

    czechEl.innerText = "";
    document.getElementById("nextBtn").addEventListener("click", () =>
        loadNextCards(setPracticeInput.value, swedishEl, czechEl, taskType));
}

const loadPractice = () => {
    modalWindow.innerHTML = `
        <label for='practice-set' style='margin: auto'>enter the 
            <a>&lt;</a>set<a>&gt;</a> you'd like to practice</label>
        <input type='text' id="practice-set" placeholder='geography'/>
        <button type='submit' onclick='runCards("practice-set")'>Start practicing</button>`
}

const loadTesting = () => {
    modalWindow.innerHTML = `
        <label for='testing-set' style='margin: auto'>enter the 
            <a>&lt;</a>set<a>&gt;</a> you'd like to practice</label>
        <input type='text' id='testing-set' placeholder='geography'/>
        <button type='submit' onclick='runCards("testing-set")'>Start testing</button>`
}

const loadNextCards = (set, swedishEl, czechEl, task) => {
    document.getElementById("nextBtn").content = "Next";
    let index = Math.floor(Math.random() * vocabulary[set].length);
    swedishEl.innerText = `${vocabulary[set][index].swedish}`;
    if (task === "testing-set") {
        czechEl.addEventListener("click", () => czechEl.innerText = `${vocabulary[set][index].czech}`);
        czechEl.innerText = "";
    } else {
        czechEl.innerText = `${vocabulary[set][index].czech}`;
    }
}

//TODO: make success ratio for testing, multiple choices options and evaluation logic