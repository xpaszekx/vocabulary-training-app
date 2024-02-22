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

const saveNewVocab = async (e) => {
    return await _db.run("INSERT INTO vocabs (swedish, czech, category) VALUES (?, ?, ?)",
        e.swedish, e.czech, e.category);
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

const delFromVocab = async(e) => {
    switch(e.type) {
        case 'swedish':
            return await _db.all("DELETE FROM vocabs WHERE swedish = ?", e.value);
        case 'czech':
            return await _db.all("DELETE FROM vocabs WHERE czech = ?", e.value);
        case 'category':
            return await _db.all("DELETE FROM vocabs WHERE category = ?", e.value);
    }
}

module.exports = { fetchVocab, saveNewVocab, Setup, loadCats, viewCats, delFromVocab };