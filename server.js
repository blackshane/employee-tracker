const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const config = dotenv.config();
const inquirer = require('inquirer');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({extended: false}));

const db = mysql.createConnection(
    {
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    },
);

// Include how to setup .env in README.

db.connect(function(error) {
    if(error) throw error;
    console.log(`Connected at port ${PORT}`); 
})