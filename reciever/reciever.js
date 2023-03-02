const express = require('express');
const axios = require("axios");
const app = express();
const port = 4200;
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const tableName = 'SpotifySongData'
// Load environment variables from .env file
dotenv.config();

// Create a new DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Start the Express application
app.listen(port, () => {
  console.log('Server listening on port 4200');
  //editData('7fM3iJ14tE5SX1L1TVpf7p', 'So Long - Tails Remix','2021-06-25',0, 1, 5, 456, 4, 456, 546, 45, 45, 5, 5);
});

// Define a route that queries the DynamoDB table
app.get('/getItems', async (req, res) => {
  try {
    const result = await dynamoDB.scan({
      TableName: tableName,
    }).promise();
    console.log(result.Items.length)
    res.json(result.Items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/putItems/:id/:name', async (req, res) => {
  const { id, name, popularity } = req.params;

  if (!id || !name || !popularity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await dynamoDB.put({
      TableName: tableName,
      Item: { id, name, popularity }
    }).promise();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

async function addData(id, name, artist, release_date, popularity){
  try {
    const result = await dynamoDB.put({
      TableName: tableName,
      Item: { id, name, artist, release_date, popularity}
    }).promise();

    return result;
  } catch (err) {
    console.error(err);
  }
}

async function editData(
  id,
  name,
  artist,
  release_date,
  popularity,
  danceability,
  energy,
  key,
  loudness,
  speechiness,
  acousticness,
  instramentalness,
  liveness,
  valence,
  tempo
  )
  {
  try {
    const result = await dynamoDB.put({
      TableName: tableName,
      Item: {
        id,
        name,
        artist, 
        release_date,
        popularity,
        danceability,
        energy,
        key,
        loudness,
        speechiness,
        acousticness,
        instramentalness,
        liveness,
        valence,
        tempo}
    }).promise();

    return result;
  } catch (err) {
    console.error(err);
  }
}


app.get('/addPlaylist/:playlistId', async (req, res) => {
  try {
    console.log('here')

    const token = await axios.get(
      "http://localhost:8080/getToken"
    );

      const recData = await axios.get(
        "http://localhost:8080/playlist/" + req.params.playlistId + "/" + token.data,
      );

      for(let size = 0; size < recData.data.length; size++){
        addData(recData.data[size].id,
          recData.data[size].name,
          recData.data[size].artist,
          recData.data[size].releaseDate,
          recData.data[size].popularity);
      }

    res.send('done!')
  
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/collectData', async (req, res) => {
    try {
      const tableSongs = await dynamoDB.scan({
        TableName: tableName,
      }).promise();
      console.log(tableSongs.length)
  
      if (tableSongs.Count === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const token = await axios.get(
        "http://localhost:8080/getToken"
      );

      for(let index = 0; index < tableSongs.Items.length; index++){
        currSongId = tableSongs.Items[index].id
        const recData = await axios.get(
          "http://localhost:8080/getSongRec/" + 1 + "/" + currSongId + "/" + token.data,
        );
        console.log(recData.data)
        for(let size = 0; size < recData.data.length; size++){
          addData(recData.data[size].id, 
            recData.data[size].name,
            recData.data[size].artist,
            recData.data[size].release_date,
            recData.data[size].popularity);
        }
      }
      res.send('done!')
    
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/collectAllData', async (req, res) => {
    try {
      const tableSongs = await dynamoDB.scan({
        TableName: tableName,
      }).promise();
  
      if (tableSongs.Count === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const token = await axios.get(
        "http://localhost:8080/getToken"
      );

      for(let index = 0; index < tableSongs.Items.length; index++){
        currSongId = tableSongs.Items[index].id
        const recData = await axios.get(
          "http://localhost:8080/getSongRec/" + 1 + "/" + currSongId + "/" + token.data,
        );
        for(let size = 0; size < recData.data.length; size++){
          let songData = await axios.get(
            "http://localhost:8080/getSong/"+ recData.data[size].id + "/" + token.data,
          );
          let s = songData.data
          editData(
            recData.data[size].id,
            recData.data[size].name,
            recData.data[size].artist,
            recData.data[size].release_date,
            recData.data[size].popularity,
            s.danceability,
            s.energy,
            s.key,
            s.loudness,
            s.speechiness,
            s.acousticness,
            s.instramentalness,
            s.liveness,
            s.valence,
            s.tempo)
        }
      }
      res.send('done!')
    
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  app.get('/editData', async(req,res) => {
    try {
      const tableSongs = await dynamoDB.scan({
        TableName: tableName,
      }).promise();
  
      if (tableSongs.Count === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const token = await axios.get(
        "http://localhost:8080/getToken"
      );
      console.log(token.data)
      
      for(let itemIndex = 0; itemIndex < tableSongs.Items.length; itemIndex++){
        let songData = await axios.get(
          "http://localhost:8080/getSong/"+tableSongs.Items[itemIndex].id + "/" + token.data,
        );
        let s = songData.data
        editData(
          tableSongs.Items[itemIndex].id,
          tableSongs.Items[itemIndex].name,
          tableSongs.Items[itemIndex].artist,
          tableSongs.Items[itemIndex].release_date,
          tableSongs.Items[itemIndex].popularity,
          s.danceability,
          s.energy,
          s.key,
          s.loudness,
          s.speechiness,
          s.acousticness,
          s.instramentalness,
          s.liveness,
          s.valence,
          s.tempo)
      }
      res.send('done!')

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })

      //take playlist
      //get songs name and id and store them into the db
      //loop
        //go through dynamo and do 2 things
          //1. append the extra song data to the item in db
          //2. get song rec based on song add them to db
