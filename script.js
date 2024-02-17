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

const addToVoc = (swedishInput, czechInput, wordSet) => {
    if (swedishInput.value === "" || czechInput.value === "" ||
        wordSet.value === "") {
        alert("Invalid input\n");
        clearInputs();
        return;
    }

    let vocabulary = JSON.parse(localStorage.getItem("vocabulary")) || {};

    if (!vocabulary[wordSet.value]) {
        sets.push(wordSet.value);
        vocabulary[wordSet.value] = [ ];
    }

    console.log(swedishInput.value, czechInput.value);
    vocabulary[wordSet.value].push({ swedish: swedishInput.value, czech: czechInput.value });

    localStorage.setItem("vocabulary", JSON.stringify(vocabulary));
    localStorage.setItem("sets", JSON.stringify(sets));
    clearInputs();

    location.reload();
}

const loadSets = () => {
    if (sets[0]) { // this is weird but sets or sets !== [ ] didn't work
        knownSets.innerHTML += `
        <h2><a>&lt;</a>known sets<a>&gt;</a></h2>
        <hr>
        <p class="listed-sets">${sets}</p>`;
    }
}

window.onload = loadSets;