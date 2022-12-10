//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://Kanishka2012:test123@cluster1.sy01emd.mongodb.net/todolistDB");

const itemSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true
  }
  // _id: String
});

const Item=mongoose.model("Item",itemSchema);

const ListSchema=new mongoose.Schema({
  listName:String,
  items:[itemSchema]
});

const List= mongoose.model("List", ListSchema);

const item1=new Item({
  name:"Welcome to your todolist"
});

const item2=new Item({
  name:"Hit the + button to add a new item"
});

const item3=new Item({
  name:"<-- Hit this to delete an item"
});

const defaultItems=[item1,item2,item3];

app.get("/", function(req, res) {
  Item.find({},function(err,items){
    if(items.length === 0){
           Item.insertMany([item1,item2,item3], function(err){
                 if(err) console.log(err);
             else console.log("Inserted all the items")
         });
    }
    // else
    res.render("list", {listTitle: "Today", newListItems: items});
  });
});

app.post("/", function(req, res){

  const text = req.body.newItem;
  let title=req.body.list;
  title=title.trim();
  const item=new Item({
    name:text
  });
 
  console.log(title+" hello");
  if (title === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({listName:title},function(err,foundlist){
      console.log(foundlist);
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+foundlist.listName);
    })
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:type",function(req,res){
  console.log(req.params.type);
  const customListName=_.capitalize(req.params.type);
  List.findOne({listName:customListName},function(err,foundlist){
    if(!err) {
      if(!foundlist){
        const list=new List({
          listName:customListName,
          items: defaultItems
        });
        list.save()
        res.redirect("/"+list.listName);
      }
      else
      res.render("list",{listTitle:foundlist.listName,newListItems:foundlist.items});
  }
  else console.log(err);
});
})

app.post("/delete", function(req,res){
  let checkedItemId = req.body.checked;
  let title=req.body.title;
  if(title){
    title=title.trim();
  }
  console.log(title);
  if(checkedItemId){
    checkedItemId = checkedItemId.trim();
  }
  if(title=="Today"){
    Item.findOneAndDelete({_id:checkedItemId},function(err){
      if(!err) {
        console.log("deleted one item");
        res.redirect("/")
      }
       else console.log(err);
    });
  }
  else{
    List.findOneAndUpdate({listName:title},{$pull:{items:{_id:checkedItemId}}},function(err,foundlist){
      if(!err)  console.log("Successfully deleted an item from custom list");
      res.redirect("/"+title);
    });
  }

 });




app.listen(3000, function() {
  console.log("Server started on port 3000");
});
