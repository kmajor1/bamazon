const query = require('mysql')
const prompt = require('inquirer')

var connection = query.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  port: 3306,
  database: 'bamazon'
})

var displayProductsQ = 'select products.id, product_name, department_name, price, stock_quantity from products join departments on departments.id=products.department_id;'

connection.connect()
connection.query(displayProductsQ, function (err, res) {
  if (err) {
    console.log(err)
  }
  console.table(res, ['id', 'product_name', 'price', 'stock_quantity'])
  // run prompt for user
  prompt.prompt([
    {
      type: 'input',
      name: 'productId',
      message: 'Please enter product ID you would like to purchase: ',
      validate: function (input) {
        if (isNaN(parseInt(input))) {
          return 'Must be a number'
        } else {
          return true
        }
      }
    },
    {
      type: 'input',
      name: 'quantity',
      message: 'Please enter the quantity',
      validate: function (input) {
        if (isNaN(parseInt(input))) {
          return 'Must be a number'
        } else {
          if (input <= 0) {
            return 'Must be postive number'
          } else {
            return true
          }
        }
      }
    }
  ]).then(
    function (answers) {
      checkQuantity(answers.productId, answers.quantity)
    }
  )
})

function checkQuantity (productId, quantity) {
  connection.query(`select stock_quantity, price, product_name from products where id = ?`, productId, function (err, results) {
    if (err) {
      console.log(err)
    }
    var actualQuantity = results[0].stock_quantity
    var quantityInt = parseInt(quantity)
    var totalCost = (results[0].price) * quantityInt
    var productName = results[0].product_name

    if (actualQuantity < quantityInt) {
      console.log(`Insufficient quantity! Only ${actualQuantity} left!`)
      connection.end()
    } else {
      connection.query(`update products set stock_quantity = ? where id = ? `, [actualQuantity - quantityInt, productId], function (err, res) {
        if (err) {
          console.log(err)
          connection.end()
        }
        console.log(`Your order of ${quantityInt} units of ${productName} was successful!`)
        console.log('You owe $' + totalCost)
        console.log()
        connection.end()
      })
    }
  })
}
