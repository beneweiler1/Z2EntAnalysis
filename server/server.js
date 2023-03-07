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


function getCookie(cookie) {
  const parts = cookie.split(':');
  console.log(parts[1])
  if (parts.length === 2) return parts.pop().split(';').shift();
}

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
      //console.log(token)
      //res.send(token)
      res.redirect('/data');
      })


      app.get('/getToken', async (req, res) => {
        console.log(token)
        res.send(token);
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

     app.get("/playlist/:id/:token", async (req, res) => {
      try{
        const playlistData = await axios.get(
          "https://api.spotify.com/v1/playlists/" + req.params.id + "/tracks",
          {
            headers: {
              Authorization: "Bearer " + req.params.token,
            },
          }
        );
        let songs = []
        let song = {}
        for(const tracks of playlistData.data.items){
          song = {'name':tracks.track.name, 'id':tracks.track.id,'artist':tracks.track.artists[0].name, 'releaseDate':tracks.track.album.release_date,'popularity':tracks.track.popularity}
          songs.push(song)
        }
        res.send(songs)
      }
      catch(error){
        res.status(500).send(error);
      }
    })

    app.get('/getSong/:id/:token', async (req, res) => {

        const songData = await axios.get(
          "https://api.spotify.com/v1/audio-features/" + req.params.id,
          {
            headers: {
              Authorization: "Bearer " + req.params.token,
            },
          }
        );
        console.log(songData)
        //dancability
        //engery
        //key
        //loudness
        //speechiness
        //acousticness
        //instramentalness
        //liveness
        //valence
        //tempo
        const sData = songData.data
        let song = {danceability:sData.danceability,
          energy:sData.energy,
          key:sData.key,
          loudness:sData.loudness,
          speechiness:sData.speechiness,
          acousticness: sData.acousticness,
          instrumentalness:sData.instrumentalness,
          liveness: sData.liveness,
          valence: sData.valence,
          tempo: sData.tempo
        }
        console.log(song);
        res.send(song);
    })


    app.get('/getSongs/:token', async(req, res) => {

        const songData = await axios.get(
          "https://api.spotify.com/v1/audio-features/7ouMYWpwJ422jRcDASZB7P%2C4VqPOruhp5EdPBeR92t6lQ%2C5mHdCZtVyb4DcJw8799hZp%2C7d2RGPmshGxHGhrBxhMND92takcwOaAZWiXQijPHIx7B%2C6FYbr9QzRoZPh0Re8lDO9z",
          {
            headers: {
              Authorization: "Bearer " + req.params.token,
            },
          }
        );
        console.log(songData.data)
        //dancability
        //engery
        //key
        //loudness
        //speechiness
        //acousticness
        //instramentalness
        //liveness
        //valence
        //tempo
        const sData = songData.data
        let song = {danceability:sData.danceability,
          energy:sData.energy,
          key:sData.key,
          loudness:sData.loudness,
          speechiness:sData.speechiness,
          acousticness: sData.acousticness,
          instrumentalness:sData.instrumentalness,
          liveness: sData.liveness,
          valence: sData.valence,
          tempo: sData.tempo
        }
        console.log(song);
        res.send(song);
    })


    app.get("/getPlaylistRec/:limit/:genre/:minpop/:maxpop", async (req, res) => {
        //token ="BQCD4OATmg3W44peHS07Z6YpgJOdfdNqiabXz82MGZDqQsziO3EWhCu-UAXZI5zQ4KcFebLzvXGAPr-43UjAbTBhMv4cLveNMk52-4P4zg87HGVvhSsj8Hm7LBnZ3ScN0Q6IgLVhVR4pqIUgQ66xRFt6dPY43-4pu1zRT42ILpYmwNiIFJfcYatB54Zxmp44qqIIchTPUAk"
        try{
          const recData = await axios.get(
            //"https://api.spotify.com/v1/recommendations?limit=100&seed_genres=country&min_popularity=1&max_popularity=100",
            "https://api.spotify.com/v1/recommendations?limit=" + req.params.limit + "&seed_genres=" + req.params.genre + "&min_popularity=" + req.params.minpop + "&max_popularity=" + req.params.maxpop,
            {
              headers: {
                Authorization: "Bearer " + token,
              },
            }
          );
          let songRecData = []
          let songRec = {}
          //console.log(recData.data)
          for(const tracks of recData.data.tracks){
            songRec = {'name':tracks.name, 'id':tracks.id, 'popularity':tracks.popularity, 'release_date': items.track.album.release_date}
            songRecData.push(songRec)

          }
          res.send(songRecData)
        }
        catch(error){
          res.status(500).send(error);
        }
      })

      app.get("/getSongRec/:limit/:songid/:token", async (req, res) => {
        //app.get("/getSongRec/:limit/:songid", async (req, res) => {
        try{
          const recData = await axios.get(
            "https://api.spotify.com/v1/recommendations?limit=" + req.params.limit + "&seed_tracks="+req.params.songid,
            {
              headers: {
                Authorization: "Bearer " + req.params.token,
              },
            }
          );
          let songRecData = []
          let songRec = {}
          for(const tracks of recData.data.tracks){
            //console.log(tracks.album.artists[0].name)
            //console.log(tracks.album.release_date)
            songRec = {'name':tracks.name, 'id':tracks.id, 'artist':tracks.album.artists[0].name, 'popularity':tracks.popularity,'release_date':tracks.album.release_date}
            songRecData.push(songRec)

          }
          res.send(songRecData)
        }
        catch(error){
          res.status(500).send(error);
        }
      })

      
      //take playlist
      //get songs name and id and store them in json
      //input take a song on playlist and query recommendations
      //add track name and id to json