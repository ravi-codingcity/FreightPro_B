const mongoose = require('mongoose');
const POD_destination = require('../models/POD_destinations');
const connectDB = require('../config/db');
require('dotenv').config();

const testDestinationFunctionality = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Test 1: Create a new destination
    console.log('\n📝 Test 1: Creating a new destination...');
    const newDestination = new POD_destination({
      destinationName: "Test Port",
      shippingLines: [
        {
          lineName: "Test Shipping Line",
          isActive: true
        }
      ]
    });

    const savedDestination = await newDestination.save();
    console.log(`✅ Created destination: ${savedDestination.destinationName}`);
    console.log(`   - Shipping lines: ${savedDestination.shippingLines.length}`);
    console.log(`   - Active shipping lines: ${savedDestination.activeShippingLinesCount}`);

    // Test 2: Add a shipping line using instance method
    console.log('\n📝 Test 2: Adding shipping line using instance method...');
    try {
      await savedDestination.addShippingLine({
        lineName: "Second Test Line",
        isActive: true
      });
      console.log('✅ Successfully added shipping line');
      console.log(`   - Total shipping lines: ${savedDestination.shippingLines.length}`);
    } catch (error) {
      console.log(`❌ Error adding shipping line: ${error.message}`);
    }

    // Test 3: Try to add duplicate shipping line (should fail)
    console.log('\n📝 Test 3: Testing duplicate shipping line prevention...');
    try {
      await savedDestination.addShippingLine({
        lineName: "Test Shipping Line", // Same name as first line
        isActive: true
      });
      console.log('❌ This should not succeed - duplicate prevention failed');
    } catch (error) {
      console.log(`✅ Correctly prevented duplicate: ${error.message}`);
    }

    // Test 4: Update shipping line
    console.log('\n📝 Test 4: Updating shipping line...');
    const firstShippingLineId = savedDestination.shippingLines[0]._id;
    try {
      await savedDestination.updateShippingLine(firstShippingLineId, {
        lineName: "Updated Test Shipping Line"
      });
      console.log('✅ Successfully updated shipping line');
      console.log(`   - New name: ${savedDestination.shippingLines[0].lineName}`);
    } catch (error) {
      console.log(`❌ Error updating shipping line: ${error.message}`);
    }

    // Test 5: Test static methods
    console.log('\n📝 Test 5: Testing static methods...');
    
    // Find by shipping line
    const destinationsByLine = await POD_destination.findByShippingLine('Second Test Line');
    console.log(`✅ Found ${destinationsByLine.length} destinations for shipping line 'Second Test Line'`);

    // Get active destinations
    const activeDestinations = await POD_destination.getActiveDestinations();
    console.log(`✅ Found ${activeDestinations.length} active destinations`);

    // Test 6: Test virtual field
    console.log('\n📝 Test 6: Testing virtual fields...');
    const reloadedDestination = await POD_destination.findById(savedDestination._id);
    console.log(`✅ Active shipping lines count (virtual): ${reloadedDestination.activeShippingLinesCount}`);

    // Test 7: Remove shipping line
    console.log('\n📝 Test 7: Removing shipping line...');
    const secondShippingLineId = savedDestination.shippingLines[1]._id;
    try {
      await savedDestination.removeShippingLine(secondShippingLineId);
      console.log('✅ Successfully removed shipping line');
      console.log(`   - Remaining shipping lines: ${savedDestination.shippingLines.length}`);
    } catch (error) {
      console.log(`❌ Error removing shipping line: ${error.message}`);
    }

    // Cleanup - remove test destination
    console.log('\n🧹 Cleaning up test data...');
    await POD_destination.findByIdAndDelete(savedDestination._id);
    console.log('✅ Test destination cleaned up');

    console.log('\n🎉 All tests completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

// Run test if called directly
if (require.main === module) {
  testDestinationFunctionality();
}

module.exports = { testDestinationFunctionality };
