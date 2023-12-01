const express = require('express')
const {open} = require('sqlite')
const path = require('path')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('server is running')
    })
  } catch (error) {
    console.log('DB Error: ${error.message}')
    process.exit(1)
  }
}

initializeDbAndServer()

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

app.get('/todos/', async (request, response) => {
  let data = null

  let getTodosQuery = ''

  const {search_q = '', priority, status} = request.query

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}' AND priority = '${priority}';`

      break

    case hasPriorityProperty(request.query):
      getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}';`
      break

    case hasStatusProperty(request.query):
      getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}';`
      break

    default:
      getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`
  }

  data = await database.all(getTodosQuery)
  response.send(data)
})

//get app
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodo = `SELECT * FROM todo WHERE id = ${todoId}`
  const todo = await db.get(getTodo)
  response.send(todo)
})

//app create
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const postTodo = `INSERT INTO todo(id, todo, priority, status) VALUES (${id}, '${todo}', '${priority}', '${status}' ) `
  await db.run(postTodo)
  response.send('Todo Successfully Added')
})

//app update

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params

  let updateColumn = ''

  const requestBody = request.body

  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = 'Status'

      break

    case requestBody.priority !== undefined:
      updateColumn = 'Priority'

      break

    case requestBody.todo !== undefined:
      updateColumn = 'Todo'

      break
  }

  const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`

  const previousTodo = await database.get(previousTodoQuery)

  const {
    todo = previousTodo.todo,

    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body

  const updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}' WHERE id = ${todoId};`

  await database.run(updateTodoQuery)
  response.send(`${updateColumn} Updated`)
})

//delete app
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodo = `DELETE FROM todo WHERE id = ${todoId} `
  await db.run(deleteTodo)
  response.send('Todo Deleted')
})

module.exports = app
