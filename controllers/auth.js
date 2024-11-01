const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
exports.register = async (req,res) => {
    try {
        const { email, password, name, lastname, tel } = req.body
        // เช็ค email
        if(!email) {
            return res.status(400).json({ message: "Email is required!" })
        }
        // เช็ค password
        if(!password) {
            return res.status(400).json({ message: "Password is required!" })
        }

        // เช็ค email ใน database มีหรือยัง?
        const user = await prisma.user.findFirst({
            where:{
                email: email
            }
        })
        if(user){
            return res.status(400).json({ message: "Email already exits" })
        }
        // HashPassword
        const hashPassword = await bcrypt.hash(password,10)
        
        // Register
        await prisma.user.create({
            data:{
                email: email,
                password: hashPassword,
                name:name,
                lastname:lastname,
                tel:tel
            }
        })
        res.send('Register Success')
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}


exports.login = async (req,res) => {
    try {
        const { email, password } = req.body

        // เช็ค email
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })
        if(!user || !user.enabled){
            return res.status(400).json({ message: "User Not Found or not Enabled" })
        }
        // เช็ค password
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({ message: "Password Invalid"})
        }
        // create payload
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        }
        
        // Generate token
        jwt.sign(payload, process.env.SECRET,{ expiresIn: 
            '1d' }, (err, token) => {
                if(err){
                    return res.status(500).json({ message: "Server Error" })
                }
                res.json({ payload, token })
            })
    } catch(err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.currentUser = async (req,res) => {
    try {
        const user= await prisma.user.findFirst({
            where: {
                email: req.user.email
            },
            select: {
                id:true,
                email:true,
                name:true,
                role: true,
                lastname: true,
                tel:true,
                

            }
        })
        res.json({ user })
    } catch(err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}
