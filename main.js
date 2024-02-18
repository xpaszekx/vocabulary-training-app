const express = require("express");
const DB = require("./db");

// instance of express, middleware, init
const app = express();

(async function Setup() {
    await DB.Setup();
})();

app.use(express.static("public"));
app.use(express.json());

app.get("/api/v1/fetchVocab", async (req, res) => {
    const vocab = await DB.fetchVocab(req.query.set);
    res.json(vocab);
})

app.post("/api/v1/saveNewVocab", async (req, res) => {
    const vocab = await DB.saveNewVocab(req.body);
    res.json(vocab);
})

app.get("/api/v1/loadSets", async (req, res) => {
    const sets = await DB.loadSets();
    res.json(sets);
})

// set port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Running on PORT: ${PORT}`);
});

