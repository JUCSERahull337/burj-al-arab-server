const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const admin = require('firebase-admin')
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
//onsole.log(process.env.DB_PASS)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xzr4t.mongodb.net/burjAlArab?retryWrites=true&w=majority`;




// const admin = require("firebase-admin");

const serviceAccount = require("./configs/burj-al-arab-afc80-firebase-adminsdk-luf0v-c8d86fe16e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const port = 4000;
const app = express()

app.use(cors())
app.use(express.json())

//pass: arabian7
//user: arabian


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  // perform actions on the collection object
  //console.log('db connected')
  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
    .then(result => {
      //console.log(result)
      res.send(result.insertedCount > 0);

    })
    console.log('Booked',newBooking)
  })
  //client.close();

  app.get('/bookings', (req,res)=>{
    const bearer= req.headers.authorization 
    if(bearer && bearer.startsWith('Bearer ')){
      const idToken = bearer.split(' ')[1]
      console.log({idToken})
        admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
        let tokenEmail = decodedToken.email;
        let queryEmail = req.query.email
        console.log(tokenEmail)
        console.log(queryEmail)
        // console.log({uid})
        if(tokenEmail == req.query.email){

          bookings.find({email: queryEmail })
          .toArray((err,documents)=>{
            res.send(documents);
          })
        }
        else{
          res.status(401).send('unauthorized access')
        }
        // ...
      })
      .catch((error) => {
        // Handle error
        res.status(401).send('unauthorized access')
      });

  }
  else{
    res.status(401).send('unauthorized access')
  }
  
  })
});


app.get('/', (req, res) =>{
    res.send("Hello world")
})

app.listen(port, ()=>{
    console.log('Server connected successfully')

})