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
  }) 
  

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
      console.log(token)
      res.redirect('/data');
      })
      
      app.get("/data/:artist", async (req, res) => {

        const data = await axios.get(
          "https://api.spotify.com/v1/search?q=" + req.params.artist +"&type=artist&limit=5",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        let artistId = data.data.artists.items[0].id
        const artistInfo = await axios.get(
          "https://api.spotify.com/v1/artists/"+artistId+"/related-artists?limit=5",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        //console.log(artistInfo.data.artists)

        res.send(artistInfo.data.artists[0])
        //res.redirect(artistInfo.data.artists[0].external_urls.spotify)
      }) 

     app.get("/playlist/:id", async (req, res) => {
      try{
        token = "BQBAJSln5dVj9FeB-fs-eJvUrA-B23el_MCawM6b_BcykKANAiwKHoVxfN9e2H7SAhTaw3xw3-ty6Vb6OGruAoVnQ9kg7nOMvF22K-L1SO-rF4AXLAeY_Iq1Rh1hYOp64UYt5ujAGR84O-3E0lYvjKDq7dOvycGXlba6ipu7972EPTP-LIP1jD2b3iRko2x_r7NZX1HDG14";
        const playlistData = await axios.get(
          "https://api.spotify.com/v1/playlists/" + req.params.id + "/tracks",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        const songs = []
  
        for(const items of playlistData.data.items){
          console.log(items.track.name);
        }
        console.log(playlistData.data.items[0].track.name)
        console.log(playlistData.data.items[0].track.popularity)
        console.log(playlistData.data.items[0].track.id)
        console.log(playlistData.data.items[0].track.album.release_date)
        res.send(playlistData.data.items)
      }
      catch(error){
        res.status(500).send(error);
      }
    })

    app.get('/song/:id', async (req, res) => {
        token = "BQBAJSln5dVj9FeB-fs-eJvUrA-B23el_MCawM6b_BcykKANAiwKHoVxfN9e2H7SAhTaw3xw3-ty6Vb6OGruAoVnQ9kg7nOMvF22K-L1SO-rF4AXLAeY_Iq1Rh1hYOp64UYt5ujAGR84O-3E0lYvjKDq7dOvycGXlba6ipu7972EPTP-LIP1jD2b3iRko2x_r7NZX1HDG14";
        const songData = await axios.get(
          "https://api.spotify.com/v1/audio-features/" + req.params.id,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        console.log(songData.data);
        res.send(songData.data);
    })

