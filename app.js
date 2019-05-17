const express = require('express')
const app = express()
const port = 3000
const axios = require('axios')
const bodyParser = require('body-parser')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', function(req, res) {
  res.sendStatus(200);
  axios.get('https://nathan@clearemg.com:p545jQ86MGSQ@altrurig04bo3.blackbaudhosting.com/17197_78f88cc8-2db3-42d8-a8f1-789dc2945bde/ODataQuery.ashx?databasename=042DE44C-EA21-48A9-8631-8069474BE6E7&AdHocQueryID=a74fadf2-ec6f-4500-a72b-54da85bc592a')
  .then((response) => console.log(response.data.value))
  .catch((err) => {
    console.log(err)
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))