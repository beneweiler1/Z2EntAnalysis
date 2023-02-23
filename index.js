//const express = require("express");
import axios from "axios";
import express from 'express';
import queryString from 'query-string';
import * as dotenv from 'dotenv'
const app = express();
const port = 8080;
dotenv.config()
let token = ""

//https://medium.com/@awoldt/using-spotify-api-with-javascript-9dd839407f12
//https://developer.spotify.com/console/get-search-item/?q=remaster%2520track%3ADoxy%2520artist%3AMiles%2520Davis&type=&market=ES&limit=10&offset=5&include_external=

app.listen(8080, () => {
  console.log("App is listening on port 8080!\n");
});

app.get("/", (req, res) => {
    res.send(
      "<a href='https://accounts.spotify.com/authorize?client_id=" + process.env.CLIENT_ID +
       "&response_type=code&redirect_uri=" + process.env.URI_ENCODED + "&scope=user-top-read'>Sign in</a>"
    );
  }); 
  

  app.get("/account", async (req, res) => {
    //console.log("spotify response code is " + req.query.code);
    const spotifyResponse = await axios.post(
        "https://accounts.spotify.com/api/token",
        queryString.stringify({
          grant_type: "authorization_code",
          code: req.query.code,
          redirect_uri: process.env.URI_DECODED,
        }),
        {
          headers: {
            Authorization: "Basic " + process.env.AUTH_ENCODED,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      token = String(spotifyResponse.data.access_token);
      res.redirect('/data');
      });

      
      
      app.get("/data", async (req, res) => {
        const data = await axios.get(
          "https://api.spotify.com/v1/search?q=alison%20wonderland&type=artist&limit=5",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        let artistId = data.data.artists.items[0].id
        console.log(artistId)
        const artistInfo = await axios.get(
          "	https://api.spotify.com/v1/artists/"+artistId+"/related-artists?limit=5",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        console.log(artistInfo.data)
        res.send(artistInfo.data)
      }); 


     