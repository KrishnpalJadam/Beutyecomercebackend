const express = require('express');
const { countTotalOrders,getTotalOrderAmount, getUserOrders,updateMultipleOrders,newOrder, newOrderCOD,getSingleOrder, loggedInUserOrder, getAllOrder, updateOrder, deleteOrder } = require('../controllers/orderController');
const router = express.Router();
const {AuthenticateTheUserss, AuthenticateTheUser, AuthorizedPerson } = require('../middleware/AuthenticateTheUser');

router.route("/order/new").post(AuthenticateTheUserss, newOrder);
router.route("/order/new/cod").post(AuthenticateTheUserss,newOrderCOD);
router.route("/order/:id").get(AuthenticateTheUserss, getSingleOrder); //yeh kam nhi kr rha h
router.route("/orders/me").get(AuthenticateTheUser, loggedInUserOrder);
router.route("/admin/orders").get(AuthenticateTheUserss, AuthorizedPerson("admin"), getAllOrder);

//count Total orders
router.route("/admin/countOrders").get(AuthenticateTheUserss, AuthorizedPerson("admin"), countTotalOrders);
// router.get("/count", countTotalOrders);
router.route("/admin/totalAmount").get(AuthenticateTheUserss, AuthorizedPerson("admin"), getTotalOrderAmount);
router.put("/admin/orders/update", AuthenticateTheUserss, AuthorizedPerson("admin"), updateMultipleOrders);
router.route("/admin/orders/:id").put(AuthenticateTheUserss, AuthorizedPerson("admin"), updateOrder).delete(AuthenticateTheUserss, AuthorizedPerson("admin"), deleteOrder);
router.get('/user/orders', AuthenticateTheUserss, getUserOrders);
module.exports = router; 