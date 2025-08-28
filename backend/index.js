const express = require('express')
const app = express()

// conffiguraciones
app.set('port', 3000)

// rutas
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente')
})

app.listen(app.get('port'), () => {
    console.log(`Servidor correindo en http://localhost:${app.get('port')}`)
})

