const express = require('express')
require('dotenv').config()

const app = express()
const port = 4000


app.listen(port, () => console.log(`Example backend API listening on port ${port}!`))
