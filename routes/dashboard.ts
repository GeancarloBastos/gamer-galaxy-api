import { PrismaClient } from "@prisma/client"
import { Router } from "express"

const prisma = new PrismaClient()
const router = Router()

router.get("/gerais", async (req, res) => {
  try {
    const clientes = await prisma.cliente.count()
    const computadores = await prisma.computador.count()
    const propostas = await prisma.proposta.count()
    res.status(200).json({ clientes, computadores, propostas })
  } catch (error) {
    res.status(400).json(error)
  }
})

router.get("/computadoresMarca", async (req, res) => {
  try {
    const computadores = await prisma.computador.groupBy({
      by: ['marcaId'],
      _count: {
        id: true, 
      }
    })

    // Para cada carro, inclui o nome da marca relacionada ao marcaId
    const computadoresMarca = await Promise.all(
      computadores.map(async (computador) => {
        const marca = await prisma.marca.findUnique({
          where: { id: computador.marcaId }
        })
        return {
          marca: marca?.nome, 
          num: computador._count.id
        }
      })
    )
    res.status(200).json(computadoresMarca)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.get("/computadoresTipo", async (_req, res) => {  
  try {  
    const result = await prisma.computador.groupBy({  
      by: ['tipo'],  
      _count: {  
        id: true  
      }  
    });  

    const data = result.map(item => ({  
      type: item.tipo,  
      count: item._count.id  
    }));  

    res.json(data);  
  } catch (error) {  
    res.status(500).json({ error: "Failed to fetch data" });  
  }  
});  

export default router
