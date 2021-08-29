const { Order } = require("../models/order");
const { OrderItem } = require("../models/orderItems");

const express = require("express");
const router = express.Router();

router.get(`/getOrderList`, async (req, res) => {
  const orderList = await Order.find().populate('user','name').sort({'dateOrdered':-1});

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  // res.send(orderList);
  res.json({success: true, orderList})
});


router.get(`/getOrderById/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user','name').populate({path:'orderItems',populate:'product'})
  
    if (!order) {
      res.status(500).json({ success: false });
    }
    res.json({success: true, order});
  });

router.post("/createOrder", async (req, res) => {
  const orderItemIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );
  const resolvedOrderItemIds = await orderItemIds;

  const totalPrices = await Promise.all(resolvedOrderItemIds.map(async (orderItemId)=>{
    const orderItem = await OrderItem.findById(orderItemId).populate('product')
    const totalPrice = orderItem.product.price* orderItem.quantity
    return totalPrice
  }))

  const totalPrice = totalPrices.reduce((a,b)=> a+b,0)

  let order = new Order({
    user: req.body.user,
    orderItems: resolvedOrderItemIds,
    phone: req.body.phone,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    zip: req.body.zip,
    city: req.body.city,
    status: req.body.status,   
    country: req.body.country,
    totalPrice: totalPrice
  });

  order = await order.save()

  if (!order) {
    return res.status(404).send("The order cannot be created");
  } else {
    // res.status(200).send(order);
    res.json({success: true, order})
  }
});

router.put('/updateStatus/:id', async (req, res)=>{
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            
            status: req.body.status
        },
        {new: true}
        )
        if (!order){
            return res.status(400).send('The status cannot be updated')
        } else {
            res.status(200).send(order)

        }
})

router.delete('/deleteOrder/:id', (req, res)=>{
    Order.findByIdAndRemove(req.params.id).then(async (order)=>{
        if(order){
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({
                success: true,
                message: 'The order is deleted'
            })
        } else{
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }
    })
    .catch((err)=>{
        return res.status(400).json({
            success: false,
            error: err
        })
    })
})

router.get('/getTotalSales', async (req, res)=>{
  const totalSales = await Order.aggregate([
    {$group:{_id:null, totalSales :{$sum: '$totalPrice'}}}
  ])

  if(!totalSales){
    return res.status(400).send('The order sales cannot be generated')
  }
  res.send({totalSale: totalSales.pop().totalSales})
})

router.get('/getOrders/count', async (req,res)=>{
  const orderCount = await Order.countDocuments((count)=>{
      count
  })
  if(!orderCount){
      res.status(500).json({success: false})
  } 
  res.send({
      count: orderCount 
  })
})

router.get(`/getUserOrder/:userId`, async (req, res) => {
  const userOrderList = await Order.find({user: req.params.userId}).populate({path:'orderItems',populate:{path:'product',populate:'category'}}).sort({'dateOrdered':-1});

  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
}); 

module.exports = router;
