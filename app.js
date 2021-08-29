const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const authJwt = require('./helper/jwt')
const errorHandler = require('./helper/error-handler')

require('dotenv/config')
const api = process.env.API_URL
const productRouter = require('./routers/products')
const categoryRouter = require('./routers/categories')
const userRouter = require('./routers/users')
const orderRouter = require('./routers/orders')

//middleware
app.use(bodyParser.json()) 
app.use(morgan('tiny'))
app.use(cors())
app.options('*',cors() )
app.use('/public/images', express.static(__dirname + '/public/images'))
//check token
app.use(authJwt())
app.use(errorHandler)

//Routers
app.use(`${api}/products`, productRouter)
// app.use(`${api}/categories`, categoryRouter)
app.use(`${api}/users`, userRouter)
app.use(`${api}/orders`, orderRouter)
app.use(`${api}/categories`, categoryRouter);







mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'eshop-database'
})
.then(()=>{
    console.log("connection is ready")
})
.catch((err)=>{
    console.log(err)
})

app.listen(3000, ()=>{
    console.log('server is running http://localhost:3000',api)
})