const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('./db/db.json');
const { v4: uuidv4 } = require('uuid');
const { readAndAppend, readFromFile, writeToFile } = require('./helpers/fsUtils');

// console.log( uuidv4())

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, './public/notes.html'))
);

app.get('/api/notes', (req, res) => {
  res.sendFile(path.join(__dirname, './db/db.json'))
});


app.post('/api/notes', (req, res) => {
  console.info(`${req.method} request received`);
  const { title, text } = req.body;
  if (title && text) {
    const newNote = {
      title,
      text,        
      id: uuidv4(),
    };

    readAndAppend(newNote, './db/db.json');
    const response = {
      status: 'success',
      body: newNote,
    };

    res.status(201).json(response);
  } else {
    res.status(500).json('Error');
  }
});

app.delete('/api/notes/:id', (req, res) => {

  if(req.params.id){
      readFromFile('./db/db.json').then((data) => {
          const noteData = JSON.parse(data);
  
          for (let i = 0; i < noteData.length; i++) {
              if (req.params.id === noteData[i].id) {                     
                  noteData.splice(i, 1);           
              }
          }

          writeToFile('./db/db.json', noteData);
  
          const response = {
              status: 'success',
              body: noteData,
          };
        
          res.status(201).json(response);
          
      });
  } else {
      res.status(500).json('Error');
  }

});

app.get('*', (req, res) => 
  res.sendFile(path.join(__dirname, './public/index.html'))
);

app.listen(PORT, () =>
  console.log(`Example app listening at http://localhost:${PORT}`)
);

// Jon Cherwin helped me figure out the delete function. lines 49-75. 