const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();
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

    // Create Connection
connection.connect(function(err) {
    if(err) throw err;
    console.log(`Connected at port ${PORT}`); 
    promptUser();
});

    // Prompt User for Choices
const promptUser = () => {
  inquirer.prompt([
      {
        name: 'choices',
        type: 'list',
        message: 'Please select an option:',
        choices: [
        
          'View All Departments', 
          'View All Roles',   
          'View All Employees',   
          'Add Department',
          'Add Role',
          'Add Employee',
          'Update Employee Role',       
          'View All Employees By Department',
          'View Department Budgets',
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


        if (choices === 'Add Department') {
            addDepartment();
        }

        if (choices === 'View Department Budgets') {
            viewDepartmentBudget();
        }

  });
};

    // View All Employees
const viewAllEmployees = async () => {
    try {
    const sql = `SELECT employee.id,
    employee.first_name,
    employee.last_name,
    role.title, 
    department.name AS 'department',
    role.salary
    FROM employee, role,department
    WHERE department.id = role.department_id
    AND role.id = employee.role_id`;
    const [rows, fields] = await connection.promise().query(sql);
    console.table(rows);
    promptUser();
} catch (err) {
    console.error(err);
}
};

    // View All Roles
const viewAllRoles = async () => {
    try{
    const sql = `SELECT role.id, role.title, department.name AS department
        FROM role
        JOIN  department ON role.department_id = department.id`;
    const [rows] = await connection.promise().query(sql);
    rows.forEach((role) => {
        console.log(role.title);
    });
    promptUser();
} catch (err) {
    console.error(err);
    }
};

    // View all Departments
const viewAllDepartments = async () => {
    try {
    const sql =  `SELECT department.id AS id, department.name AS department FROM department`; 
    const [rows, fields] = await connection.promise().query(sql);
    console.table(rows);
    promptUser();
    } catch(err) {
        console.error(err);
    }
  };
  
    // View all Employees by Department
const viewEmployeesByDepartment = async () => {
    try {
    const sql = `SELECT employee.first_name, 
            employee.last_name, 
            department.name AS department
            FROM employee 
            LEFT JOIN role ON employee.role_id = role.id 
            LEFT JOIN department ON role.department_id = department.id`;
    const [rows, fields] = await connection.promise().query(sql);
        console.table(rows);
        promptUser();
    } catch(err) {
        console.error(err);
    }
};

    // View all Departments by Budget
const viewDepartmentBudget = async () => {
    try {
    const sql =     `SELECT department_id AS id, 
                    department.name AS department,
                    SUM(salary) AS budget
                    FROM  role  
                    INNER JOIN department ON role.department_id = department.id GROUP BY  role.department_id`;
    const [rows, fields] = await connection.promise().query(sql); 
    console.table(rows);
        promptUser();
    } catch(err) {
        console.error(err);
    }
  };

    // Add a New Employee
const addEmployee = async () => {
    try {
        const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: "What is the employee's first name?",
            validate: addFirstName => {
            if (addFirstName) {
                return true;
            } else {
                console.log('Please enter a first name');
                return false;
            }
            }
        },
        {
            type: 'input',
            name: 'lastName',
            message: "What is the employee's last name?",
            validate: addLastName => {
            if (addLastName) {
                return true;
            } else {
                console.log('Please enter a last name');
                return false;
            }
            }
        }
        ]);
    
        const newEmployee = [answer.firstName, answer.lastName];
    
        const roleSql = `SELECT role.id, role.title FROM role`;
        const [data,] = await connection.promise().query(roleSql);
        const roles = data.map(({ id, title }) => ({ name: title, value: id }));
    
        const roleChoice = await inquirer.prompt([
        {
            type: 'list',
            name: 'role',
            message: "What is the employee's role?",
            choices: roles,
            default: roles[0].value
        }
        ]);
        const role = roleChoice.role;
        newEmployee.push(role);
    
        const managerSql =  `SELECT * FROM employee`;
        const [managerData,] = await connection.promise().query(managerSql);
        const managers = managerData.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
    
        const managerChoice = await inquirer.prompt([
        {
            type: 'list',
            name: 'manager',
            message: "Who is the employee's manager?",
            choices: managers
        }
        ]);
        const manager = managerChoice.manager;
        newEmployee.push(manager);
    
        const sql =   `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    VALUES (?, ?, ?, ?)`;
        await connection.promise().query(sql, newEmployee);
    
        console.log("Employee has been added!");
        viewAllEmployees();
    } catch (err) {
        console.error(err);
    }
    };

    // Add a New Role
const addRole = async () => {
    try {
    const sql = 'SELECT * FROM department'
    const [departments] = await connection.promise().query(sql); 
    const deptNamesArray = departments.map((department) => department.name);
    deptNamesArray.push('Create Department');
       
    const {departmentName} = await inquirer.prompt([
        {
            name: 'departmentName',
            type: 'list',
            message: 'Which department is this new role in?',
            choices: deptNamesArray
        }
        ]);
        
        if (departmentName === 'Create Department') {
            await addDepartment();
        } else {
            await addRoleResume(departmentName, departments);
        } 
            
    } catch(err) {
        throw(err);
    }
        };
  
        const addRoleResume = async (departmentName, departments) => {
            try {
                const {newRole, salary} = await inquirer.prompt([
              {
                name: 'newRole',
                type: 'input',
                message: 'What is the name of your new role?',
              },
              {
                name: 'salary',
                type: 'input',
                message: 'What is the salary of this new role?',             
              }
            ]);
           const {id: departmentId} = departments.find((department) => department.name === departmentName);
           const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
           const createNewRole = [newRole, salary, departmentId];

           await connection.promise().query(sql, createNewRole);
           console.log("New Role Created!");
           viewAllRoles();
        
          
        } catch(err) {
            throw err;
        }    
};              

    // Add a Department
 const addDepartment = async () => {
    try {
        const answer = await inquirer.prompt([
            {
                name: 'newDepartment',
                type: 'input',
                message: 'What is the name of your new Department?',
              
            }
        ]);

        const deptSql = `INSERT INTO department (name) VALUES (?)`;
        await connection.promise().query(deptSql, [answer.newDepartment]);
        console.log(`New department ${answer.newDepartment} added successfully!`);

        viewAllDepartments();
       
    } catch(err) {
        console.error(err);
    }
    promptUser();
    };
    
    // Update Employee Role
const updateEmployeeRole = async () => {
    try {
        let sql = `SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id"
                FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id`;
        const [employeeResponse] = await connection.promise().query(sql);
    
        let employeeNamesArray = [];
        employeeResponse.forEach((employee) => {
        employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);
        });
    
        let sql2 = `SELECT role.id, role.title FROM role`;
        const [roleResponse] = await connection.promise().query(sql2);
    
        let rolesArray = [];
        roleResponse.forEach((role) => {
        rolesArray.push(role.title);
        });
    
        const { chosenEmployee, chosenRole } = await inquirer.prompt([
        {
            name: 'chosenEmployee',
            type: 'list',
            message: 'Which employee has a new role?',
            choices: employeeNamesArray,
        },
        {
            name: 'chosenRole',
            type: 'list',
            message: 'What is their new role?',
            choices: rolesArray,
        },
        ]);
    
        let newTitleId, employeeId;
    
        roleResponse.forEach((role) => {
        if (chosenRole === role.title) {
            newTitleId = role.id;
        }
        });
    
        employeeResponse.forEach((employee) => {
        if (chosenEmployee === `${employee.first_name} ${employee.last_name}`) {
            employeeId = employee.id;
        }
        });
    
        let sql3 = `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
        await connection.promise().query(sql3, [newTitleId, employeeId]);

        viewAllEmployees();
        promptUser();
        
    } catch (error) {
        throw error;
    }
    };
    