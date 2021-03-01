const express = require('express')
var bodyParser = require('body-parser')
let app = express()
app.set('view engine', 'ejs')
app.use(express.static("public"))
require('dotenv').config()
const urlencodedParser = bodyParser.urlencoded({extended:false})
const { body, validationResult } = require('express-validator')
var _ = require('lodash')
const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)
const getDate = require('./date.js')
const PORT = process.env.PORT || 3000

let defaultArray = [{item_name: 'Welcome to your do list'}, 
    { item_name: 'Hit the Plus button to enter a new item'}, 
    { item_name : 'Click on checkbox to delete item'}]


mongoose.connect("mongodb+srv://"+ process.env.DATABASE_PASSWORD +"/myapp?retryWrites=true&w=majority&ssl=true",  {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});
/************************************************************************************* */
// const itemSchema = new mongoose.Schema({
//     item_name : {
//         type: String,
//         min: [2, 'Too few letters'],
//         max: 100
//     },
//     created_date : { type: Date, default: Date.now }
// })
// const Item = mongoose.model('Item', itemSchema);

const itemSchema = new mongoose.Schema({
    item_name : {
        type: String,
        required: true
    }
})

const Item = mongoose.model('Item', itemSchema);

/** *********************************  */  

// const listSchema = new mongoose.Schema({
//     category_name : {
//        type : String,
//        min: [3, 'Too few letters'],
//        max : 40
//     },
//     items : [itemSchema]
    
// })

//const List = mongoose.model('List', listSchema)
//
const listCategory = new mongoose.Schema({
    category_name : {
        type: String,
        required: true
    },
    items : [itemSchema]
})

const List = mongoose.model('List', listCategory);

let allCategories = [];

List.find(function(err, foundLists){
    if(foundLists.length > 0 ){
        foundLists.forEach(function(item){
           allCategories.push(item.category_name)
        })
    }
})




//



/************************************************************************************* */




/************************** get and post for main route ******************************* */
app.get('/', (req, res)=>{

    console.log(allCategories)

    Item.find(function(err, items){
        if(err){
            console.log(err)
            res.render('index', {
                items : null,
                category : getDate.getDay(),
                allLists : allCategories
            })
        }else{
            if(items.length > 0){
                res.render('index', {
                   items : items,
                   category : getDate.getDay(),
                   allLists : allCategories
                })
            }

            else{
                Item.insertMany(defaultArray, function(err){
                    if(err){
                        res.redirect('/')
                    }
                    else{
                        res.redirect('/')
                    }
                })

            }
        }
    })

})


app.post('/', urlencodedParser,(req, res)=>{

    let item_name = req.body.inputName.trim()

    let categoryName = req.body.button
    console.log(categoryName);

    item_name = _.upperFirst(item_name)

    if(item_name === ''){
        console.log('empty field is not allowed')
        res.redirect('/')
    }else{


        let item = new Item({
            item_name : item_name
        })

        if(categoryName === getDate.getDay()){
            item.save(function(err){
                if(err){
                    console.log(err)
                    res.redirect('/')
                }else{
                    console.log('success')
                    res.redirect('/') 
                }
            })
        }else{
            List.findOne({category_name : categoryName}, function(err, foundList){
                if(err){
                    res.redirect('/categoryName')
                }else{
                    foundList.items.push(item)
                    foundList.save()
                    res.redirect('/'+ categoryName)
                }
            })

        }

    }

})  
// End of get and post for main route


/*******************  delete route   */

app.post('/delete', urlencodedParser, (req, res)=>{
    //let id = req.body.name;

    let id = req.body.check 

    console.log(req.body)
    //console.log(id)
    let categoryName = req.body.categoryName;
    
    if(categoryName === getDate.getDay()){
        Item.deleteOne({ _id: id }, function(err){
            if(err){
                res.redirect('/') 
            }else{
                res.redirect('/')
            }
            
        });
    }else{
        List.findOneAndUpdate({category_name: categoryName }, 
            {$pull: { items: {_id: id} } }, 
        function(err, foundList){
            if(err){
                res.redirect('/')
            }else{
                res.redirect('/'+ foundList.category_name)
            }

        })
    }

    
    
}) 
// end of delete route.....................................................

app.get('/:categoryName', urlencodedParser ,function(req, res){

    let categoryName =_.upperFirst(req.params.categoryName)

    List.findOne({category_name: categoryName}, function(err, foundList){
        if(err){
            res.redirect('/' + categoryName) 

        }else if(foundList === null){

            const listItem = new List({
                category_name : categoryName,
                items : defaultArray
            })

            listItem.save(function(err){
                if(err){
                    res.redirect('/' + categoryName)
                }else{
                    res.redirect('/' + categoryName) 
                }
            })
            
        }else{
            res.render('index', {
                items : foundList.items,
                category : foundList.category_name,
                allLists : allCategories  
            })
        }
    })

})


app.post('/add', urlencodedParser, function(req, res){
    var c = req.body.categoryList;
    res.redirect('/'+ c)
})


// create a category ...............................................................

app.post('/category', urlencodedParser, function(req, res){
    let categoryName = req.body.createCategory.trim()
    categoryName = _.upperFirst(categoryName) 
    res.redirect('/' + categoryName)
})


/************************************************************************************ */
app.listen(PORT, ()=> {
    console.log("app is running on port: " + PORT)
})

