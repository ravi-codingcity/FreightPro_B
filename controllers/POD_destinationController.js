const POD_destination = require('../models/POD_destinations');
const { validationResult } = require('express-validator');

// Get all POD destinations with their shipping lines
const getAllDestinations = async (req, res) => {
  try {
    const destinations = await POD_destination
      .find({ isActive: true })
      .sort({ destinationName: 1 });

    res.status(200).json({
      success: true,
      data: destinations
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching destinations',
      error: error.message
    });
  }
};

// Get single POD destination by ID
const getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const destination = await POD_destination.findById(id);
    
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    res.status(200).json({
      success: true,
      data: destination
    });
  } catch (error) {
    console.error('Error fetching destination:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching destination',
      error: error.message
    });
  }
};

// Create new POD destination with multiple shipping lines
const createDestination = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { destinationName, shippingLines = [] } = req.body;

    // Validate shipping lines if provided
    if (shippingLines.length > 0) {
      const lineNames = shippingLines.map(line => line.lineName?.toLowerCase());
      const uniqueNames = new Set(lineNames);
      
      if (lineNames.length !== uniqueNames.size) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate shipping line names are not allowed'
        });
      }

      // Check for empty line names
      const hasEmptyNames = shippingLines.some(line => !line.lineName?.trim());
      if (hasEmptyNames) {
        return res.status(400).json({
          success: false,
          message: 'All shipping lines must have a valid name'
        });
      }
    }

    const destination = new POD_destination({
      destinationName,
      shippingLines: shippingLines.map(line => ({
        lineName: line.lineName.trim(),
        isActive: line.isActive !== undefined ? line.isActive : true
      }))
    });

    await destination.save();

    res.status(201).json({
      success: true,
      message: `Destination created successfully with ${shippingLines.length} shipping lines`,
      data: destination
    });
  } catch (error) {
    console.error('Error creating destination:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Destination with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating destination',
      error: error.message
    });
  }
};

// Update POD destination (can update name and/or shipping lines)
const updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { destinationName, shippingLines } = req.body;
    const updateData = {};

    // Update destination name if provided
    if (destinationName) {
      updateData.destinationName = destinationName;
    }

    // Update shipping lines if provided
    if (shippingLines) {
      // Validate shipping lines
      if (shippingLines.length > 0) {
        const lineNames = shippingLines.map(line => line.lineName?.toLowerCase());
        const uniqueNames = new Set(lineNames);
        
        if (lineNames.length !== uniqueNames.size) {
          return res.status(400).json({
            success: false,
            message: 'Duplicate shipping line names are not allowed'
          });
        }

        // Check for empty line names
        const hasEmptyNames = shippingLines.some(line => !line.lineName?.trim());
        if (hasEmptyNames) {
          return res.status(400).json({
            success: false,
            message: 'All shipping lines must have a valid name'
          });
        }
      }

      updateData.shippingLines = shippingLines.map(line => ({
        _id: line._id, // Keep existing ID if updating, will be auto-generated if new
        lineName: line.lineName.trim(),
        isActive: line.isActive !== undefined ? line.isActive : true
      }));
    }

    const destination = await POD_destination.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Destination updated successfully',
      data: destination
    });
  } catch (error) {
    console.error('Error updating destination:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Destination with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating destination',
      error: error.message
    });
  }
};

// Delete POD destination
const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const destination = await POD_destination.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Destination deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting destination:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting destination',
      error: error.message
    });
  }
};

// Add single shipping line to existing destination
const addShippingLine = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const destination = await POD_destination.findById(id);
    
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    await destination.addShippingLine(req.body);

    res.status(200).json({
      success: true,
      message: 'Shipping line added successfully',
      data: destination
    });
  } catch (error) {
    console.error('Error adding shipping line:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error adding shipping line'
    });
  }
};

// Add multiple shipping lines to existing destination
const addMultipleShippingLines = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippingLines } = req.body;

    if (!shippingLines || !Array.isArray(shippingLines) || shippingLines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'shippingLines array is required and cannot be empty'
      });
    }

    const destination = await POD_destination.findById(id);
    
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Validate shipping lines
    const lineNames = shippingLines.map(line => line.lineName?.toLowerCase());
    const uniqueNames = new Set(lineNames);
    
    if (lineNames.length !== uniqueNames.size) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate shipping line names are not allowed'
      });
    }

    // Check for empty line names
    const hasEmptyNames = shippingLines.some(line => !line.lineName?.trim());
    if (hasEmptyNames) {
      return res.status(400).json({
        success: false,
        message: 'All shipping lines must have a valid name'
      });
    }

    // Check for existing shipping lines
    const existingLineNames = destination.shippingLines.map(line => line.lineName.toLowerCase());
    const duplicateLines = shippingLines.filter(line => 
      existingLineNames.includes(line.lineName.toLowerCase())
    );

    if (duplicateLines.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Shipping lines already exist: ${duplicateLines.map(line => line.lineName).join(', ')}`
      });
    }

    // Add all shipping lines
    for (const line of shippingLines) {
      destination.shippingLines.push({
        lineName: line.lineName.trim(),
        isActive: line.isActive !== undefined ? line.isActive : true
      });
    }

    await destination.save();

    res.status(200).json({
      success: true,
      message: `${shippingLines.length} shipping lines added successfully`,
      data: destination
    });
  } catch (error) {
    console.error('Error adding multiple shipping lines:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding shipping lines',
      error: error.message
    });
  }
};

// Update shipping line
const updateShippingLine = async (req, res) => {
  try {
    const { id, shippingLineId } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const destination = await POD_destination.findById(id);
    
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    await destination.updateShippingLine(shippingLineId, req.body);

    res.status(200).json({
      success: true,
      message: 'Shipping line updated successfully',
      data: destination
    });
  } catch (error) {
    console.error('Error updating shipping line:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating shipping line'
    });
  }
};

// Delete shipping line
const deleteShippingLine = async (req, res) => {
  try {
    const { id, shippingLineId } = req.params;

    const destination = await POD_destination.findById(id);
    
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    await destination.removeShippingLine(shippingLineId);

    res.status(200).json({
      success: true,
      message: 'Shipping line deleted successfully',
      data: destination
    });
  } catch (error) {
    console.error('Error deleting shipping line:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting shipping line',
      error: error.message
    });
  }
};

module.exports = {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
  addShippingLine,
  addMultipleShippingLines,
  updateShippingLine,
  deleteShippingLine
};