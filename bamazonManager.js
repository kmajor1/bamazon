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
                console.log('Low Invetory fn')
            }
            else if (answers.mainMenuOption == 'Add to Inventory') {
                console.log('add to inventory fn')
            }
            else if (answers.mainMenuOption == 'Add New Product') {
                console.log('add new product fn')
            }
            else {
                return 
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

// function that takes in a query string and a call back to do something
function queryRequested(queryString, queryParams, callBack) {
    pool.getConnection(function(err,connection) {
        if (err) {
            console.log(err)
        }
        connection.query(queryString,callBack)
        connection.release()
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

// call main menu 
mainMenu()


