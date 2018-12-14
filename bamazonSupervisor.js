const prompt = require('inquirer')
const query = require('mysql')
// inquirer prompt option
let supervisorPrompt = [
  {
    type: 'list',
    name: 'supOptions',
    message: 'Choose an option',
    choices: ['View Product Sales by Department', 'Create New Department']
  }
]

// prompt to take in values for new department
let newDeptPrompt = [
  {
    type: 'input',
    name: 'newDeptName',
    message: 'Enter a new department name'
  },
  {
    type: 'input',
    name: 'newDeptOverhead',
    message: 'Enter overhead costs',
    validate: function (input) {
      if (isNaN(parseFloat(input))) {
        return 'Must be a number!'
      } else {
        return true
      }
    }
  }
]

// setup database connection
let connection = query.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  port: 3306,
  database: 'bamazon'
})

// sales summary query string
let salesSummaryQStr = `select department_id as 'Department ID', department_name as 'Department Name', sum(overhead_costs) as 'Overhead Costs', sum(products.product_sales) as 'Product Sales', (sum(product_sales-overhead_costs)) as 'Total Profit' from products join departments on products.department_id=departments.id
group by departments.id, departments.department_name`

// create new department query string
let createNewDeptQStr = `insert into departments VALUES (null,?,?)`

// invoke prompt
prompt.prompt(supervisorPrompt)
  .then(function (answers) {
    // connect to the database
    connection.connect()
    if (answers.supOptions === 'View Product Sales by Department') {
      // query for sales summary table
      connection.query(salesSummaryQStr, function (err, results) {
        if (err) {
          console.log(err)
        }
        console.table(results)
        connection.end()
      })
    } else if (answers.supOptions === 'Create New Department') {
      prompt.prompt(newDeptPrompt)
        .then(function (answers) {
          let deptName = answers.newDeptName
          let deptOverhead = answers.newDeptOverhead
          let newDeptQueryConfig = [deptName, deptOverhead]
          // query to update
          connection.query(createNewDeptQStr, newDeptQueryConfig, function (err, results) {
            if (err) {
              console.log(err)
            }
						console.log(`New Department, ID ${results.insertId}, ${deptName} added!`)
						connection.end()
          })
        })
    }
  })
