const prompt = require('inquirer')
const mysql = require('mysql')

var mainMenuPrompt = [
    {
        type: 'list',
        message: 'Please select an option: ',
        name: 'mainMenuOption',
        choices: ['View Products for Sale','View Low Inventory','Add to Inventory','Add New Product']
    }
]

function mainMenu() {
    prompt.prompt(mainMenuPrompt)
        .then(function(answers){
            if (answers.mainMenuOption == 'View Products for Sale') {
                console.log('load products for sale fn')
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
                console.log('something went wrong')
            }
        })
    
}

// call main menu 
mainMenu()