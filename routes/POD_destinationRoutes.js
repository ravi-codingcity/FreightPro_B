const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
  addShippingLine,
  addMultipleShippingLines,
  updateShippingLine,
  deleteShippingLine
} = require('../controllers/POD_destinationController');

// Import middleware
const authMiddleware = require('../middleware/authMiddleware');

// Validation rules for destination (with optional shipping lines)
const destinationValidation = [
  body('destinationName')
    .notEmpty()
    .withMessage('POD destination name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Destination name must be between 2 and 100 characters')
    .trim(),
  body('shippingLines')
    .optional()
    .isArray()
    .withMessage('Shipping lines must be an array'),
  body('shippingLines.*.lineName')
    .if(body('shippingLines').exists())
    .notEmpty()
    .withMessage('Shipping line name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Shipping line name must be between 2 and 100 characters')
    .trim(),
  body('shippingLines.*.isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Validation rules for destination updates (all fields optional)
const destinationUpdateValidation = [
  body('destinationName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Destination name must be between 2 and 100 characters')
    .trim(),
  body('shippingLines')
    .optional()
    .isArray()
    .withMessage('Shipping lines must be an array'),
  body('shippingLines.*.lineName')
    .if(body('shippingLines').exists())
    .notEmpty()
    .withMessage('Shipping line name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Shipping line name must be between 2 and 100 characters')
    .trim(),
  body('shippingLines.*.isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Validation rules for multiple shipping lines
const multipleShippingLinesValidation = [
  body('shippingLines')
    .isArray({ min: 1 })
    .withMessage('shippingLines must be a non-empty array'),
  body('shippingLines.*.lineName')
    .notEmpty()
    .withMessage('Shipping line name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Shipping line name must be between 2 and 100 characters')
    .trim(),
  body('shippingLines.*.isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Validation rules for shipping line
const shippingLineValidation = [
  body('lineName')
    .notEmpty()
    .withMessage('Shipping line name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Shipping line name must be between 2 and 100 characters')
    .trim(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Parameter validation
const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid destination ID format')
];

const shippingLineIdValidation = [
  param('shippingLineId')
    .isMongoId()
    .withMessage('Invalid shipping line ID format')
];

// ========== POD DESTINATION ROUTES ==========

// GET /api/destinations - Get all destinations
router.get('/', authMiddleware, getAllDestinations);

// GET /api/destinations/:id - Get single destination by ID
router.get('/:id', authMiddleware, idValidation, getDestinationById);

// POST /api/destinations - Create new destination (with optional shipping lines)
router.post('/', authMiddleware, destinationValidation, createDestination);

// PUT /api/destinations/:id - Update destination (can update name and/or shipping lines)
router.put('/:id', authMiddleware, idValidation, destinationUpdateValidation, updateDestination);

// DELETE /api/destinations/:id - Delete destination
router.delete('/:id', authMiddleware, idValidation, deleteDestination);

// ========== SHIPPING LINES ROUTES ==========

// POST /api/destinations/:id/shipping-lines - Add single shipping line to destination
router.post('/:id/shipping-lines', authMiddleware, idValidation, shippingLineValidation, addShippingLine);

// POST /api/destinations/:id/shipping-lines/bulk - Add multiple shipping lines to destination
router.post('/:id/shipping-lines/bulk', authMiddleware, idValidation, multipleShippingLinesValidation, addMultipleShippingLines);

// PUT /api/destinations/:id/shipping-lines/:shippingLineId - Update shipping line
router.put('/:id/shipping-lines/:shippingLineId', authMiddleware, idValidation, shippingLineIdValidation, shippingLineValidation, updateShippingLine);

// DELETE /api/destinations/:id/shipping-lines/:shippingLineId - Delete shipping line
router.delete('/:id/shipping-lines/:shippingLineId', authMiddleware, idValidation, shippingLineIdValidation, deleteShippingLine);

module.exports = router;