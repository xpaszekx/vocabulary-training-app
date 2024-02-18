const swedishInput = document.getElementById("word-swedish");
const czechInput = document.getElementById("word-czech");
const wordSet = document.getElementById("word-set");
const knownSets = document.getElementById("known-sets");

const CopyToClipboard = async (char) => {
    await navigator.clipboard.writeText(char);
}

const clearInputs = () => {
    swedishInput.value = "";
    czechInput.value = "";
    wordSet.value = "";
}

const loadSets = async () => {

    const res = await fetch(`/api/v1/loadSets`);
    const sets = await res.json();

    if (sets.length > 0) {
        knownSets.innerHTML = `
        <h2><a>&lt;</a>listed sets<a>&gt;</a></h2>
        <hr>
        <p class="listed-sets">${sets.map( e => e.wordset )}</p>`;
    }
}

// save to DB
const addToVoc = async (swedishInput, czechInput, wordSet) => {
    if (swedishInput.value === "" || czechInput.value === "" ||
        wordSet.value === "") {
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
            set: wordSet.value
        })
    });

    clearInputs();
    await loadSets();
}

window.onload = loadSets;

const modalWindow = document.getElementById("modal-window");

const runCards = (taskType) => {
    const setPracticeInput = document.getElementById("confirm-task");
    modalWindow.innerHTML = `
        <div class="modal">
            <div class="modal-content">
                <span class="close" onclick="modalWindow.innerHTML = ''"><a>&lt;</a>x<a>&gt;</a></div>
                <div class="cards">
                    <div class="word-div" id="swedish-word"></div>
                    <div class="word-div" id="czech-word"></div>
                </div>
                <div>
                    <button id="nextBtn">Start</button>
                </div>
            </div>
        </div>`;

    const swedishEl = document.querySelector("#swedish-word");
    const czechEl = document.querySelector("#czech-word");

    document.getElementById("nextBtn").addEventListener("click", async () =>
        await loadCards(setPracticeInput.value, swedishEl, czechEl, taskType));
}

const loadMode = (mode) => {

    const textMode = mode === "practice" ? "practicing" : "testing";

    modalWindow.innerHTML = `
        <label for='confirm-task' style='margin: auto'>enter the 
            <a>&lt;</a>set<a>&gt;</a> you'd like to practice</label>
        <input type='text' id='confirm-task' placeholder='geography'/>
        <button type='submit' onclick='runCards("${textMode}")'>Start ${textMode}</button>`
}

// load from DB
const loadCards = async (set, swedishEl, czechEl, task) => {
    const res = await fetch(`/api/v1/fetchVocab?set=${set}`);
    const vocabulary = await res.json();

    console.log(set);
    console.log( { vocabulary });

    document.getElementById("nextBtn").innerText = "Next";
    let index = Math.floor(Math.random() * vocabulary.length);
    swedishEl.innerText = `${vocabulary[index].swedish}`;

    if (task === "testing") { // TODO: finish up testing logic
        czechEl.addEventListener("click", () => czechEl.innerText = `${vocabulary[index].czech}`);
        czechEl.innerText = "";
    } else {
        czechEl.innerText = `${vocabulary[index].czech}`;
    }
}

// TODO: make success ratio for testing, multiple choices options and evaluation logic
