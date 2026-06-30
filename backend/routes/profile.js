const express = require("express");
const { getUserProfile, getUserOrders} = require("../controllers/profileController");
const { getAllOrders,  updateOrderStatus,  updateShippingDate, updateDeliveryDate, getAllProducts, getAllUsers, getAllMessages, getAllCategories, getAllCoupons, getAllPayments, getAllRoles, getAllCompany } = require("../controllers/adminController");
const { checkRole } = require("../middlewares/roleMiddleware");
const crudController = require('../controllers/crudController');
const {  getAgentIdByUserId, getAllAgents,assignAgentToOrder,  getOrdersByAgentId, verifyOrderCode } = require("../controllers/agentController");

const router = express.Router();

// Get user profile
router.get('/', getUserProfile);

// Agent Routes

router.get("/all-agents", getAllAgents); // Fetch all agents
router.post("/orders/assign-agent", assignAgentToOrder); // Assign agent to order
router.get("/agent/:agentId", getOrdersByAgentId);

router.post("/agent/verifycode",verifyOrderCode);
// Get user orders
router.get('/orders-details', getUserOrders);

router.get("/admin/allorders", checkRole(1), getAllOrders);

router.post("/admin/update-order-status", checkRole(1), updateOrderStatus);

router.post("/admin/update-shipping-date", checkRole(1), updateShippingDate);

router.post("/admin/update-delivery-date", checkRole(1), updateDeliveryDate);

router.get("/admin/all-products", checkRole(1), getAllProducts);

router.get("/admin/all-users", checkRole(1), getAllUsers);

router.get("/admin/all-messages", checkRole(1), getAllMessages);

router.get("/admin/all-categories", checkRole(1), getAllCategories);

router.get("/admin/all-coupons", checkRole(1), getAllCoupons);

router.get("/admin/all-payments", checkRole(1), getAllPayments);

router.get("/admin/all-roles", checkRole(1), getAllRoles);

router.get("/admin/all-companies", checkRole(1), getAllCompany);

router.get("/agentid/:userId", checkRole(1), getAgentIdByUserId);

router.post('/admin/crud/new/:table', crudController.create); // Create

router.get('/admin/crud/:table', crudController.readAll); // Read all

router.get('/admin/crud/:table/:id', crudController.readOne); // Read one by ID

router.put('/admin/crud/:table/:id', crudController.update); // Update

router.delete('/admin/crud/:table/:id', crudController.delete); // Delete

router.get("/admin/order-status/:status", checkRole(1), getAllOrders);

module.exports = router;
