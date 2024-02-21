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
            category TEXT NOT NULL
        );`
    )

    _db = db;
}

const fetchVocab = async (category) => {
    if (category === "") { // i hate JS
        return await _db.all("SELECT * FROM vocabs");
    }
    return await _db.all("SELECT * FROM vocabs WHERE category = ?", category);
}

const saveNewVocab = async (entry) => {
    return await _db.run("INSERT INTO vocabs (swedish, czech, category) VALUES (?, ?, ?)",
        entry.swedish, entry.czech, entry.category);
}

const loadCats = async() => {
    return await _db.all("SELECT DISTINCT category FROM vocabs");
}

const viewCats = async(cat) => {
    if (cat === "") {
        return await _db.all("SELECT swedish, czech FROM vocabs");
    }
    return await _db.all("SELECT swedish, czech FROM vocabs WHERE category = ?", cat);
}

module.exports = { fetchVocab, saveNewVocab, Setup, loadCats, viewCats };