import express from 'express'
import path from 'path'


const app = express()

app.use(express.static(path.join(path.resolve(), 'public')))

app.use(express.json())

app.get('/',(req,res)=> {
    res.json({message:'hello world!'})
})
app.post('/data',(req,res) => {
    const {name} = req.body
    res.json({message:`Hello, ${name}!`})
})
app.listen(8080 ,() => {
    console.log('Server is running on http://localhost:8080')
})