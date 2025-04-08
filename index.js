const express = require('express')
const app = express()
const cors = require('cors')
const res = require('express/lib/response')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const users = []
let id = 1;

function userExists(username){
  for(const user of users) if(username == user.username) return true;
  return false
}

app.post('/api/users', function(req,res){
  console.log(users)
  const username = req?.body?.username
  let new_user = null;

  if(!userExists(username)){
    new_user = {
      username: username,
      _id: id
    }
    users.push(new_user)
    id+=1
  }
  res.send(new_user)
  console.log(users)

})





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
