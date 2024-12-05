import { PrismaClient } from "@prisma/client";
import { Router } from "express";

// const prisma = new PrismaClient();
// const prisma = new PrismaClient({
//   log: ["query", "info", "warn", "error"],
// });

import { prisma } from "../prisma";
import { verificaToken } from "../middlewares/verificaToken";

const router = Router();

router.get("/status/:id", async (req, res) => {
  const { id } = req.params;
  
  try {

    const orcamento = await prisma.orcamento.findUnique({
      where: { id: Number(id) },
      select: { status: true }
    });

    if (!orcamento) {
      return res.status(404).json({ error: "Orçamento não encontrado" });
    }

    let novoStatus:string

    
    if (orcamento.status === "PENDENTE") {
      novoStatus = "RESPONDIDO";
    } else {
      novoStatus = "PENDENTE";
    }

    const orcamentos = await prisma.orcamento.update({
      where: {
        id: Number(id),
      },
      data: {
        status: novoStatus
      }
    });
    res.status(200).json(orcamentos);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
