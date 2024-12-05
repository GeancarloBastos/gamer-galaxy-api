import express from 'express'
import cors from 'cors'
import 'dotenv/config' 

import marcasRoutes from './routes/marcas'
import computadoresRoutes from './routes/computadores' 
import fotosRoutes from './routes/fotos'
import clientesRoutes from './routes/clientes'
import propostasRoutes from './routes/propostas'
import adminRoutes from './routes/admins'
import orcamentoRoutes from './routes/orcamento'

const app = express()
const port = 3004

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use("/marcas", marcasRoutes)
app.use("/computadores", computadoresRoutes) 
app.use("/fotos", fotosRoutes)
app.use("/clientes", clientesRoutes)
app.use("/propostas", propostasRoutes)
app.use("/admins", adminRoutes)
app.use("/orcamentos", orcamentoRoutes)

app.get('/', (req, res) => {
  res.send('API: Sistema de Controle de Computadores') 
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})

app.use(cors({  
  origin: ['http://localhost:3004'],  
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  
  credentials: true  
}))