const sqlite = require("sqlite"); // wrapper for sqlite3
const sqlite3 = require("sqlite3");

let _db = null;

const Setup = async () => {
    const db = await sqlite.open({
            filename: 'db.db',
            driver: sqlite3.Database
        } )

    await db.exec(`
        CREATE TABLE IF NOT EXISTS vocabs (
            id INTEGER PRIMARY KEY,
            swedish TEXT NOT NULL,
            czech TEXT NOT NULL,
            wordset TEXT NOT NULL
        );`
    )

    _db = db;
}

const fetchVocab = async (set) => {
    if (set === "") { // i hate JS
        return await _db.all("SELECT * FROM vocabs");
    }
    return await _db.all("SELECT * FROM vocabs WHERE wordset = ?", set);
}

const saveNewVocab = async (entry) => {
    return await _db.run("INSERT INTO vocabs (swedish, czech, wordset) VALUES (?, ?, ?)", entry.swedish, entry.czech, entry.set);
}

const loadSets = async() => {
    return await _db.all("SELECT DISTINCT wordset FROM vocabs");
}

module.exports = { fetchVocab, saveNewVocab, Setup, loadSets };