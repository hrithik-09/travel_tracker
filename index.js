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

async function checkvisited(){
  const result=await db.query("SELECT country_code FROM visited_countries");
  let countries=[];
  result.rows.forEach(element => {
    countries.push(element.country_code);    
  });
  // console.log(result.rows);
  return countries;
}
// Home Page
app.get("/", async (req, res) => {
  //Write your code here.
  const countries=await checkvisited();
  res.render("index.ejs",{
    countries:countries,
    total:countries.length
  });
  // db.end();
});

// Insert data in the table
app.post("/add",async(req,res)=>{
  const input=req.body["country"];
  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE country_name LIKE '%'$1'%'",
      [input]
    );
    // console.log(result.rows);
    
      const data=result.rows[0];
      const code=data.country_code;
      // console.log(code);
    try {
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",[code,]);
      res.redirect("/");
      
    } catch (error) {
      // console.log(error);
      const countries=await checkvisited();
      res.render("index.ejs",{
        countries:countries,
        total:countries.length,
        error:"Country has already been marked"
      });
    }
  } catch (error) {
    // console.log(error);
    const countries=await checkvisited();
    res.render("index.ejs",{
      countries:countries,
      total:countries.length,
      error:"Country name does not exist"
    });
  }
  
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
