const express = require('express')
const hbs = require('hbs');
const session = require("express-session");


var MongoClient = require('mongodb').MongoClient

const app = express();
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname +'/views/partials')
app.use(express.static(__dirname + '/public'))


var url = "mongodb+srv://bach:tuantai12345@cluster0.0hpdy.mongodb.net/test";


app.get('/', async (req, res)=>{
    res.render('login')
})

app.get('/index', async (req, res)=>{
    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    let results = await dbo.collection("productDB").find({}).toArray();
    res.render('index', {model:results})
})

app.get('/insert', (req,res)=>{
    res.render('newProduct');
})

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));

app.post('/doInsert', async (req, res)=>{
    let nameInput = req.body.txtName;
    let colorInput = req.body.txtColor;
    let priceInput = req.body.txtPrice;


    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    let newProduct = {productName : nameInput, price: priceInput, color: colorInput};
    await dbo.collection("productDB").insertOne(newProduct);
    
    res.redirect('/');
})

app.get('/search', (req, res)=>{
    res.render('search');
})
app.post('/doSearch', async (req, res)=>{
    let nameInput = req.body.txtName;
    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    let results = await dbo.collection("productDB").find({productName: nameInput}).toArray();
    res.render('index', {model:results})
})

app.get('/delete', async (req,res)=>{
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id": ObjectID(id)};

    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    await dbo.collection("productDB").deleteOne(condition)
    console.log(condition);
    res.redirect('/');
})

app.get('/edit',async (req,res)=>{
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;

    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    let results = await dbo.collection("productDB").findOne({_id : ObjectID(id)});
    res.render('update', {ProductDB:results});
})
app.post('/doUpdate', async (req, res)=>{
    let id =req.body.id;
    let name = req.body.txtNames;
    let price = req.body.txtPrices;
    let color = req.body.txtColors;

    let newValue = {$set : {productName: name, price: price, color: color}};
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(id)};

    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    await dbo.collection("productDB").updateOne(condition,newValue)

    res.redirect('/');
})
app.get('/register', (req,res)=>{
    res.render('register');
})

app.post('/doRegister',async (req,res)=>{
    let names = req.body.txtName;
    let pass = req.body.txtPass;


    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    let newProduct = {name : names, password: pass};
    await dbo.collection("account").insertOne(newProduct);
    
    res.redirect('login');
})

app.get('/login', (req,res)=>{
    res.render('login');
})

app.post('/doLogin', async (req,res)=>{
    let nameInput = req.body.txtName;
    let passInput = req.body.txtPass;

    let client = await MongoClient.connect(url);
    let dbo = client.db("ProductDB");
    let account = {name : nameInput, password: passInput};
    await dbo.collection("account").findOne({name: nameInput, password: passInput});
    if(!account){
        res.end('User account or password incorrect');
    }
    else{
        res.redirect('/index'); 
    }
    
})


var PORT = process.env.PORT || 3000
app.listen(PORT)
console.log("server running...")