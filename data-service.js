const Sequelize=require('sequelize');
var sequelize=new Sequelize('d1dt7bo4i11ujd','nbelmqgwowcqvv','2bef881960dcd6212cf73055481c6e489bf4a26b160730d3e8b40365967577bc',{
    host:'ec2-54-225-255-132.compute-1.amazonaws.com',
    dialect:'postgres',
    port:5432,
    dialectOptions:{
        ssl:true
    }
});
var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    last_name: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addresCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
    },{
        createdAt:false,
        updatedAt:false
})
var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
},{
    createdAt:false,
    updatedAt:false
})
module.exports.initialize = function(){
    return new Promise(function(resolve,reject){
        sequelize.sync().then(function(){
            resolve();
        }).catch(function(){
            reject("unable to sync the database");            
        });
    });   
}


module.exports.getAllEmployees = function(){
    return new Promise(function(resolve,reject){
        Employee.findAll().then(function(employees){
            resolve(employees);
        }).catch(function(){
            reject("no results returned");
        });
    });  
}

module.exports.getEmployeesByStatus = function(stat){
    return new Promise(function(resolve,reject){
        Employee.findAll({where: {status:stat}}).then(function(data){
            resolve(data);
        }).catch(function(){
            reject("no results returned");
        });
    });  
}

module.exports.getEmployeesByDepartment = function(department){
    return new Promise(function(resolve,reject){
        Employee.findAll({where:{department:department}}).then(function(data){
            resolve(data);
        }).catch(function(){
            reject("no results returned");
        });
    });  
}
module.exports.getEmployeesByManager = function(manager){
    return new Promise(function(resolve,reject){
        Employee.findAll({where:{employeeManagerNumber:manager}}).then(function(data){
            resolve(data);
        }).catch(function(){
            reject("no results returned");
        });
    });  
}

module.exports.getEmployeesByNum = function(num){
    return new Promise(function(resolve,reject){
        Employee.findAll({
            where:{employeeNum:num}
        }).then(function(data){
            resolve(data[0]);
        }).catch(function(){
            reject("no results returned");
        });
    });  
}

module.exports.getManagers = function(){
    return new Promise(function(resolve,reject){
        Employee.findAll({where:{isManager:true}}).then(function(data){
            resolve(data);
        }).catch(function(){
            reject("no results returned");
        });
    });  
}

module.exports.getDepartments = function(){
    return new Promise(function(resolve,reject){
        Department.findAll().then(function(data){
            resolve(data);
        }).catch(function(){
            reject("no results returned");
        });
    });  
}

module.exports.addEmployee = function (employeeData) {
    return new Promise((resolve, reject) => {
        empmngid = (employeeData.isManager) ? true : false;
        for (var prop in employeeData) {
            if (employeeData[prop] == "") {
                employeeData[prop] = null;
            }
        }
        Employee.create(
            {
                firstName: employeeData.firstName,
                last_name: employeeData.last_name,
                email: employeeData.email,
                SSN: employeeData.SSN,
                addressStreet: employeeData.addressStreet,
                addresCity: employeeData.addresCity,
                addressState: employeeData.addressState,
                addressPostal: employeeData.addressPostal,
                maritalStatus: employeeData.maritalStatus,
                isManager: empmngid,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                department: employeeData.department,
                hireDate: employeeData.hireDate
            })
            .then(() => {
                console.log("Employee Created");
                resolve();
            })
            .catch((err) => {
                reject("Could not create record for Employee: " + err.message)
            })
    })
}
module.exports.updateEmployee = function (employeeData) {
    return new Promise((resolve, reject) => {
        empmngid = (employeeData.isManager) ? true : false;
        for (var prop in employeeData) {
            if (employeeData[prop] == "") {
                employeeData[prop] = null;
            }
        }
        Employee.update(
            {
                firstName: employeeData.firstName,
                last_name: employeeData.last_name,
                email: employeeData.email,
                SSN: employeeData.SSN,
                addressStreet: employeeData.addressStreet,
                addresCity: employeeData.addresCity,
                addressState: employeeData.addressState,
                addressPostal: employeeData.addressPostal,
                maritalStatus: employeeData.maritalStatus,
                isManager: empmngid,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                department: employeeData.department,
                hireDate: employeeData.hireDate
            }, {
                where: {
                    employeeNum: employeeData.employeeNum
                }
            }).then(() => {
                console.log("Employee Updated");
                resolve();
            }).catch((err) => {
                reject(err.message);
            })
    });//End of Promise
}
module.exports.addDepartment = function(departmentData){
    return new Promise(function(resolve,reject){
        for (var property in departmentData) {
            if (departmentData[property] == "") {
                departmentData[property] = null;
            }
        }
        Department.create({
            departmentName:departmentData.departmentName
        }).then(function(){
            resolve();
        }).catch(function(){
            reject("unable to create department");
        });
    });  
}
module.exports.updateDepartment = function(departmentData){
    return new Promise(function(resolve,reject){
        for (var property in departmentData) {
            if (departmentData[property] == "") {
                departmentData[property] = null;
            }
        }
        Department.update({
            departmentName:departmentData.departmentName
        },{
            where:{departmentId:departmentData.departmentId}
        }).then(function(){
            resolve();
        }).catch(function(){
            reject("unable to update department");
        });
    });  
}
module.exports.getDepartmentById = function(id){
    return new Promise(function(resolve,reject){
        Department.findAll({where:{departmentId:id}}).then(function(data){
            resolve(data[0]);
        }).catch(function(){
            reject("no results returned");
        });
    });  
}
module.exports.deleteEmployeeByNum=function(empNum){
    return new Promise(function(resolve,reject){
        Employee.destroy({where:{employeeNum:empNum}}).then(function(){
            resolve();
        }).catch(function(){
            reject("could not delete the employee");
        });
    });
}