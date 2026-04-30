const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "location_db",
    password: "1234",
    port: 5432,
});
app.post("/locations", async (req, res) => {
    try {
        const { nom_loc, design_voiture, nombre_jours, taux_journalier } = req.body;

        const result = await pool.query(
            `INSERT INTO location (nom_loc, design_voiture, nombre_jours, taux_journalier)
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [nom_loc, design_voiture, nombre_jours, taux_journalier]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

app.get("/locations", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM location");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.get("/locations/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM location WHERE numloc = $1",
            [id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

app.put("/locations/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nom_loc, design_voiture, nombre_jours, taux_journalier } = req.body;

        await pool.query(
            `UPDATE location 
       SET nom_loc = $1, design_voiture = $2, nombre_jours = $3, taux_journalier = $4
       WHERE numloc = $5`,
            [nom_loc, design_voiture, nombre_jours, taux_journalier, id]
        );

        res.json("Modification réussie");
    } catch (err) {
        console.error(err.message);
    }
});


app.delete("/locations/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            "DELETE FROM location WHERE numloc = $1",
            [id]
        );

        res.json("Suppression réussie");
    } catch (err) {
        console.error(err.message);
    }
});


app.get("/locations-loyer", async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT *,
      (nombre_jours * taux_journalier) AS loyer
      FROM location
    `);

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
    }
});


app.get("/stats", async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        SUM(nombre_jours * taux_journalier) AS total,
        MIN(nombre_jours * taux_journalier) AS min,
        MAX(nombre_jours * taux_journalier) AS max
      FROM location
    `);

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});


app.listen(5000, () => {
    console.log("Serveur lancé sur http://localhost:5000");
});
