var express = require("express");
var bodyParser = require("body-parser");
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();
var fs = require("fs");

var app = express();

app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());

var enderecoDoCSV = process.env.CSV;
var db = new sqlite3.Database(enderecoDoCSV, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
  });

app.use(function(req, res, next){
 res.setHeader("Access-Control-Allow-Origin", "*");
 res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
 res.setHeader("Access-Control-Allow-Headers", "content-type");
 res.setHeader("Content-Type", "application/json");
 res.setHeader("Access-Control-Allow-Credentials", true);
 next();
});

app.get('/rito_atual', (req, res) => {
    
    var sql = "SELECT * FROM rito WHERE id = (select valor from info where chave = \"linha_atual\")";
    db.get(sql, [], (err, row) => {
        if (err) {
          console.error(err.message);
          res.json({
            message: "ERROR!"
          })
        }
        res.json(row);
    })
});

app.post('/proximo', (req, res) => {
    // Primeiro, a senha tem que estar correta
    var senha = req.body.senha;
    if(!senha) {
        return res.json({message: "ERRO!"});
    }
    var sqlSenha = "SELECT valor FROM info WHERE chave = \"senha\"";
    db.get(sqlSenha, [], (err, row) => {
        if(err) {
            console.error(err.message);
            return res.json({
                message: "ERROR!"
            })
        }
        if(row.valor != senha) {
            return res.json({
                message: "FALHA AUTENTICACAO"
            });
        }
        // Agora sim
        var sql1 = "SELECT valor FROM info WHERE chave = \"linha_atual\"";
        var sql2 = "UPDATE info SET valor = ? WHERE chave = \"linha_atual\"";
        db.get(sql1, [], (err, row) => {
            if (err) {
                console.error(err.message);
                return res.json({
                    message: "ERROR!"
                });
            }
            console.log(row);
            db.get(sql2, [(parseInt(row.valor) + 1).toString()], (err, row) => {
                if (err) {
                    console.error(err.message);
                    return res.json({
                        message: "ERROR!"
                    });
                }
                return res.json({
                    message: "OK!"
                })
                return;
            })
        })
    });
});
app.post('/anterior', (req, res) => {
    // Primeiro, a senha tem que estar correta
    var senha = req.body.senha;
    if(!senha) {
        return res.json({message: "ERRO!"});
    }
    var sqlSenha = "SELECT valor FROM info WHERE chave = \"senha\"";
    db.get(sqlSenha, [], (err, row) => {
        if(err) {
            console.error(err.message);
            return res.json({
                message: "ERROR!"
            })
        }
        if(row.valor != senha) {
            return res.json({
                message: "FALHA AUTENTICACAO"
            });
        }
        // Agora sim
        var sql1 = "SELECT valor FROM info WHERE chave = \"linha_atual\"";
        var sql2 = "UPDATE info SET valor = ? WHERE chave = \"linha_atual\"";
        db.get(sql1, [], (err, row) => {
            if (err) {
                console.error(err.message);
                return res.json({
                    message: "ERROR!"
                });
            }
            console.log(row);
            db.get(sql2, [(parseInt(row.valor) - 1).toString()], (err, row) => {
                if (err) {
                    console.error(err.message);
                    return res.json({
                        message: "ERROR!"
                    });
                }
                return res.json({
                    message: "OK!"
                })
                return;
            })
        })
    });
});

var server = app.listen(9090, function(){ console.log("Servidor Web rodando na porta 9090") });

process.on('SIGINT', () => {
    db.close();
    server.close();
});