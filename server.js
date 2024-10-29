
const express = require('express');
const mysql= require('mysql2');
const cors= require('cors');
const session= require('express-session');
const cookieParser= require('cookie-parser');
const bodyParser= require('body-parser');


const app = express();


app.use(express.json());

app.use(bodyParser.json());


app.use(cors({
    origin: ["http://localhost:3000"],
    method: ["POST", "GET","PUT","DELETE"],
    credentials: true
}));
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie:{
        secure: false,
        maxAge:1000 * 60 * 60 *24
    }
}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'crud',
    dateStrings:'date'
});

app.get('/profile',(req,res)=>{
    if(req.session.name){
        return res.json({valid: true,name: req.session.name});
    }
    else{
        return res.json({valid:false})
    }
})

app.post('/Signup', (req, res) => {
    console.log(req.body);  
    const sql = "INSERT INTO login (`name`, `email`, `password`) VALUES (?)";
    const values = [
        req.body.name,
        req.body.email,
        req.body.password
    ];
    db.query(sql, [values], (err, data) => {
        if (err) {
            console.log("Error inserting data:", err);
            return res.status(500).json({ error: err.message });
        }
        return res.status(200).json({ message: "Signup successful", data });
    });
});

app.post('/login', (req, res) => {
    const sql = "SELECT * FROM login WHERE  `email` = ? AND `password` = ?";
    db.query(sql, [req.body.email, req.body.password], (err, data) => {
        if (err) {
            console.log("Error querying data:", err);
            return res.status(500).json({ error: err.message });
        }
        if (data.length > 0) {
            req.session.userId=data[0].id;
            req.session.name =  data[0].name;
            return res.json({message:"Success",name : req.session.name});
            // return res.json("Success");
        } else {
            return res.json("Failure");
        }
    });
});


// display all record in book page
app.get('/book',(req,res)=>{
    const userId=req.session.userId;
    const sql="SELECT * FROM book WHERE user_id=?";
    db.query(sql,[userId], (err, data)=>{
        if(err){
            return res.json({error:"Error"})
        }
        return res.json(data)
    })
})

// create new record in createBook(post)
app.post('/create',(req,res)=>{
    const userId=req.session.userId;
    const sql="INSERT INTO book (publisher ,name,date, description,user_id) VALUES(?)";
    const values=[
        req.body.publisher,
        req.body.name,
        req.body.date,
        req.body.description,
        userId,
      
    ]
    db.query(sql,[values],(err,data )=>{
        if(err){
            return res.json({error:"Error"})
        }
        return res.json(data)
    })
})

//update record in updateBook
app.put('/update/:id',(req,res)=>{
    const userId=req.session.userId;
    const sql="UPDATE book set publisher=? , name=?,date=?,description=? where id=? AND user_id=?";

    const values = [
        req.body.publisher,
        req.body.name,
        req.body.date,
        req.body.description,
        req.params.id, 
        userId,
    ];
    db.query(sql,values,(err,data)=>{
        if(err){
            return res.json({error:"Error"})
        }
        return res.json(data)
    })
})

// delete existing record 
app.delete('/delete/:id',(req,res)=>{
    const userId=req.session.userId;
    const sql="DELETE FROM book where id=? AND user_id=?";
    // const id=req.params.id;
    const values =[req.params.id, userId]
    db.query(sql,values,(err,data)=>{
        if(err){
            return res.json({error:"Error"})
        }
        return res.json(data)
    })
})

// existing record to update
app.get('/getrecord/:id',(req,res)=>{
    const id=req.params.id;
    const sql="SELECT * FROM book WHERE id=?"
    db.query(sql,[id],(err,data)=>{
        if(err){
            return res.json({error:"Error"})
        }
        return res.json(data)
    })
})

// view  record using particular id 
app.get('/view/:id',(req,res)=>{
    const userId=req.session.userId;
    const id=req.params.id;
    const sql="SELECT * FROM book WHERE id=?";
    db.query(sql,[id], (err, data)=>{
        if(err){
            return res.json({error:"Error"})
        }
        return res.json(data)
    })
})

app.listen(8081, () => {
    console.log('Server listening on port 8081');
});








