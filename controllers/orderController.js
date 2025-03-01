const AsyncAwaitError = require('../middleware/AsyncAwaitError');
const Order = require('../models/orderModel');
const Product = require("../models/productModels");
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

// Creating New Order
exports.newOrder = AsyncAwaitError(async (req, res, next) => {
    const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.ourUser._id
    })

    res.status(201).json({
        success: true,
        message: "New Order Created",
        order
    })
})

exports.newOrderCOD = AsyncAwaitError(async (req, res, next) => {
    console.log("cod req", req.body);

    try {


        const { shippingInfo, cartItems, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

        if (!cartItems || cartItems.length === 0) {

            return res.status(400).json({
                success: false,
                message: "No items in cart"
            });
        }

        // Format cart items properly
        const formattedCartItems = cartItems.map((item) => ({
            product: item.productId, // Use the product ID for reference
            name: item.name,
            price: item.price.toString(), // Ensuring price is in string format
            quantity: item.quantity.toString(), // Ensuring quantity is in string format
            image: item.images, // Assuming images is an array, picking the first one
            category: item.category,
        }));

        // Generate a unique payment ID (for COD) on the server side
        const paymentId = "COD_" + new Date().getTime(); // Unique ID for each COD order

        // Create a new order
        const order = await Order.create({
            shippingInfo,
            orderItems: formattedCartItems, // Storing the formatted items as orderItems
            paymentInfo: {
                method: "Cash on Delivery", // Indicating COD as the payment method
                status: "Pending", // COD orders are typically pending until paid at delivery
                id: paymentId, // Add the generated payment ID
                paidAt: Date.now(), // Default to current date as COD is usually paid upon delivery
                itemsPrice: itemsPrice,
                taxPrice: taxPrice,
                shippingPrice: shippingPrice,
                totalPrice: totalPrice,
                orderStatus: "Processing", // Default status for a new order
                createdAt: Date.now(),
            },
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            createdAt: Date.now(),
            user: req.ourUser._id, // Assuming user is stored in req.ourUser
        });

        // Send a success response
        res.status(201).json({
            success: true,
            message: "New COD Order Created",
            order,
        });
    } catch (error) {
        // Pass errors to the error-handling middleware
        next(error);
    }
});
exports.updateMultipleOrders = async (req, res) => {
    console.log("lkgkfkf",req.body);
    
    try {
        const { orderIds, status } = req.body;

       
        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid order IDs" });
        }
        if (!status) {
            return res.status(400).json({ success: false, message: "Status is required" });
        }

        console.log("🟡 Request Body:", req.body);

        
        const updatedOrders = await Promise.all(
            orderIds.map(async (id)=> {
                const order = await Order.findById(id);

                if (!order) {
                    return null; 
                }

                const updateData = { "paymentInfo.orderStatus": status };

               
                if (order.paymentInfo.orderStatus === "Delivered") {
                    updateData["paymentInfo.status"] = "Done";
                }

                return await Order.findByIdAndUpdate(
                    id,
                    { $set: updateData }, 
                    { new: true } 
                );
            })
        );

      

        return res.status(200).json({
            success: true,
            message: "Orders updated successfully",
            updatedOrders
        });

    } catch (error) {
        
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};
exports.getUserOrders = AsyncAwaitError(async (req, res, next) => {

    try {
        // Extract the userId from the authenticated user's data in req.ourUser
        const userId = req.ourUser._id; // ourUser is added by the AuthenticateTheUser middleware

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is missing",
            });
        }

        const orders = await Order.find({ user: userId });

        if (!orders || orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No orders found for this user",
            });
        }

        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
// Get Single Order Details

// exports.getSingleOrder = async (req, res, next) => {
//     try {
//         // Check if the provided ID is a valid ObjectId
//         if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid order ID"
//             });
//         }

//         // Find the order by its ID and populate the 'user' field with 'name' and 'email'
//         const order = await Order.findById(req.params.id)

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found with this ID"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             order
//         });
//     } catch (error) {
//         // Handle any errors that may occur during execution
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error MEE"
//         });
//     }
// };
exports.getSingleOrder = async (req, res, next) => {
    try {
       
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

      
        const order = await Order.findById(req.params.id).populate("user", "name email");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found with this ID"
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

    // Get Logged In User Order Details
    exports.loggedInUserOrder = AsyncAwaitError(async (req, res, next) => {
        const orders = await Order.find({ user: req.ourUser._id });

        res.status(200).json({
            success: true,
            orders
        })
    })

    // get all orders -- ADMIN
    // exports.getAllOrder = AsyncAwaitError(async (req, res, next) => {


    //     const orders = await Order.find();


    //     // for Getting Total Price Amount of All Orders
    //     let totalAmount = 0;
    //     orders.forEach((orderSum) => {
    //         totalAmount += orderSum.totalPrice;
    //     })
    //     res.status(200).json({
    //         success: true,
    //         totalAmount,
    //         orders
    //     })
    // })
    exports.getAllOrder = AsyncAwaitError(async (req, res) => {

        const orders = await Order.find()
            .populate('user', 'name')


        let totalAmount = 0;
        orders.forEach((orderSum) => {
            totalAmount += orderSum.totalPrice;
        });


        const ordersWithUserName = orders.map(order => {
            return {
                ...order.toObject(),
                userName: order.user.name,
            };
        });

        res.status(200).json({
            success: true,
            totalAmount,
            orders: ordersWithUserName,
        });
    });

//count total orders
exports.countTotalOrders = async (req, res) => {
    try {
      const totalOrders = await Order.countDocuments(); // Count total orders
  
      res.status(200).json({
        success: true,
        totalOrders,
      });
    } catch (error) {
      console.error("Error counting orders:", error.message);
      res.status(500).json({
        success: false,
        message: "Error counting orders",
        error: error.message,
      });
    }
  };

  //totalAmount Count
  exports.getTotalOrderAmount = async (req, res) => {
    try {
      // Aggregate total amount from all orders
      const totalAmountResult = await Order.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: { $toDouble: "$paymentInfo.totalPrice" } }
          }
        }
      ]);
  
      // Extract the total amount or set to 0 if no orders exist
      const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;
  
      res.status(200).json({
        success: true,
        totalAmount,
      });
    } catch (error) {
      console.error("Error calculating total order amount:", error.message);
      res.status(500).json({
        success: false,
        message: "Error calculating total order amount",
        error: error.message,
      });
    }
  };

    // Order Status Update --ADMIN
    exports.updateOrder = AsyncAwaitError(async (req, res, next) => {
        try {
            const order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found with this ID"
                });
            }

            if (order.orderStatus === "Delivered") {
                return res.status(400).json({
                    message: "The Order is Already Delivered"
                });
            }

            order.orderStatus = req.body.status;

            if (req.body.status === "Delivered") {
                order.deliveredAt = Date.now();
                order.orderItems.forEach(async (ord) => {
                    await updateStock(ord.product, ord.quantity);
                });
            }

            await order.save({ validateBeforeSave: false });

            res.status(200).json({
                success: true,
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    });

    async function updateStock(id, quantity) {
        const product = await Product.findById(id);

        product.Stock -= quantity;

        await product.save({ validateBeforeSave: false });
    }




    // Delete orders -- ADMIN
    exports.deleteOrder = AsyncAwaitError(async (req, res, next) => {
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404).json({
                success: false,
                message: "Order can't remove because not found with this ID"
            })
        }

        await order.remove();

        res.status(200).json({
            success: true,
            message: "Order Deleted Successfully by ADMIN",
            order
        })
    })