const { query } = require("express");
const prisma = require("../config/prisma")

exports.create = async (req, res) => {
    try {
        const { title, description, price, quantity, concertId } = req.body;

        const ticket = await prisma.ticket.create({
            data: {
                title: title,
                description: description,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                concertId: parseInt(concertId),
            }
        });
        res.json(ticket);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
}

exports.list = async (req, res) => {
    try {
        const { id } = req.params; // ดึง id จากพารามิเตอร์
        const tickets = await prisma.ticket.findMany({
            where: {
                concertId: Number(id), // กรองตั๋วที่มี concertId ตรงกับ id
            },
            orderBy: { id: "desc" },
            include: {
                concert: true, // รวมข้อมูลคอนเสิร์ต
            }
        });
        res.send(tickets); // ส่งตั๋วที่ตรงตามเงื่อนไขกลับ
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
}

exports.read = async (req,res) => {
    try {
        const { id } = req.params
        const tickets = await prisma.ticket.findFirst({
            where: {
                id: Number(id)
            },
            include:{
                concert:true
            }
        })
        res.send(tickets)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.updateTicket = async (req,res) => {
    try {
        const { title, description, price, quantity, concertId } = req.body;
        // clear
        const ticket = await prisma.ticket.update({
            where:{
                id: Number(req.params.id)
            },
            data: {
                title: title,
                description: description,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                concertId: parseInt(concertId),
            }
        });

        res.json(ticket);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
}

exports.remove = async (req,res) => {
    try {
        const { id } = req.params
        await prisma.ticket.delete({
            where: {
                id: Number(id)
            }
        })
        res.send("Delete Success!")
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.listby = async (req,res) => {
    try {
        const { sort, order, limit } = req.body
        console.log(sort, order, limit)
        const tickets = await prisma.ticket.findMany({
            take: limit,
            orderBy: { [sort]:order },
            include:{ concert:true }
        })
        res.send(tickets)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}




exports.countTicketsSold = async (req, res) => {
    try {
        const ticketsSold = await prisma.ticket.aggregate({
            _sum: {
                sold: true,
            },
        });
        res.json({ sold: ticketsSold._sum.sold });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};
