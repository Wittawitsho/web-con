const prisma = require("../config/prisma")
const cloudinary = require('cloudinary').v2;
exports.listUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                enabled: true,
                address: true
            }
        })
        res.json(users)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server Error' })
    }
}
// Example backend API in Express.js
// exports.readUser = async (req, res) => {
//     try {
//         const { id } = req.params; // Ensure `id` is passed as a route parameter
//         if (!id) {
//             return res.status(400).json({ message: "User ID is required" });
//         }

//         const user = await prisma.user.findUnique({
//             where: {
//                 id: parseInt(id)  // Ensure `id` is an integer
//             }
//         });

//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         res.status(200).json(user);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Server Error" });
//     }
// };

exports.changeStatus = async (req, res) => {
    try {
        const { id, enabled } = req.body
        console.log(id, enabled)
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { enabled: enabled }
        })
        res.send('Update Status Success')
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server Error' })
    }
}

exports.changeRole = async (req, res) => {
    try {
        const { id, role } = req.body
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { role: role }
        })
        res.send('Update Role Success')
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server Error' })
    }
}

exports.userCart = async (req, res) => {
    try {
      //code
      const { cart } = req.body;
      console.log(cart);
      console.log(req.user.id);
  
      const user = await prisma.user.findFirst({
        where: { id: Number(req.user.id) },
      });
      // console.log(user)

      
      for (const item of cart) {
        // console.log(item)
        const ticket = await prisma.ticket.findUnique({
          where: { id: item.id },
          select: { quantity: true, title: true },
        });
        // console.log(item)
        // console.log(product)
        if (!ticket || item.count > ticket.quantity) {
          return res.status(400).json({
            ok: false,
            message: `ขออภัย. สินค้า ${ticket?.title || "product"} หมด`,
          });
        }
      }
    
   
      // Deleted old Cart item
      await prisma.ticketOnCart.deleteMany({
        where: {
          cart: {
            orderedById: user.id,
          },
        },
      });
      // Deeted old Cart
      await prisma.cart.deleteMany({
        where: { orderedById: user.id },
      });
  
      // เตรียมสินค้า
      let products = cart.map((item) => ({
        ticketId: item.id,
        count: item.count,
        price: item.price,
      }));
  
      // หาผลรวม
      let cartTotal = products.reduce(
        (sum, item) => sum + item.price * item.count,
        0
      );
  
      // New cart
      const newCart = await prisma.cart.create({
        data: {
          tickets: {
            create: products,
          },
          cartTotal: cartTotal,
          orderedById: user.id,
        },
      });
      console.log(newCart);
      res.send("Add Cart Ok");
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server Error" });
    }
  };

  exports.getUserCart = async (req, res) => {
    try {
      //code
      // req.user.id
      const cart = await prisma.cart.findFirst({
        where: {
          orderedById: Number(req.user.id),
        },
        include: {
          tickets: {
            include: {
              ticket: true,
            },
          },
        },
      });

      console.log(cart);
      res.json({
        tickets: cart.tickets,
        cartTotal: cart.cartTotal,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server Error" });
    }
  };

exports.emptyCart = async (req, res) => {
    try {
        res.send('Hello emptyCart')
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server Error' })
    }
}

exports.saveAddress = async (req, res) => {
    try {
        const { address } = req.body
        console.log(address)
        const addressUser = await prisma.user.update({
            where: {
                id: Number(req.user.id)
            },
            data: {
                address: address
            }
        })
        res.json({ ok: true, message: 'Address update sucess' })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server Error' })
    }
}

exports.saveOrder = async (req, res) => {
  try {
    //code
    // Step 0 Check Stripe
    // console.log(req.body)
    // return res.send('hello Jukkru!!!')
    // stripePaymentId String
    // amount          Int
    // status          String
    // currentcy       String
    const { id, amount, status, currency } = req.body.paymentIntent;

    // Step 1 Get User Cart
    const userCart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id),
      },
      include: { tickets: true },
    });

    // Check Cart empty
    if (!userCart || userCart.tickets.length === 0) {
      return res.status(400).json({ ok: false, message: "Cart is Empty" });
    }
    
    const amountTHB = Number(amount) / 100;
    // Create a new Order
    const order = await prisma.order.create({
      data: {
        tickets: {
          create: userCart.tickets.map((item) => ({
            ticketId: item.ticketId,
            count: item.count,
            price: item.price,
          })),
        },
        orderedBy: {
          connect: { id: req.user.id },
        },
        cartTotal: userCart.cartTotal,
        stripePaymentId: id,
        amount: amountTHB,
        status: status,
        currency: currency,
      },
    });
    // stripePaymentId String
    // amount          Int
    // status          String
    // currentcy       String

    // Update Product
    const update = userCart.tickets.map((item) => ({
      where: { id: item.ticketId },
      data: {
        quantity: { decrement: item.count },
        sold: { increment: item.count },
      },
    }));
    console.log(update);

    await Promise.all(update.map((updated) => prisma.ticket.update(updated)));

    await prisma.cart.deleteMany({
      where: { orderedById: Number(req.user.id) },
    });
    res.json({ ok: true, order });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};


/* exports.getOrder = async (req, res) => {
  try {
    //code
    const orders = await prisma.order.findMany({
      where: { orderedById: Number(req.user.id) },
      include: {
        tickets: {
          include: {
            ticket: true,
          },
        },
      },
    });
    if (orders.length === 0) {
      return res.status(400).json({ ok: false, message: "No orders" });
    }

    res.json({ ok: true, orders });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
}; */

exports.getOrder = async (req, res) => {
  try {
    //code
    const { id } = req.params;
    const orders = await prisma.order.findFirst({
      where: { id: Number(id) },
      include: {
        tickets: {
          include: {
            ticket: {
              include: {
                concert: true,
              },
            },
          },
        },
      },
    });
    if (orders.length === 0) {
      return res.status(400).json({ ok: false, message: "No orders" });
    }

    res.json({ ok: true, orders });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.getGroupOrder = async (req, res) => {
  try {
    // Fetch orders by the current user, including tickets
    const orders = await prisma.order.findMany({
      where: { orderedById: Number(req.user.id) },
      include: {
        tickets: {
          include: {
            ticket: {
              include: {
                concert: {
                  include:{
                    images:true
                  }
                }  // Include concert details for each ticket
              },
            },
          },
        },
      },
    });

    if (orders.length === 0) {
      return res.status(400).json({ ok: false, message: "No orders" });
    }

    // Map through orders to calculate total tickets for each order
    const groupedOrders = orders.map(order => {
      const totalTickets = order.tickets.length;
      return { ...order, totalTickets };
    });

    res.json({ ok: true, orders: groupedOrders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUND_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.createProfile = async(req,res)=>{
  try{
      const result = await cloudinary.uploader.upload(req.body.image,{
          public_id: `ShoPro-${Date.now()}`,
          resource_type:'auto',
          folder:'Profile'
      })
      res.send(result)
  }catch(err){
      console.log(err)
      res.status(500).json({massage: "Server Error"})
  }
};

exports.inputProfile = async (req, res) => {
  try {
      const { id } = req.params; // ดึง concertId จากพารามิเตอร์

      // ดึงรูปทั้งหมดที่มี concertId ตรงกับ id ในพารามิเตอร์
      const profile = await prisma.imageProfile.findMany({
          where: {
            userId: Number(id)
          },
          select: {
              url: true // เลือกแค่คอลัมน์ url
          }
      });

      if (profile.length === 0) {
          return res.status(404).json({ message: "No profile found for this concert." });
      }

      res.send(profile); // ส่งข้อมูล URL กลับ
  } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server Error" });
  }
};

exports.removeProfile = async(req,res)=>{
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