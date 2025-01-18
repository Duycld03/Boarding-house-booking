import { param } from "express-validator";
import CartItem from "../models/cartItemModel.js";
import Category from "../models/categoryModel.js";
import Order from "../models/orderModel.js";
import OrderItem from "../models/orderItemModel.js";
import Product from "../models/productModel.js";
import ProductVariant from "../models/productVariantModel.js";
import Promotion from "../models/promotionModel.js";
import FavoriteItem from "../models/favoriteItemModel.js";
import User from "../models/userModel.js";
import Color from "../models/colorModel.js";
import Size from "../models/sizeModel.js";

const checkProductId = [
  param("productId").custom(async (productId) => {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Invalid product id");
  }),
];

const checkCategoryId = [
  param("categoryId").custom(async (categoryId) => {
    const category = await Category.findById(categoryId);
    if (!category) throw new Error("Invalid category id");
  }),
];

const checkOrderId = [
  param("orderId").custom(async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Invalid order id");
  }),
];

const checkOrderItemId = [
  param("orderItemId").custom(async (orderItemId) => {
    const orderItem = await OrderItem.findById(orderItemId);
    if (!orderItem) throw new Error("Invalid order item id");
  }),
];

const checkCartItemId = [
  param("cartItemId").custom(async (cartItemId) => {
    const cartItem = await CartItem.findById(cartItemId);
    if (!cartItem) throw new Error("Invalid cart item id");
  }),
];

const checkFavoriteItemId = [
  param("favoriteItemId").custom(async (favoriteItemId) => {
    const favoriteItem = await FavoriteItem.findById(favoriteItemId);
    if (!favoriteItem) throw new Error("Invalid favorite item id");
  }),
];

const checkProductVariantId = [
  param("productVariantId").custom(async (productVariantId) => {
    const productVariant = await ProductVariant.findById(productVariantId);
    if (!productVariant) throw new Error("Invalid product variant id");
  }),
];

const checkPromotionId = [
  param("promotionId").custom(async (promotionId) => {
    const promotion = await Promotion.findById(promotionId);
    if (!promotion) throw new Error("Invalid promotion id");
  }),
];

const checkProductReviewId = [
  param("reviewId").custom(async (reviewId) => {
    const review = await ProductReview.findById(reviewId);
    if (!review) throw new Error("Invalid review id");
  }),
];

const checkCustomerId = [
  param("customerId").custom(async (customerId) => {
    const customer = await User.findOne({ _id: customerId, role: "customer" });
    if (!customer) throw new Error("Invalid customer id");
  }),
];

const checkStaffId = [
  param("staffId").custom(async (staffId) => {
    const staff = await User.findOne({ _id: staffId, role: "staff" });
    if (!staff) throw new Error("Invalid staff id");
  }),
];

const checkAdminId = [
  param("adminId").custom(async (adminId) => {
    const admin = await User.findOne({ _id: adminId, role: "admin" });
    if (!admin) throw new Error("Invalid admin id");
  }),
];

const checkColorId = [
  param("colorId").custom(async (colorId) => {
    const color = await Color.findById(colorId);
    if (!color) throw new Error("Invalid color id");
  }),
];

const checkSizeId = [
  param("sizeId").custom(async (sizeId) => {
    const size = await Size.findById(sizeId);
    if (!size) throw new Error("Invalid size id");
  }),
];

export {
  checkProductId,
  checkCategoryId,
  checkOrderId,
  checkOrderItemId,
  checkCartItemId,
  checkFavoriteItemId,
  checkProductVariantId,
  checkPromotionId,
  checkProductReviewId,
  checkCustomerId,
  checkStaffId,
  checkAdminId,
  checkColorId,
  checkSizeId,
};
