const prisma = require("../config/prisma")
const cloudinary = require('cloudinary').v2;
exports.create = async (req, res) => {
    try {
        const { name, date, time, location, priceStart, images } = req.body;

        // สร้างข้อมูล concert และรูปภาพ
        const concert = await prisma.concert.create({
            data: {
                name: name,
                date: new Date(date),
                time: time,
                location: location,
                priceStart: priceStart,
                images: {
                    create: images.map((item) => ({
                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url
                    }))
                }
            }
        });

        // ส่งข้อมูล concert ที่สร้างเสร็จแล้วกลับไปยังฝั่ง Frontend
        res.send(concert);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.listAll = async(req,res)=>{
    try{
        // code
        const concert = await prisma.concert.findMany({
            include: {
                images: true
            }
        })
        res.send(concert)
    }catch(err){
        console.log(err)
        res.status(500).json({ message : "Server error" })
    }
}
exports.list = async (req, res) => {
    try {
        // code
        const { count } = req.params
        const concerts = await prisma.concert.findMany({
            take: parseInt(count),
            orderBy: { createdAt: "desc" },
            include: {
                images: true
            }
        })
        res.send(concerts)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
}

/* exports.remove = async(req,res)=>{
    try{
        // code
        const { id } = req.params
        const concert = await prisma.concert.delete({
            where:{ 
                id: Number(id)
             }
        })
        res.send(concert)
    }catch(err){
        console.log(err)
        res.status(500).json({ message : "Server error" })
    }
} */
exports.read = async (req,res) => {
    try {
        const { id } = req.params
        const concert = await prisma.concert.findFirst({
            where: {
                id: Number(id)
            }
        })
        res.send(concert)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}
exports.countConcerts = async (req, res) => {
    try {
        const concertCount = await prisma.concert.count(); // นับจำนวนคอนเสิร์ตทั้งหมด
        res.json({ count: concertCount });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};
// Controller สำหรับดึงคอนเสิร์ต 3 อันดับที่ขายได้เยอะที่สุด
exports.getTopSellingConcerts = async (req, res) => {
    try {
      // หาจำนวนบัตรที่ขายแล้วสำหรับแต่ละคอนเสิร์ต
      const topConcerts = await prisma.concert.findMany({
        include: {
          tickets: true,
          images:true // ดึงข้อมูลบัตรทั้งหมด
        },
      });
  
      // คำนวณจำนวนบัตรที่ขายสำหรับแต่ละคอนเสิร์ต
      const sortedConcerts = topConcerts
        .map((concert) => {
          const ticketsSold = concert.tickets.reduce((acc, ticket) => acc + ticket.sold, 0); // รวมจำนวนบัตรที่ขายได้
          return { ...concert, ticketsSold }; // เพิ่มฟิลด์ ticketsSold ในข้อมูลคอนเสิร์ต
        })
        .sort((a, b) => b.ticketsSold - a.ticketsSold) // จัดเรียงตามจำนวนบัตรที่ขาย
        .slice(0, 3); // เลือกแค่ 3 อันดับแรก
  
      res.json(sortedConcerts); // ส่งข้อมูลกลับ
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server Error" });
    }
  };
  
  exports.getSuggestConcert = async (req, res) => {
    try {
      // หาจำนวนบัตรที่ขายแล้วสำหรับแต่ละคอนเสิร์ต
      const suggestConcerts = await prisma.concert.findMany({
        include: {
          tickets: true,
          images:true // ดึงข้อมูลบัตรทั้งหมด
        },
      });
  
      // คำนวณจำนวนบัตรที่ขายสำหรับแต่ละคอนเสิร์ต
      const sortedConcerts = suggestConcerts
        .map((concert) => {
          const ticketsSold = concert.tickets.reduce((acc, ticket) => acc + ticket.sold, 0); // รวมจำนวนบัตรที่ขายได้
          return { ...concert, ticketsSold }; // เพิ่มฟิลด์ ticketsSold ในข้อมูลคอนเสิร์ต
        })
        .sort((a, b) => b.ticketsSold - a.ticketsSold) // จัดเรียงตามจำนวนบัตรที่ขาย
        .slice(0, 10); // เลือกแค่ 3 อันดับแรก
  
      res.json(sortedConcerts); // ส่งข้อมูลกลับ
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server Error" });
    }
  };
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUND_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


exports.createPoster = async(req,res)=>{
    try{
        const result = await cloudinary.uploader.upload(req.body.image,{
            public_id: `Sho-${Date.now()}`,
            resource_type:'auto',
            folder:'Concert'
        })
        res.send(result)
    }catch(err){
        console.log(err)
        res.status(500).json({massage: "Server Error"})
    }
};

exports.inputPoster = async (req, res) => {
    try {
        const { id } = req.params; // ดึง concertId จากพารามิเตอร์

        // ดึงรูปทั้งหมดที่มี concertId ตรงกับ id ในพารามิเตอร์
        const posters = await prisma.image.findMany({
            where: {
                concertId: Number(id)
            },
            select: {
                url: true // เลือกแค่คอลัมน์ url
            }
        });

        if (posters.length === 0) {
            return res.status(404).json({ message: "No posters found for this concert." });
        }

        res.send(posters); // ส่งข้อมูล URL กลับ
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};


exports.removePoster = async(req,res)=>{
    try{
        console.log(req.body.public_id)
        const { public_id } = req.body
        // console.log(public_id)
        cloudinary.uploader.destroy(public_id, (result)=>{
            res.send('Remove Image Success!')
        })
    }catch(err){
        console.log(err)
        res.status(500).json({massage: "Server Error"})
    }
}
const handleQuery = async(req, res, query) => {
    try{
        const concerts = await prisma.concert.findMany({
            where:{
                name:{
                    contains: query
                }
            },
            include:{
                images:true
            }
        })
        res.send(concerts)
    }catch{
        console.log(err)
        res.status(500).send("Search Error")
    }
}
exports.searchFilters = async (req,res) => {
    try {
        const { query } = req.body
        if(query){
            console.log('query -->',query)
            await handleQuery(req, res, query)
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.updateConcert = async (req, res) => {
    try {
        // code
        const { name, date, location, time, priceStart, images=[] } = req.body
        // console.log(title, description, price, quantity, images)

        await prisma.image.deleteMany({
            where: {
                concertId: Number(req.params.id)
            }
        })

        const concert = await prisma.concert.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                name: name,
                date: date, // as a string, if it's a VARCHAR in the database

                time: time,
                location: location,
                priceStart: priceStart,
                images: {
                    create: images.map((item) => ({
                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url
                    }))
                }
            }
        })
        res.send(concert)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
}

exports.remove = async (req, res) => {
    try {
        const { id } = req.params;

        // Step 1: Find the concert including its images
        const concert = await prisma.concert.findFirst({
            where: { id: Number(id) },
            include: { images: true }
        });
        if (!concert) {
            return res.status(400).json({ message: 'Concert not found!' });
        }

        // Step 2: Delete images from cloud storage
        const deletedImages = concert.images.map((image) =>
            new Promise((resolve, reject) => {
                cloudinary.uploader.destroy(image.public_id, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
            })
        );
        await Promise.all(deletedImages);

        // Step 3: Delete associated tickets
        await prisma.ticket.deleteMany({
            where: {
                concertId: Number(id)
            }
        });

        // Step 4: Delete the concert itself
        await prisma.concert.delete({
            where: {
                id: Number(id)
            }
        });

        res.send('Deleted Successfully');
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};
