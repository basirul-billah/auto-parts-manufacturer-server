const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r38tq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productsCollection = client.db("autoPartsManufacturer").collection("products");
        const reviewsCollection = client.db("autoPartsManufacturer").collection("reviews");
        const ordersCollection = client.db("autoPartsManufacturer").collection("orders");
        const usersCollection = client.db("autoPartsManufacturer").collection("users");

        // to load product information from db 
        app.get('/products', async (req, res) => {
            const query = {};
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        })

        // to get products by id
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.send(product);
        })

        // to load reviews from the db 
        app.get('/reviews', async (req, res) => {
            const query = {};
            const reviews = await reviewsCollection.find(query).toArray();
            res.send(reviews);
        })

        // to load orders
        app.get('/orders', async (req, res) => {
            const customer = req.query.customerEmail;
            const query = { customerEmail: customer };
            // const authorization = req.headers.authorization;
            const orders = await ordersCollection.find(query).toArray();
            res.send(orders);
        })

        // to put users
        app.put('/user/:email', async (req, res) => {
            const email = req.params.customerEmail;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ result, token })
        })

        // to post order 
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const query = {
                product: order.orderName,
                quantity: order.orderQuantity,
                customerName: order.customerName,
                customerAddress: order.customerAddress,
                customerPhone: order.customerPhone
            };
            const exists = await ordersCollection.findOne(query);
            if (exists) {
                return res.send({ success: false});
            }
            const result = await ordersCollection.insertOne(order);
            return res.send({ success: true });
        })
        
        // to post review 
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            return res.send({ success: true });
        })

        // to delete an order
        app.delete('/orders/:id', async (req, res) => {
            const order = req.params.id;
            const filter = { _id: ObjectId(order) };
            const result = await ordersCollection.deleteOne(filter);
            res.send(result);
        })
    }
    finally { }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server connected!');
})

app.listen(port, () => {
    console.log('Listening to port ', port);
})