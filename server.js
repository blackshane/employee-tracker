const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const config = dotenv.config();
const inquirer = require('inquirer');

// Initiate express and establish PORT
const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({extended: false}));

// Create connection
const connection = mysql.createConnection(
    {
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    },
);

// Include how to setup .env in README.

connection.connect(function(error) {
    if(error) throw error;
    console.log(`Connected at port ${PORT}`); 
});

// Prompt User for Choices
const promptUser = () => {
  inquirer.prompt([
      {
        name: 'choices',
        type: 'list',
        message: 'Please select an option:',
        choices: [
          'View All Employees',
          'View All Roles',
          'View All Departments',
          'View All Employees By Department',
          'View Department Budgets',
          'Update Employee Role',
          'Update Employee Manager',
          'Add Employee',
          'Add Role',
          'Add Department',
          'Remove Employee',
          'Remove Role',
          'Remove Department',
          'Exit'
          ]
      }
    ])
    .then((answers) => {
      const {choices} = answers;

        if (choices === 'View All Employees') {
            viewAllEmployees();
        }

        if (choices === 'View All Departments') {
          viewAllDepartments();
      }

        if (choices === 'View All Employees By Department') {
            viewEmployeesByDepartment();
        }

        if (choices === 'Add Employee') {
            addEmployee();
        }

        if (choices === 'Remove Employee') {
            removeEmployee();
        }

        if (choices === 'Update Employee Role') {
            updateEmployeeRole();
        }

        if (choices === 'Update Employee Manager') {
            updateEmployeeManager();
        }

        if (choices === 'View All Roles') { //
            viewAllRoles();
        }

        if (choices === 'Add Role') {
            addRole();
        }

        if (choices === 'Remove Role') {
            removeRole();
        }

        if (choices === 'Add Department') {
            addDepartment();
        }

        if (choices === 'View Department Budgets') {
            viewDepartmentBudget();
        }

        if (choices === 'Remove Department') {
            removeDepartment();
        }

        if (choices === 'Exit') {
            connection.end();
        }
  });
};

// View All Employees
const viewAllEmployees = () => {
    const sql = `SELECT employee.id,
    employee.first_name,
    employee.last_name,
    role.title, 
    department.name AS 'department',
    role.salary
    FROM employee, role,department
    WHERE department.id = role.department_id
    AND role.id = employee.role_id`;
connection.promise().query(sql, (err, res) => {
    if (err) throw err;
    promptUser();
});
};

// View All Roles
const viewAllRoles = () => {
    const sql = `SELECT role.id, role.title, department.name AS department
    FROM role
    JOIN  department ON role.department_id = department.id`;
connection.promise().query(sql, (err, res) => {
    if (err) throw err;
    res.forEach((role) => {console.log(role.title);});
    promptUser();
});
};