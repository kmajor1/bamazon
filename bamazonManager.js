const prompt = require('inquirer')
const mysql = require('mysql')

// create connection pool
var pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'bamazon'
})

// relevant query strings
var productsQStr = `select products.id, product_name, department_name, department_id, price, stock_quantity from products join departments on departments.id=products.department_id;`
var lowInventoryQStr = `select * from products where stock_quantity < ?`
var lowInvParam = ['5']
var getProductCurQuantity = `select stock_quantity from products where id = ? `
var addInvetoryQStr = `update products set stock_quantity = ? where id = ?`
var newProductQStr = `insert into products VALUES (null,?,?,?,?)`

var mainMenuPrompt = [
  {
    type: 'list',
    message: 'Please select an option: ',
    name: 'mainMenuOption',
    choices: ['View Products for Sale', 'View Low Inventory', 'Add Stock to Inventory', 'Add New Product', 'Exit']
  }
]

// main program loop
function mainMenu () {
  prompt.prompt(mainMenuPrompt)
    .then(function (answers) {
      if (answers.mainMenuOption === 'View Products for Sale') {
        queryRequested(productsQStr, null, productsForSale)
      } else if (answers.mainMenuOption === 'View Low Inventory') {
        queryRequested(lowInventoryQStr, lowInvParam, lowInventory)
      } else if (answers.mainMenuOption === 'Add Stock to Inventory') {
        prompt.prompt([
          {
            type: 'input',
            name: 'productIdAdd',
            message: 'Please select a Product ID',
            validate: function (input){
              if (isNaN(parseInt(input))) {
                return 'Must be a number!'
              }
              else {
                return true 
              }
            }
          },
          {
            type: 'input',
            name: 'productIdAmtToAdd',
            message: 'Please enter quantity to add to inventory',
            validate: function(input) {
              if (isNaN(parseInt(input))) {
                return 'Must be a number!'
              }
              else {
                return true 
              }
            }
          }
        ])
          .then(function (answers) {
            // get current quantity of product
            var getStockQuantityParams = [answers.productIdAdd]
            pool.getConnection(function (err, connection) {
              if (err) {
                console.log(err)
              }
              connection.query(getProductCurQuantity, getStockQuantityParams, function (err, results) {
                if (err) {
                  console.log(err)
                }
                var stock_quantity = results[0].stock_quantity
                var quantToAdd = parseInt(answers.productIdAmtToAdd)
                var newTotal = stock_quantity + quantToAdd

                getStockQuantityParams = [newTotal, answers.productIdAdd]
                // call update query
                connection.query(addInvetoryQStr, getStockQuantityParams, updateCurrentQuantity)
                connection.release()
              })
            })
          })
      } else if (answers.mainMenuOption === 'Add New Product') {
        prompt.prompt([
          {
            type: 'input',
            name: 'newProductName',
            message: 'Enter Product Name'

          },
          {
            type: 'input',
            name: 'newProductDept',
            message: 'Enter product department ID',
            validate: function (input) {
              if (isNaN(parseInt(input))) {
                return 'Must be a number!'
              } else {
                return true
              }
            }

          },
          {
            type: 'input',
            name: 'newProductPrice',
            message: 'Enter product price',
            validate: function (input) {
              if (isNaN(parseInt(input))) {
                return 'Must be a number!'
              } else {
                return true
              }
            }
          },
          {
            type: 'input',
            name: 'newProductQuantity',
            message: 'Enter starting quantity',
            validate: function (input) {
              if (isNaN(parseInt(input))) {
                return 'Must be a number!'
              } else {
                return true
              }
            }
          }
        ])
          .then(function (answers) {
            var newProductParams = [answers.newProductName, answers.newProductDept, answers.newProductPrice, answers.newProductQuantity]
            queryRequested(newProductQStr, newProductParams, newProduct)
          })
      } else {
        pool.end()
      }
    })
}

// function that takes in a query string and a call back to do something
function queryRequested (queryString, queryParams, callBack) {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err)
    }
    if (queryParams !== null) {
      connection.query(queryString, queryParams, callBack)
      connection.release()
    } else {
      connection.query(queryString, callBack)
      connection.release()
    }
  })
}

// call back for products for sale
function productsForSale (err, results) {
  if (err) {
    console.log(err)
  }
  console.table(results)
  mainMenu()
}

// callback for low inventory query
function lowInventory (err, results) {
  if (err) {
    console.log(err)
  }
  console.table(results)
  mainMenu()
}

// Callback for get current quanity query
function updateCurrentQuantity (err, results) {
  if (err) {
    console.log(err)
  }
  console.log('Updated!')
  mainMenu()
}

// callback for add new product
function newProduct (err, results) {
  if (err) {
    console.log(err)
  }
  console.log(`New product added, Product ID = ${results.insertId}`)
  mainMenu()
}

// call main menu
mainMenu()
