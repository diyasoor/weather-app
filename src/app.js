const express = require("express");
const path = require('path');
const hbs = require('hbs');
const app = express();

const port = process.env.PORT || 8000

// public static path
const staticPath = path.join(__dirname, "../public");
const templatePath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");


app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(express.static(staticPath));
app.set('view engine', 'hbs');
app.set('views', templatePath);
hbs.registerPartials(partialsPath);

// routing
app.get("/", (req, res) => {
    res.render('index')
});

app.get("/weather", (req, res) => {
    res.render('weather')
});

app.get("/about", (req, res) => {
    res.render('about')
});

app.get("*", (req, res) => {
    res.render('error404')
});

app.listen(port, () => {
    console.log(`Listening to the port at ${port}`);
});