import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { verificaToken } from "../middlewares/verificaToken"
const prisma = new PrismaClient()
const router = Router()

// Listar todos os computadores
router.get("/", async (req, res) => {
  try {
    const computadores = await prisma.computador.findMany({
      include: {
        marca: true
      }
    })
    res.status(200).json(computadores)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Criar um novo computador
router.post("/", async (req, res) => {
  const { modelo, preco, tipo, foto, especificacoes, marcaId } = req.body

  if (!modelo || !preco || !tipo || !foto || !especificacoes || !marcaId) {
    res.status(400).json({ "erro": "Informe modelo, preco, tipo, foto, especificacoes e marcaId" })
    return
  }

  try {
    const computador = await prisma.computador.create({
      data: { modelo, preco, tipo, foto, especificacoes, marcaId }
    })
    res.status(201).json(computador)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Deletar um computador
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const computador = await prisma.computador.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(computador)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Atualizar um computador
router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { modelo, preco, tipo, foto, especificacoes, marcaId } = req.body

  if (!modelo || !preco || !tipo || !foto || !especificacoes || !marcaId) {
    res.status(400).json({ "erro": "Informe modelo, preco, tipo, foto, especificacoes e marcaId" })
    return
  }

  try {
    const computador = await prisma.computador.update({
      where: { id: Number(id) },
      data: { modelo, preco, tipo, foto, especificacoes, marcaId }
    })
    res.status(200).json(computador)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Pesquisar computadores por termo (modelo ou nome da marca)
router.get("/pesquisa/:termo", async (req, res) => {
  const { termo } = req.params

  // tenta converter o termo em número
  const termoNumero = Number(termo)

  // se a conversão gerou um NaN (Not a Number)
  if (isNaN(termoNumero)) {
    try {
      const computadores = await prisma.computador.findMany({
        include: {
          marca: true
        },
        where: {
          OR: [
            { modelo: { contains: termo }},
            { marca: { nome: termo }}
          ]
        }
      })
      res.status(200).json(computadores)
    } catch (error) {
      res.status(400).json(error)
    }
  } else {
    try {
      const computadores = await prisma.computador.findMany({
        include: {
          marca: true
        },
        where: {
          OR: [
            { preco: { lte: termoNumero }},
          ]
        }
      })
      res.status(200).json(computadores)
    } catch (error) {
      res.status(400).json(error)
    }
  }
})

// Buscar computador por ID
router.get("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const computador = await prisma.computador.findUnique({
      where: { id: Number(id)},
      include: {
        marca: true
      }
    })
    res.status(200).json(computador)
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
