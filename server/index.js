import express from 'express';
import cors from 'cors';
import {authorize, listSheets, listTurns, reserve} from './indexGS.cjs';

const gClient = await authorize()

const app = express();
const port= 3030;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) =>{
  res.send("Soy el server de las reservas");
})

app.get("/listSheets", async function (req, res){
    try {
        const result =await listSheets(gClient);
        res.json({
            sheets:result
        })
    } catch (error) {
        
    }
})

app.get("/getTurns", async function (req, res){
  try{
    const result =await listTurns(gClient, req.query.d, req.query.sheet);
    res.json({
      turns:result
    })
  } catch(error){
    console.log(error)
  }
})

app.post("/reserve", async function (req,res){
  try{
    const data = req.body.data;
    const result = await reserve(gClient, data.day, data.sheet, data.column, data.keyword);
    res.json({
      status:result
    });
  }catch(error){
    console.log(error)
  }
})

app.listen(port, () => {
  console.log(`El servidor está corriendo en el puerto: ${port}`);
  console.log(listSheets(gClient));
})