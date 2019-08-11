const express = require('express')
const compression = require('compression')

const app = express()

// 先 compression 再托管静态资源
app.use(compression())
app.use(express.static('./dist'))

app.listen(80, () => {
  console.log('server is running at http://127.0.0.1')
})
