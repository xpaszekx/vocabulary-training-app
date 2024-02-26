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
            lang_key TEXT NOT NULL,
            second TEXT NOT NULL, 
            native TEXT NOT NULL,
            category TEXT NOT NULL
        );`
    )

    _db = db;
}

const fetchVocab = async (category, langKey) => {
    if (category === "") { // i hate JS
        return await _db.all("SELECT * FROM vocabs WHERE lang_key = ?", langKey);
    }
    return await _db.all("SELECT * FROM vocabs WHERE category = ? AND lang_key = ?", category, langKey);
}

const saveNewVocab = async (e) => {
    return await _db.run("INSERT INTO vocabs (second, native, category, lang_key) VALUES (?, ?, ?, ?)",
        e.second, e.native, e.category, e.langKey);
}

const loadCats = async(langKey) => {
    return await _db.all("SELECT DISTINCT category FROM vocabs WHERE lang_key = ?", langKey);
}

const viewCats = async(cat, langKey) => {
    if (cat === "") {
        return await _db.all("SELECT second, native FROM vocabs WHERE lang_key = ?", langKey);
    }
    return await _db.all("SELECT second, native FROM vocabs WHERE category = ? AND lang_key = ?", cat, langKey);
}

const delFromVocab = async(e) => {
    switch(e.type) {
        case 'second':
            return await _db.all("DELETE FROM vocabs WHERE second = ? AND lang_key = ?", e.value, e.langKey);
        case 'native':
            return await _db.all("DELETE FROM vocabs WHERE native = ? AND lang_key = ?", e.value, e.langKey);
        case 'category':
            return await _db.all("DELETE FROM vocabs WHERE category = ? AND lang_key = ?", e.value, e.langKey);
    }
}

const loadLangKeys = async () => {
    return await _db.all("SELECT DISTINCT lang_key FROM vocabs");
}

module.exports = { fetchVocab, saveNewVocab, Setup, loadCats, viewCats, delFromVocab, loadLangKeys };