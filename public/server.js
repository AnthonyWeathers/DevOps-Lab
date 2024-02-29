const express = require('express')
const app = express()
const path = require('path')

// include and initialize the rollbar library with your access token
var Rollbar = require('rollbar')
var rollbar = new Rollbar({
  accessToken: '3553feb0b2ae4fb29c86ef0cfba71198', // go to projects/your project name/project access tokens and get post client item
  captureUncaught: true,
  captureUnhandledRejections: true,
})

// record a generic message and send it to Rollbar
rollbar.log('Hello world!')

app.use(express.json())

const students = ['Jimmy', 'Timothy', 'Jimothy']

app.get('/', (req, res) => { // the '/' means to look in the root directory of this folder
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/api/students', (req, res) => {
    rollbar.info('Someone accessed the student list')
    res.status(200).send(students)
})

app.post('/api/students', (req, res) => {
   let {name} = req.body

   const index = students.findIndex(student => {
       return student === name
   })

   try {
       if (index === -1 && name !== '') {
            rollbar.warning(`Someone had added a student`)
           students.push(name)
           res.status(200).send(students)
       } else if (name === ''){
           rollbar.warning('Someone tried to add an empty string')
           res.status(400).send('You must enter a name.')
       } else {
           rollbar.critical('Someone tried to duplicate a student')
           res.status(400).send('That student already exists.')
       }
   } catch (err) {
        rollbar.critical('Something went wrong in the student list post request')
       console.log(err)
   }
})

app.delete('/api/students/:index', (req, res) => {
    const targetIndex = +req.params.index
    
    students.splice(targetIndex, 1)
    //rollbar.critical('Someone deleted a student')
    rollbar.critical(`A student was deleted`)
    res.status(200).send(students)
})

const port = process.env.PORT || 5050

app.listen(port, () => console.log(`Server listening on ${port}`))
