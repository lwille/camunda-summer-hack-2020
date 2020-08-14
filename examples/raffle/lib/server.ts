import express from "express";

const { startRaffle } = require('./index');
const app = express();
const port = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  let flash = "";
  if (req.query.success && req.query.hashtag) {
    flash = `<h1>It worked!</h1><h2>Now go ahead and tweet under ${req.query.hashtag} to join the raffle!</h2>`;
  }
  res.send(`
    <body style="color: white; padding-top: 50px; background: url(https://camunda.com/wp-content/themes/camunda/assets/svg/orange-bg.svg); background-repeat: no-repeat; background-size: cover">
    <div style="width: 25rem; margin-left: auto; margin-right: auto">
        ${flash}
        <p>Send a GET /start?hashtag=HASHTAG to start a new lottery!</p>
        <form method="get" action="/start">
        <input type="text" name="hashtag" placeholder="enter your hashtag here" required/>
        <input type=submit value="do it"/>
        </form>
    </div>
    `);
});

app.get("/start", async (req, res) => {
  if (!req.query.hashtag) {
    return res.status(400).send("hashtag query param must be set");
  }
  await startRaffle(req.query.hashtag as string);
  res.redirect(`/?success=true&hashtag=${req.query.hashtag}`);
});

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
