/*********************************************************************************
* WEB322 – Assignment 07
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this
* assignment has been copied manually or electronically from any other source (including web sites) or
* distributed to other students.
*
* Name: __Aakash Shrestha_______ Student ID: __140051160___ Date: ___2018/01/07___
*
* Online (Heroku) Link: _______https://warm-waters-56446.herokuapp.com/__________________________
*
********************************************************************************/
var express = require("express");
var dataService = require("./data-service.js");
const dataServiceComments=require("./data-service-comments.js");
var path = require("path");
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
var clientSessions = require("client-sessions");
var dataServieAuth = require("./data-service-auth.js");
var app = express();
app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "web322_A7", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});
function ensureLogin(req, res, next) {
    if (!req.session.user) {
    res.redirect("/login");
    } else {
    next();
    }
}
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true })); 
app.engine(".hbs", exphbs({
     extname: ".hbs",
     defaultLayout: 'layout', 
     helpers: {
          equal: function (lvalue, rvalue, options) {
               if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters"); 
               if (lvalue != rvalue) {
                return options.inverse(this);
               } else { 
                   return options.fn(this);
               }
           }
      }
 })); 
 app.set("view engine", ".hbs");
var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
   res.render("home");
});
app.get("/resume", function(req,res){
    dataServiceComments.getAllComments().then((dataFromPromise)=>{
        res.render("about",{data:dataFromPromise});        
    }).catch(()=>{
        res.render("about");        
    })
 });
// setup another route to listen on /about
app.get("/about", function(req,res){
    dataServiceComments.getAllComments().then((dataFromPromise)=>{
        res.render("about",{data:dataFromPromise});        
    }).catch(()=>{
        res.render("about");        
    })
});
//route for /employees
app.get("/employees", ensureLogin,function(req, res){
  
      if (req.query.manager) {
          dataService.getEmployeesByManager(req.query.manager)
              .then((employeesByManager) => {
                  res.render("employeeList",{data:employeesByManager, title:"Employees"});
              })
              .catch((err) => {
                res.render("employeeList",{data:err,title:"Employees"});
            })
      } else if (req.query.status) {
          dataService.getEmployeesByStatus(req.query.status)
              .then((employees) => {
                res.render("employeeList",{data:employees, title:"Employees"});
            })
              .catch((err) => {
                res.render("employeeList",{data:err,title:"Employees"});
            })
  
      } else if (req.query.department) {
          dataService.getEmployeesByDepartment(req.query.department)
              .then((employeesByDepartment) => {
                res.render("employeeList",{data:employeesByDepartment,title:"Employees"});
            })
              .catch((err) => {
                res.render("employeeList",{data:err,title:"Employees"});
            })
  
      } else {
          dataService.getAllEmployees()
              .then((employees) => {
                res.render("employeeList",{data:employees,title:"Employees"});
            })
              .catch((err) => {
                res.render("employeeList",{data:err,title:"Employees"});
            })
      }
  })
  //employees/value
app.get('/employee/:id', ensureLogin, function(req, res) {
  
       // initialize an empty object to store the values
    let viewData = {};
    dataService.getEmployeesByNum(req.params.id)
        .then((data) => {
            viewData.data = data; //store employee data in the "viewData" object as "data"
        }).catch(() => {
            viewData.data = null; // set employee to null if there was an error
        }).then(dataService.getDepartments)
        .then((data) => {
            viewData.departments = data; // store department data in the "viewData" object as "departments"
            // loop through viewData.departments and once we have found the departmentId that matches
            // the employee's "department" value, add a "selected" property to the matching
            // viewData.departments object
            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.data.department) {
                    viewData.departments[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.departments = []; // set departments to empty if there was an error
        }).then(() => {
            if (viewData.data == null) { // if no employee - return an error
                res.status(404).send("Employee Not Found");
            } else {
                res.render("employee", { viewData: viewData }); // render the "employee" view
            }
        });     
  });
  
  
  //managers
  app.get("/managers",ensureLogin, function(req, res) {
      dataService.getManagers()
          .then((managers) => {
            res.render("employeeList",{data:managers,title:"Employees (Managers)"});
        })
          .catch((err) => {
            res.render("employeeList",{data:err,title:"Employees (Managers)"});
        })
  })

  
  //departments
  app.get("/departments",ensureLogin, function(req, res) {
      dataService.getDepartments()
          .then((departments) => {
            res.render("departmentList",{data:departments,title:"Departments"});
        })
          .catch((err) => {
            res.render("departmentList",{data: err,title:"Departments"});
        })
  
  })
  
  //employees/add
  app.get("/employees/add",ensureLogin, (req, res) => {
    dataService.getDepartments()
    .then((departmentsList)=>{
        res.render("addEmployee", {departments: departmentsList})
    })
    .catch(()=>{
        res.render("addEmployee", {departments: []});
    })

});

app.post("/employees/add", ensureLogin, (req, res) => {
    dataService.addEmployee(req.body)
    .then((employees) =>{
        res.redirect("/employees");
    })
    .catch((err) =>{
        res.json({message: err});
    })
});

  app.post("/employee/update", ensureLogin, function(req,res){
    dataService.updateEmployee(req.body).then(function(){
        res.redirect("/employees");        
     })
  })
  //No matching route
  
  app.get("/departments/add",ensureLogin, function(req,res){
      res.render("addDepartment");
  })
  app.post("/departments/add",ensureLogin, function(req,res){
    dataService.addDepartment(req.body).then(function(){
       res.redirect("/departments");        
    })
  })
  app.post("/department/update",ensureLogin, function(req,res){
    dataService.updateDepartment(req.body).then(function(){
        res.redirect("/departments");        
     })
  })
  app.get("/department/:id",ensureLogin, function(req, res) {
    
        dataService.getDepartmentById(req.params.id)
            .then((data) => {
                res.render("department",{data: data, title: "Department By ID"});
            })
            .catch((err) => {
                res.status(404).send("Department Not Found");
            })       
});
    app.get("/employee/delete/:empNum",ensureLogin, function(req,res){
        dataService.deleteEmployeeByNum(req.params.empNum).then(function(){
            res.redirect("/employees");
        }).catch(function(err){
            res.status(500).send("Unable to Remove Employee/Employee not found");            
        })
    })


app.post("/about/addComment",(req,res)=>{
    dataServiceComments.addComment(req.body).then((id)=>{
        res.redirect("/about");
    }).catch((err)=>{
        console.log(err);
        res.redirect("/about");
    })
})
app.post("/about/addReply",(req,res)=>{
    dataServiceComments.addReply(req.body).then(()=>{
        res.redirect("/about");
    }).catch((err)=>{
        console.log(err);
        res.redirect("/about");
    })
})
app.get("/login",(req,res)=>{
    res.render("login");
});
app.get("/register", (req, res) => {
    res.render("register");
});
app.post("/login",(req,res)=>{
    dataServieAuth.checkUser(req.body).then(function(){
        req.session.user = {
            user:req.body.user
        };
        res.redirect("/employees");
    }).catch((err)=>{
        res.render("login", {errorMessage: err, user:req.body.user});
    })
});
app.get("/logout",(req,res)=>{
    req.session.reset();
    res.redirect("/");
});
app.post("/register",(req,res)=>{
    dataServieAuth.registerUser(req.body).then(function(){
        res.render("register", {successMessage: "User Created"});
    }).catch((err)=>{
        res.render("register", {errorMessage: err, user:req.body.user});
    })
});

app.post("/resume",(req,res)=>{
    console.log("Hello");  
    res.render("login");
})
app.use(function(req, res) {
    res.json({message: "ERROR 404: Page Not Found"});
})
// setup http server to listen on HTTP_PORT
dataService.initialize().then(function(){
    dataServiceComments.initialize().then(function(){
        dataServieAuth.initialize().then(function(){
            app.listen(HTTP_PORT, onHttpStart);
        })
        .catch(function(reason){
            console.log("cannot read the data service auth file due to " + reason);            
        })            
    })
    .catch(function(reason){
        console.log("cannot read the data service comments file due to " + reason);
      })
  })
  .catch(function(reason){
    console.log("cannot read the data service file due to " + reason);
  })
