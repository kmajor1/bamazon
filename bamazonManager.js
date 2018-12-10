const prompt = require('inquirer')
const mysql = require('mysql')

var mainMenuPrompt = [
    {
        type: 'list',
        message: 'Please select an option: ',
        name: 'mainMenuOption',
        choices: ['View Products for Sale','View Low Inventory','Add to Inventory','Add New Product', 'Exit']
    }
]

function mainMenu() {
    prompt.prompt(mainMenuPrompt)
        .then(function(answers){
            if (answers.mainMenuOption == 'View Products for Sale') {
                queryRequested(productsQStr,null,productsForSale)
            }
            else if (answers.mainMenuOption == 'View Low Inventory' ) {
                queryRequested(lowInventoryQStr,lowInvParam,lowInventory)
            }
            else if (answers.mainMenuOption == 'Add to Inventory') {
                console.log('add to inventory fn')
            }
            else if (answers.mainMenuOption == 'Add New Product') {
                console.log('add new product fn')
            }
            else {
                pool.end()
            }
        })
    
}

// create connection pool
var pool = mysql.createPool({
    connectionLimit: 10, 
    host: 'localhost', 
    user: 'root',
    password: 'password',
    database: 'bamazon'
})

// relevant query strings 
var productsQStr = `select * from products`
var lowInventoryQStr = `select * from products where stock_quantity < ?`
var lowInvParam = ['5']

// function that takes in a query string and a call back to do something
function queryRequested(queryString, queryParams, callBack) {
    pool.getConnection(function(err,connection) {
        if (err) {
            console.log(err)
        }
        if (queryParams !== null) {
            connection.query(queryString,queryParams,callBack)
            connection.release()
        }
        else {
            connection.query(queryString,callBack)
            connection.release()
        }
        
    })
}

// call back for products for sale 
function productsForSale(err,results) {
    if (err) {
        console.log(err)
    }
    console.table(results)
    mainMenu()
}

// callback for low inventory query 
function lowInventory(err, results) {
    if (err) {
        console.log(err)
    }
    console.table(results)
    mainMenu()
}

// call main menu 
mainMenu()


