const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DBError:${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
//Get all todos with status TODO API
app.get("/todos/", async (request, response) => {
  const { search_q = "", status = "", priority = "" } = request.query;
  const getToDoDetailsQuery = `
    SELECT * FROM 
    todo 
    WHERE todo LIKE '%${search_q}%' AND status LIKE '%${status}%' AND priority LIKE '%${priority}%';`;
  const getToDoArray = await db.all(getToDoDetailsQuery);
  response.send(getToDoArray);
});

//Get specific todo based on todoId API
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getParticularToDoIdQuery = `
    SELECT * FROM
    todo WHERE id=${todoId};`;
  const getParticularToDoIdDetails = await db.get(getParticularToDoIdQuery);
  response.send(getParticularToDoIdDetails);
});

//Add New ToDo API
app.post("/todos/", async (request, response) => {
  const toDoDetails = request.body;
  const { id, todo, priority, status } = toDoDetails;
  const addNewToDoQuery = `
    INSERT INTO todo(id,todo,priority,status) 
    VALUES (${id},'${todo}','${priority}','${status}');`;
  await db.run(addNewToDoQuery);
  response.send("Todo Successfully Added");
});

//Update Todo Details of Particular ToDoId API
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const updateToDoDetails = request.body;
  let toBeUpdatedColumn = "";
  const previousToDoListQuery = `
    SELECT * FROM todo
    WHERE id=${todoId};`;
  const previousToDos = await db.get(previousToDoListQuery);
  const {
    todo = previousToDos.todo,
    priority = previousToDos.priority,
    status = previousToDos.status,
  } = request.body;
  switch (true) {
    case updateToDoDetails.todo !== undefined:
      toBeUpdatedColumn = "Todo";
      break;
    case updateToDoDetails.priority !== undefined:
      toBeUpdatedColumn = "Priority";
      break;
    case updateToDoDetails.status !== undefined:
      toBeUpdatedColumn = "Status";
      break;
  }
  const updateToDoDetailsQuery = `
    UPDATE todo
    SET todo='${todo}',
    priority='${priority}',
    status='${status}'
    WHERE id=${todoId};`;
  await db.run(updateToDoDetailsQuery);
  response.send(`${toBeUpdatedColumn} Updated`);
});

//Delete ToDo based on ToDoId API
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteToDoIdQuery = `
    DELETE FROM
    todo WHERE id=${todoId};`;
  await db.run(deleteToDoIdQuery);
  response.send("Todo Deleted");
});
module.exports = app;
