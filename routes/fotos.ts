import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import multer from 'multer'

const upload = multer({ storage: multer.memoryStorage() })

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
})

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query)
  console.log('Params: ' + e.params)
  console.log('Duration: ' + e.duration + 'ms')
})

const router = Router()

// Listar fotos associadas a um computador específico
router.get("/:computadorId", async (req, res) => {
  const { computadorId } = req.params

  try {
    const fotos = await prisma.foto.findMany({
      where: { computadorId: Number(computadorId) }
    })
    res.status(200).json(fotos)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Criar uma nova foto associada a um computador
router.post("/", upload.single('codigoFoto'), async (req, res) => {
  const { descricao, computadorId } = req.body
  const codigo = req.file?.buffer.toString("base64")

  if (!descricao || !computadorId || !codigo) {
    res.status(400).json({ "erro": "Informe descricao, computadorId e codigoFoto" })
    return
  }

  try {
    const foto = await prisma.foto.create({
      data: {
        descricao, computadorId: Number(computadorId),
        codigoFoto: codigo as string
      }
    })
    res.status(201).json(foto)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Deletar uma foto pelo ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const foto = await prisma.foto.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(foto)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Atualizar uma foto pelo ID
router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { descricao } = req.body

  if (!descricao) {
    res.status(400).json({ "erro": "Informe a descrição da foto" })
    return
  }

  try {
    const foto = await prisma.foto.update({
      where: { id: Number(id) },
      data: { descricao }
    })
    res.status(200).json(foto)
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
