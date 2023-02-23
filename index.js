const express = require("express");
const app = express();
const port = 4200;

try{
    await fetch('https://domain.invalid/');
} catch(error){
    console.log(error)
}

app.get("/", (req, res) => {
  res.send("Spotify App");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
