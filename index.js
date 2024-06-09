import express from "express";
import bodyParser from "body-parser";
import pg from"pg";
const app = express();
const port = 3000;

const db = new pg.Client({
  user:"postgres",
  host:"localhost",
  database:"world",
  password:"root",
  port:5432
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Home Page
app.get("/", async (req, res) => {
  //Write your code here.
  const result=await db.query("SELECT country_code FROM visited_countries");
  let countries=[];
  result.rows.forEach(element => {
    countries.push(element.country_code);    
  });
  console.log(result.rows);
  res.render("index.ejs",{
    countries:countries,
    total:countries.length
  });
  // db.end();
});

// Insert data in the table
app.post("/add",async(req,res)=>{
  const input=req.body["country"];
  const result = await db.query(
    "SELECT country_code FROM countries WHERE country_name = $1",
    [input]
  );
  console.log(result.rows);
  if (result.rows.length!==0) {
    const data=result.rows[0];
    const code=data.country_code;
    console.log(code);
    await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",[code,]);
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
