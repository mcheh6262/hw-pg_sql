// index.js
const express = require('express')
const router = express.Router()
const path = require('path')
const url = require('url')
const cors = require('cors')
const { response } = require('express')
const knex = require('knex')

const connectedKnex = knex({
    client: 'pg',
    version: '15',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'admin',
        database: 'postgres'
    }
})


const port = 8080;

const app = express()

// to use body parameters
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.use(express.static(path.join('.', '/static/'))) // /static/index.html
// page1.html

app.get('/fruit', (req, resp) => {
    resp.writeHead(201);
    resp.end('Banan is my favorite fruit!')
})

// parameters -
// 1. query params  <url> ? x = 1 & y = 2
// 2. path params   <url> / 1 
// 3. body 
// 4. headers
app.get('/add', (req, resp) => {
    // http://localhost:8080/ add ? x = 3 & y = 4

    console.log(req.url);
    console.log(req.query);

    const x = Number(req.query.x)
    const y = Number(req.query.y)

    if (isNaN(x)) {
        resp.writeHead(400)
        resp.end(`${req.query.x} is not a number`)
        return
    }
    if (isNaN(y)) {
        resp.writeHead(400)
        resp.end(`${req.query.y} is not a number`)
        return
    }

    resp.writeHead(200)
    resp.end(`<h1>${x} + ${y} = ${x + y}</h1>`)
    //resp.end(`${JSON.stringify(req.query.x)}`)
})

// ========================================== REST
// REST BASIC:
// 1.GET 2. GET by ID 3.POST (one-item) 4.PUT (update/replace/insert) 5.DELETE 6.PATCH (update only)
// EXTRA ==>
//  7.POST-MANY (json array)
//  8 SMART GET query params
// GRAPH-QL
// get all
app.get('/test', async (req, resp) => {
    try {
        const employees = await connectedKnex('test').select('*');
        console.log(employees);
        resp.status(200).json({ employees })
    }
    catch (err) {
        resp.status(500).json({ "error": err.message })
    }
})
// get end point by id
app.get('/employee/:id', async (req, resp) => {
    try {
        const employees = await connectedKnex('test').select('*').where('id', req.params.id).first()
        resp.status(200).json(employees)
    }
    catch (err) {
        resp.status(500).json({ "error": err.message })
    }
})

function is_valid_employee(obj) {
    return obj.hasOwnProperty('NAME') && obj.hasOwnProperty('AGE') && 
        obj.hasOwnProperty('ADDRESS') && obj.hasOwnProperty('SALARY') 
}

// ADD
app.post('/test', async (req, resp) => {
    console.log(req.body);
    const employee = req.body
    try {
        if (! is_valid_test (test)) {
            resp.status(400).json({ error: 'values of employee are not llegal'})
            return
        }
        const result = await connectedKnex('test').insert(test)
        resp.status(201).json({
             new_test : { ...test, ID: result[0] },
             url: `http://localhost:8080/employee/${result}` 
            })
    }
    catch (err) {
        resp.status(500).json({ "error": err.message })
    }
})

// PUT -- UPDATE/replace (or insert)
app.put('/test/:id', async (req, resp) => {
    console.log(req.body);
    const test = req.body
    try {
        if (! is_valid_employee (test)) {
            resp.status(400).json({ error: 'values of employee are not llegal'})
            return
        }
        const result = await connectedKnex('employee').where('id', req.params.id).update(test)
        resp.status(200).json({
             status: 'updated',
             'how many rows updated': result
            })
    }
    catch (err) {
        resp.status(500).json({ "error": err.message })
    }
})
// DELETE 
app.delete('/test/:id', async (req, resp) => {
    try {
        const result = await connectedKnex('test').where('id', req.params.id).del()
        resp.status(200).json({
            status: 'success',
            "how many deleted": result
        })
    }
    catch (err) {
        resp.status(500).json({ "error": err.message })
    }

})
// PATCH -- UPDATE 
app.patch('/test/:id', (req, resp) => {
    console.log(req.params.id);
    // actually delete ... later
    // response
    resp.writeHead(200)
    resp.end('Successfully updated patched')
})

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
})