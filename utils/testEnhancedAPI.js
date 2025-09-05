// Test script for enhanced POD destinations API
// Run with: node utils/testEnhancedAPI.js

const mongoose = require('mongoose');
const POD_destination = require('../models/POD_destinations');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/destination_db');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Test creating destination with multiple shipping lines
async function testCreateWithShippingLines() {
  console.log('\n🧪 Testing: Create destination with multiple shipping lines');
  
  try {
    // Clean up any existing test data
    await POD_destination.deleteOne({ destinationName: 'Test Mumbai' });
    
    const destinationData = {
      destinationName: 'Test Mumbai',
      shippingLines: [
        { lineName: 'Maersk Line', isActive: true },
        { lineName: 'MSC', isActive: true },
        { lineName: 'CMA CGM', isActive: false },
        { lineName: 'Evergreen', isActive: true }
      ]
    };

    const destination = new POD_destination(destinationData);
    await destination.save();

    console.log('✅ Destination created successfully:');
    console.log(`   - Name: ${destination.destinationName}`);
    console.log(`   - Shipping Lines: ${destination.shippingLines.length}`);
    destination.shippingLines.forEach((line, index) => {
      console.log(`     ${index + 1}. ${line.lineName} (${line.isActive ? 'Active' : 'Inactive'})`);
    });

    return destination._id;
  } catch (error) {
    console.error('❌ Error creating destination:', error.message);
    return null;
  }
}

// Test adding multiple shipping lines to existing destination
async function testAddMultipleShippingLines(destinationId) {
  console.log('\n🧪 Testing: Add multiple shipping lines to existing destination');
  
  try {
    const destination = await POD_destination.findById(destinationId);
    if (!destination) {
      throw new Error('Destination not found');
    }

    console.log(`📍 Before: ${destination.shippingLines.length} shipping lines`);

    // Add new shipping lines
    const newShippingLines = [
      { lineName: 'Hapag-Lloyd', isActive: true },
      { lineName: 'Yang Ming', isActive: true },
      { lineName: 'ONE', isActive: false }
    ];

    // Check for duplicates
    const existingLineNames = destination.shippingLines.map(line => line.lineName.toLowerCase());
    const duplicateLines = newShippingLines.filter(line => 
      existingLineNames.includes(line.lineName.toLowerCase())
    );

    if (duplicateLines.length > 0) {
      throw new Error(`Duplicate shipping lines: ${duplicateLines.map(line => line.lineName).join(', ')}`);
    }

    // Add all new shipping lines
    newShippingLines.forEach(line => {
      destination.shippingLines.push({
        lineName: line.lineName,
        isActive: line.isActive
      });
    });

    await destination.save();

    console.log(`✅ After: ${destination.shippingLines.length} shipping lines`);
    console.log('   Added lines:');
    newShippingLines.forEach((line, index) => {
      console.log(`     ${index + 1}. ${line.lineName} (${line.isActive ? 'Active' : 'Inactive'})`);
    });

    return destination;
  } catch (error) {
    console.error('❌ Error adding shipping lines:', error.message);
    return null;
  }
}

// Test updating destination with new shipping lines
async function testUpdateDestinationShippingLines(destinationId) {
  console.log('\n🧪 Testing: Update destination with new shipping lines');
  
  try {
    const updateData = {
      destinationName: 'Updated Mumbai Port',
      shippingLines: [
        { lineName: 'COSCO', isActive: true },
        { lineName: 'ZIM', isActive: true },
        { lineName: 'APL', isActive: false }
      ]
    };

    const destination = await POD_destination.findByIdAndUpdate(
      destinationId,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('✅ Destination updated successfully:');
    console.log(`   - New Name: ${destination.destinationName}`);
    console.log(`   - New Shipping Lines: ${destination.shippingLines.length}`);
    destination.shippingLines.forEach((line, index) => {
      console.log(`     ${index + 1}. ${line.lineName} (${line.isActive ? 'Active' : 'Inactive'})`);
    });

    return destination;
  } catch (error) {
    console.error('❌ Error updating destination:', error.message);
    return null;
  }
}

// Test model methods
async function testModelMethods(destinationId) {
  console.log('\n🧪 Testing: Model instance methods');
  
  try {
    const destination = await POD_destination.findById(destinationId);
    
    // Test adding single shipping line
    console.log('📍 Testing addShippingLine method...');
    await destination.addShippingLine({ lineName: 'Test Line', isActive: true });
    console.log('✅ Added single shipping line');

    // Test updating shipping line
    console.log('📍 Testing updateShippingLine method...');
    const lineToUpdate = destination.shippingLines[0];
    await destination.updateShippingLine(lineToUpdate._id, { 
      lineName: 'Updated Test Line', 
      isActive: false 
    });
    console.log('✅ Updated shipping line');

    // Test removing shipping line
    console.log('📍 Testing removeShippingLine method...');
    await destination.removeShippingLine(lineToUpdate._id);
    console.log('✅ Removed shipping line');

    console.log(`📊 Final shipping lines count: ${destination.shippingLines.length}`);
    
  } catch (error) {
    console.error('❌ Error testing model methods:', error.message);
  }
}

// Test data validation
async function testValidation() {
  console.log('\n🧪 Testing: Data validation');
  
  // Test duplicate destination name
  try {
    const duplicateDestination = new POD_destination({
      destinationName: 'Updated Mumbai Port', // Should already exist
      shippingLines: []
    });
    await duplicateDestination.save();
    console.log('❌ Should have failed: Duplicate destination name');
  } catch (error) {
    console.log('✅ Correctly caught duplicate destination name error');
  }

  // Test empty destination name
  try {
    const emptyNameDestination = new POD_destination({
      destinationName: '',
      shippingLines: []
    });
    await emptyNameDestination.save();
    console.log('❌ Should have failed: Empty destination name');
  } catch (error) {
    console.log('✅ Correctly caught empty destination name error');
  }

  // Test empty shipping line name
  try {
    const destination = await POD_destination.findOne({ destinationName: 'Updated Mumbai Port' });
    await destination.addShippingLine({ lineName: '', isActive: true });
    console.log('❌ Should have failed: Empty shipping line name');
  } catch (error) {
    console.log('✅ Correctly caught empty shipping line name error');
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Enhanced POD Destinations API Tests\n');
  
  await connectDB();

  // Test 1: Create destination with shipping lines
  const destinationId = await testCreateWithShippingLines();
  
  if (destinationId) {
    // Test 2: Add multiple shipping lines
    await testAddMultipleShippingLines(destinationId);
    
    // Test 3: Update destination with new shipping lines
    await testUpdateDestinationShippingLines(destinationId);
    
    // Test 4: Model methods
    await testModelMethods(destinationId);
  }

  // Test 5: Validation
  await testValidation();

  console.log('\n✨ All tests completed!');
  
  // Cleanup
  console.log('\n🧹 Cleaning up test data...');
  await POD_destination.deleteMany({ 
    destinationName: { $in: ['Test Mumbai', 'Updated Mumbai Port'] } 
  });
  console.log('✅ Cleanup completed');

  await mongoose.connection.close();
  console.log('✅ Database connection closed');
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
