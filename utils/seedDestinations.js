const mongoose = require('mongoose');
const POD_destination = require('../models/POD_destinations');
const connectDB = require('../config/db');
require('dotenv').config();

const sampleDestinations = [
  {
    destinationName: "Port of Los Angeles",
    shippingLines: [
      {
        lineName: "Maersk Line",
        isActive: true
      },
      {
        lineName: "COSCO Shipping",
        isActive: true
      }
    ],
    isActive: true
  },
  {
    destinationName: "Port of Long Beach",
    shippingLines: [
      {
        lineName: "Evergreen Line",
        isActive: true
      },
      {
        lineName: "Yang Ming Line",
        isActive: true
      }
    ],
    isActive: true
  },
  {
    destinationName: "Port of New York",
    shippingLines: [
      {
        lineName: "Mediterranean Shipping Company",
        isActive: true
      },
      {
        lineName: "CMA CGM",
        isActive: true
      }
    ],
    isActive: true
  },
  {
    destinationName: "Port of Hamburg",
    shippingLines: [
      {
        lineName: "Hapag-Lloyd",
        isActive: true
      },
      {
        lineName: "Maersk Line",
        isActive: true
      }
    ],
    isActive: true
  },
  {
    destinationName: "Port of Singapore",
    shippingLines: [
      {
        lineName: "Ocean Network Express",
        isActive: true
      },
      {
        lineName: "PIL Pacific International Lines",
        isActive: true
      },
      {
        lineName: "COSCO Shipping",
        isActive: true
      }
    ],
    isActive: true
  },
  {
    destinationName: "Port of Rotterdam",
    shippingLines: [
      {
        lineName: "MSC Mediterranean Shipping",
        isActive: true
      },
      {
        lineName: "Maersk Line",
        isActive: true
      }
    ],
    isActive: true
  }
];

const seedDestinations = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Clear existing data
    await POD_destination.deleteMany({});
    console.log('Cleared existing destinations');

    // Insert sample data
    const destinations = await POD_destination.insertMany(sampleDestinations);
    console.log(`Successfully seeded ${destinations.length} destinations`);

    // Display summary
    for (const dest of destinations) {
      console.log(`- ${dest.destinationName}: ${dest.shippingLines.length} shipping lines`);
    }

    console.log('\nSeeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding destinations:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDestinations();
}

module.exports = { seedDestinations, sampleDestinations };
