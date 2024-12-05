import { PrismaClient } from "@prisma/client"  
import { Router } from "express"  
import bcrypt from 'bcrypt'  
import crypto from 'crypto'  
import transporter, { resetPasswordTemplate } from '../../../FRONTTRAB2_4SEM/src/lib/mail' 

const prisma = new PrismaClient()  
const router = Router()  

// Função de validação de senha  
function validaSenha(senha: string) {  
  const mensagens: string[] = []  

  if (senha.length < 8) {  
    mensagens.push("Senha deve possuir, no mínimo, 8 caracteres")  
  }  

  let pequenas = 0, grandes = 0, numeros = 0, simbolos = 0  

  for (const letra of senha) {  
    if ((/[a-z]/).test(letra)) pequenas++  
    else if ((/[A-Z]/).test(letra)) grandes++  
    else if ((/[0-9]/).test(letra)) numeros++  
    else simbolos++  
  }  

  if (pequenas === 0 || grandes === 0 || numeros === 0 || simbolos === 0) {  
    mensagens.push("Senha deve possuir letras minúsculas, maiúsculas, números e símbolos")  
  }  

  return mensagens  
}  

// Função de validação de telefone  
function validaTelefone(telefone: string) {  
  const telefoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/  
  return telefoneRegex.test(telefone)  
}  

// GET - Listar todos os clientes  
router.get("/", async (req, res) => {  
  try {  
    const clientes = await prisma.cliente.findMany({  
      select: {  
        id: true,  
        nome: true,  
        email: true,  
        telefone: true,  
        ativo: true,  
        createdAt: true,  
        updatedAt: true  
      }  
    })  
    res.status(200).json(clientes)  
  } catch (error) {  
    res.status(400).json({ erro: "Erro ao listar clientes" })  
  }  
})  

// POST - Criar novo cliente  
router.post("/", async (req, res) => {  
  const { nome, email, senha, telefone } = req.body  

  if (!nome || !email || !senha) {  
    return res.status(400).json({ erro: "Informe nome, email e senha" })  
  }  

  const erros = validaSenha(senha)  
  if (erros.length > 0) {  
    return res.status(400).json({ erro: erros.join("; ") })  
  }  

  if (telefone && !validaTelefone(telefone)) {  
    return res.status(400).json({ erro: "Formato de telefone inválido. Use (99) 99999-9999" })  
  }  

  try {  
    const emailExiste = await prisma.cliente.findUnique({  
      where: { email }  
    })  

    if (emailExiste) {  
      return res.status(400).json({ erro: "Email já cadastrado" })  
    }  

    const salt = bcrypt.genSaltSync(12)  
    const hash = bcrypt.hashSync(senha, salt)  

    const cliente = await prisma.cliente.create({  
      data: {  
        nome,  
        email,  
        senha: hash,  
        telefone,  
        ativo: true  
      },  
      select: {  
        id: true,  
        nome: true,  
        email: true,  
        telefone: true,  
        ativo: true,  
        createdAt: true,  
        updatedAt: true  
      }  
    })  

    res.status(201).json(cliente)  
  } catch (error) {  
    res.status(400).json({ erro: "Erro ao cadastrar cliente" })  
  }  
})  

// POST - Login  
router.post("/login", async (req, res) => {  
  const { email, senha } = req.body  
  const mensagemPadrao = "Email ou senha incorretos"  

  if (!email || !senha) {  
    return res.status(400).json({ erro: mensagemPadrao })  
  }  

  try {  
    const cliente = await prisma.cliente.findUnique({  
      where: { email }  
    })  

    if (!cliente || !cliente.ativo) {  
      return res.status(400).json({ erro: mensagemPadrao })  
    }  

    if (bcrypt.compareSync(senha, cliente.senha)) {  
      return res.status(200).json({  
        id: cliente.id,  
        nome: cliente.nome,  
        email: cliente.email,  
        telefone: cliente.telefone,  
        ativo: cliente.ativo  
      })  
    } else {  
      return res.status(400).json({ erro: mensagemPadrao })  
    }  
  } catch (error) {  
    res.status(400).json({ erro: mensagemPadrao })  
  }  
})  

// GET - Buscar cliente por ID  
router.get("/:id", async (req, res) => {  
  const { id } = req.params  

  try {  
    const cliente = await prisma.cliente.findUnique({  
      where: { id }  
    })  

    if (!cliente) {  
      return res.status(404).json({ erro: "Cliente não encontrado" })  
    }  

    res.status(200).json({  
      id: cliente.id,  
      nome: cliente.nome,  
      email: cliente.email,  
      telefone: cliente.telefone,  
      ativo: cliente.ativo,  
      createdAt: cliente.createdAt,  
      updatedAt: cliente.updatedAt  
    })  
  } catch (error) {  
    res.status(400).json({ erro: "Erro ao buscar cliente" })  
  }  
})  

// PATCH - Atualizar cliente  
router.patch("/:id", async (req, res) => {  
  const { id } = req.params  
  const { nome, email, telefone, senha, ativo } = req.body  

  try {  
    const clienteExiste = await prisma.cliente.findUnique({  
      where: { id }  
    })  

    if (!clienteExiste) {  
      return res.status(404).json({ erro: "Cliente não encontrado" })  
    }  

    const dadosAtualizacao: any = {}  

    if (nome !== undefined) {  
      if (nome.trim() === '') {  
        return res.status(400).json({ erro: "Nome não pode ficar em branco" })  
      }  
      dadosAtualizacao.nome = nome  
    }  

    if (email !== undefined) {  
      if (email.trim() === '') {  
        return res.status(400).json({ erro: "Email não pode ficar em branco" })  
      }  
      const emailExiste = await prisma.cliente.findFirst({  
        where: {  
          email,  
          NOT: { id }  
        }  
      })  
      if (emailExiste) {  
        return res.status(400).json({ erro: "Email já está em uso" })  
      }  
      dadosAtualizacao.email = email  
    }  

    if (telefone !== undefined) {  
      if (telefone.trim() !== '' && !validaTelefone(telefone)) {  
        return res.status(400).json({ erro: "Formato de telefone inválido. Use (99) 99999-9999" })  
      }  
      dadosAtualizacao.telefone = telefone  
    }  

    if (senha !== undefined) {  
      const erros = validaSenha(senha)  
      if (erros.length > 0) {  
        return res.status(400).json({ erro: erros.join("; ") })  
      }  
      const salt = bcrypt.genSaltSync(12)  
      dadosAtualizacao.senha = bcrypt.hashSync(senha, salt)  
    }  

    if (ativo !== undefined) {  
      dadosAtualizacao.ativo = ativo  
    }  

    if (Object.keys(dadosAtualizacao).length === 0) {  
      return res.status(400).json({ erro: "Nenhum dado fornecido para atualização" })  
    }  

    const clienteAtualizado = await prisma.cliente.update({  
      where: { id },  
      data: dadosAtualizacao,  
      select: {  
        id: true,  
        nome: true,  
        email: true,  
        telefone: true,  
        ativo: true,  
        createdAt: true,  
        updatedAt: true  
      }  
    })  

    res.status(200).json(clienteAtualizado)  
  } catch (error) {  
    console.error("Erro ao atualizar cliente:", error)  
    res.status(400).json({  
      erro: "Erro ao atualizar dados do cliente",  
      detalhes: process.env.NODE_ENV === 'development' ? error : undefined  
    })  
  }  
})  
// Rota para solicitar reset de senha  
router.post("/forgot-password", async (req, res) => {  
  const { email } = req.body  

  if (!email) {  
    return res.status(400).json({ erro: "Email é obrigatório" })  
  }  

  try {  
    const cliente = await prisma.cliente.findUnique({  
      where: { email }  
    })  

    if (!cliente || !cliente.ativo) {  
      // Por segurança, não informamos se o email existe ou não  
      return res.status(200).json({   
        mensagem: "Se um cadastro for encontrado com este email, você receberá as instruções para redefinição de senha."  
      })  
    }  

    // Gera token aleatório  
    const resetToken = crypto.randomBytes(32).toString('hex')  
    const resetTokenExpiresAt = new Date(Date.now() + 3600000) // 1 hora  

    // Salva token no banco  
    await prisma.cliente.update({  
      where: { id: cliente.id },  
      data: {  
        resetToken,  
        resetTokenExpiresAt  
      }  
    })  

    // Gera link de reset  
    const resetLink = `${process.env.FRONTEND_URL}/altsenha?token=${resetToken}` 

    // Prepara e envia email  
    const html = resetPasswordTemplate({  
      nome: cliente.nome,  
      resetLink  
    })  

    await transporter.sendMail({  
      from: `"Nome da Empresa" <${process.env.EMAIL_FROM}>`,  
      to: cliente.email,  
      subject: "Redefinição de Senha",  
      html  
    })  

    res.status(200).json({   
      mensagem: "Se um cadastro for encontrado com este email, você receberá as instruções para redefinição de senha."  
    })  

  } catch (error) {  
    console.error("Erro ao processar solicitação de reset de senha:", error)  
    res.status(400).json({   
      erro: "Erro ao processar solicitação. Tente novamente mais tarde."   
    })  
  }  
})  

// Rota para resetar a senha  
router.post("/reset-password", async (req, res) => {  
  const { token, novaSenha } = req.body  

  if (!token || !novaSenha) {  
    return res.status(400).json({ erro: "Token e nova senha são obrigatórios" })  
  }  

  try {  
    // Busca cliente com token válido  
    const cliente = await prisma.cliente.findFirst({  
      where: {  
        resetToken: token,  
        resetTokenExpiresAt: {  
          gt: new Date() // token não expirado  
        }  
      }  
    })  

    if (!cliente) {  
      return res.status(400).json({   
        erro: "Link de redefinição de senha inválido ou expirado"   
      })  
    }  

    // Valida nova senha  
    const erros = validaSenha(novaSenha)  
    if (erros.length > 0) {  
      return res.status(400).json({ erro: erros.join("; ") })  
    }  

    // Atualiza senha e limpa tokens  
    const salt = bcrypt.genSaltSync(12)  
    const hash = bcrypt.hashSync(novaSenha, salt)  

    await prisma.cliente.update({  
      where: { id: cliente.id },  
      data: {  
        senha: hash,  
        resetToken: null,  
        resetTokenExpiresAt: null  
      }  
    })  

    res.status(200).json({   
      mensagem: "Senha atualizada com sucesso"   
    })  

  } catch (error) {  
    console.error("Erro ao resetar senha:", error)  
    res.status(400).json({   
      erro: "Erro ao resetar senha. Tente novamente mais tarde."   
    })  
  }
})  

export default router