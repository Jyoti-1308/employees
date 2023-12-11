var express = require("express");
var app = express();
const cors = require('cors');
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET,OPTIONS,PATCH,PUT,DELETE,HEAD,POST"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
var port = process.env.PORT||2410;
app.listen(port, () => console.log(`Node App listening on port ${port}!`));

let mysql = require("mysql");
let connData = {
    host: "localhost",
    user: "root",
    password: "",
    database: "test",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
app.get("/svr/resetData", function (req, res) {
    let conn = mysql.createConnection(connData);
    let sql = "delete from employees";
    conn.query(sql, function (err, result) {
        if (err) res.status(404).send(err);
        else {
            let { emps } = require("./empData.js");
            let arr = emps.map(ele => [ele.empCode, ele.name, ele.department, ele.designation, ele.salary, ele.gender]);
            let conn = mysql.createConnection(connData);
            let sql = "insert into employees values ?";
            conn.query(sql, [arr], function (err, result) {
                if (err) res.status(404).send(err);
                else {
                    console.log(result);
                }
            })
        }
    })
})
app.get("/svr/employees", function (req, res) {

    let { sortBy = '', department = '', designation = '', gender = '' } = req.query;

    let conn = mysql.createConnection(connData);
    let sql = `select * from employees `;
    if (department || designation || gender) {
        sql += " WHERE";
        const conditions = [];

        if (department) {
            conditions.push(" department=?");
        }

        if (designation) {
            conditions.push(" designation=?");
        }
        if (gender) {
            conditions.push(" gender=?");
        }
        sql += conditions.join(" AND");
    }
    if (sortBy) {
        sql += ` ORDER BY ${sortBy}`;
    }

    console.log(sql);
    if (department || designation || gender) {
        const params = [];
        if (department) {
            params.push(department);
        }
        if (designation) {
            params.push(designation);
        }
        if (gender) {
            params.push(gender);
        }
        conn.query(sql, params, function (err, result) {

            if (err) {
                console.error(err);
                res.status(500).send(err);
            } else {
                res.send(result);
            }
        });
    }
    else {
        let sql1 = sortBy ? `select * from employees order by ${sortBy}` : "select * from Employees";
        conn.query(sql1, function (err, result) {
            if (err) res.status(404).send(err);
            else {
                res.send(result);
            }
        })
    }

});
app.get("/svr/employees/department/:department", function (req, res) {
    console.log('2')
    let department = req.params.department;
    console.log(department);
    let { sortBy } = req.query;
    let conn = mysql.createConnection(connData);

    let sql = sortBy ? `select * from employees where department=? order by ${sortBy}` :
        "select * from employees where department=?";

    conn.query(sql, department, function (err, result) {
        if (err) res.status(404).send(err);
        else res.send(result);
    })
});
app.get("/svr/employees/designation/:designation", function (req, res) {

    let designation = req.params.designation;
    let { sortBy } = req.query;
    let conn = mysql.createConnection(connData);

    let sql = sortBy ? `select * from employees where designation=? order by ${sortBy}` :
        "select * from employees where designation=?";

    conn.query(sql, designation, function (err, result) {
        if (err) res.status(404).send(err);
        else res.send(result);
    })
});
app.post("/svr/employees", function (req, res) {
    let emp = req.body;
    let data = Object.values(emp);
    console.log(data);
    let conn = mysql.createConnection(connData);
    let sql = "insert into employees values(?,?,?,?,?,?)";
    conn.query(sql, data, function (err, result) {
        if (err) res.status(404).send(err);
        else res.send(result);
    })
})
app.put("/svr/employee/:empCode", function (req, res) {
    let empCode = req.params.empCode;
    let { name, department, designation, salary, gender } = req.body;
    let data1 = [name, department, designation, salary, gender, empCode];
    let conn = mysql.createConnection(connData);
    let sql = "update employees set name=?,department=?,designation=?,salary=?,gender=? where empCode=?";
    conn.query(sql, data1, function (err, result) {
        if (err) res.status(404).send(err);
        else res.send(result);
    })
})
app.get("/svr/employee/:empCode", function (req, res) {

    let empCode = req.params.empCode;

    let conn = mysql.createConnection(connData);
    let sql = "select * from employees where empCode=?";

    conn.query(sql, empCode, function (err, result) {
        if (err) res.status(404).send(err);
        else {
            // console.log(result);
            res.send(result[0]);
        }
    })
});
app.delete("/svr/employee/delete/:empCode",function(req,res){
    let empCode=req.params.empCode;
    let sql=`delete from employees where empCode=?`;
    conn=mysql.createConnection(connData);
    conn.query(sql,empCode,function(err,result){
        if(err) res.status(404).send(err);
        else res.send(result);
    })
})