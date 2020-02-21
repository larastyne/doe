//configurando o servidor
const express = require('express')
const server = express()

//configurar o servidor para apresentar arquivos estáticos
server.use(express.static('public'))

//habilitar body do formulario
server.use(express.urlencoded({extended: true}))

//configurar a conexão com o banco de dados
const Pool = require('pg').Pool

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/doe"
const db = new Pool({ connectionString: DATABASE_URL })

//configurando a template engine
const  nunjucks = require("nunjucks")
nunjucks.configure("./", {
    express: server,
    noCache: true, //boolean aceita 2 valores, true ou false
})



//configurar a apresentação da página
server.get("/", function(req, res) {
    
    db.query("SELECT * FROM donors", function(err, result) {
        if (err) return res.send("Erro de banco de dados.")

        const donors = result.rows
        return res.render("index.html", {donors})
    })

    
})

server.post("/", function(req, res) {
    //pegar dados do formulario
    const name = req.body.name
    const email = req.body.email
    const blood = req.body.blood

    if (name == ""  || email == "" || blood == "") {
        return res.send("Todos os campos são obrigatórios.")
    }


    //coloco valores detro do banco de dados
    const query = `
    INSERT INTO donors ("name", "email", "blood") 
    VALUES ($1, $2, $3)`

    const values = [name, email, blood]
    
    db.query(query, values, function(err) {
        //fluxo de erro 
        if (err) return res.send("Erro no banco de dados.")

        //fluxo ideal
        return res.redirect("/")
    })

    

})

const PORT = process.env.PORT || 3000
// ligar o servidor e permitir o acesso na porta 3000
server.listen(PORT, function() {
    console.log(`iniciei o servidor na porta ${PORT}`)
})

