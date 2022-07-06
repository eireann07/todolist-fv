const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Persisting data to mongodb
mongoose.connect(mongodb://localhost:27017); //To eliminate sharing identification information

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
  name: "Welcome to today's to-do list!"
});

const item2 = new Item ({
  name: "Click the + button to add a new item"
});

const item3 = new Item ({
  name: "<-- Click this to remove a completed item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema)

//Functionality
app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        } else {
          console.log("Success -- items saved to database");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});
//Create new list and show existing lists
app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, function(err, foundList){
      if(!err){
        if (!foundList) {
        //create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
})
});

  //getting a new item from list.ejs, saving to collection, displaying on correct route
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

//Deleting items off a list once checked off
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err){
          console.log("Item deleted");
          res.redirect("/");
          }
        });
      } else {
         List.findOneAndUpdate(
           {name: listName},
           {$pull: {items: {_id:checkedItemId}}},
           function (err, foundList){
             if(!err){
               res.redirect("/" + listName);
             }
           })
      }
});

app.get("/about", function (req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started");
});
