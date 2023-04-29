const express = require('express');
const mysql = require('mysql2');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({extended: false}));
const db = mysql.createConnection(
    {
    host: 'localhost',
    user: DB_NAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    },
);