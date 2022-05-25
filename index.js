const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r38tq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        await client.connect();
        const productsCollection = client.db("autoPartsManufacturer").collection("products");
        const reviewsCollection = client.db("autoPartsManufacturer").collection("reviews");

        // to load product information from db 
        app.get('/products', async (req, res) => {
            const query = {};
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        })

        // to load reviews from the db 
        app.get('/reviews', async (req, res) => {
            const query = {};
            const reviews = await reviewsCollection.find(query).toArray();
            res.send(reviews);
        })
    }
    finally{}
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server connected!');
})

app.listen(port, () => {
    console.log('Listening to port ', port);
})