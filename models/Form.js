const mongoose = require("mongoose");

const formSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    por: { type: String, required: true },
    pol: { type: String, required: true },
    pod: { type: String, required: true },
    shipping_lines: { type: String, required: true },
    shipping_name: { type: String },
    shipping_number: { type: String },
    shipping_address: { type: String },
    shipping_email: { type: String },
    container_type: { type: String, required: true },
    ocean_freight: { type: String, required: true },
    acd_ens_afr: { type: String, required: true },
    route: { type: String, required: true },
    remarks: { type: String },
    commodity: { type: String, required: true },
    validity: { type: String, required: true },
    validity_for: { type: String, required: true },
    transit: { type: String, required: true },
    bl_fees: { type: String },
    thc: { type: String },
    muc: { type: String },
    toll: { type: String },
    customLabel: { type: String },
    customValue: { type: String },
    customUnit: { type: String },
    customCharges: { type: String },
    railFreightRates: { type: mongoose.Schema.Types.Mixed }, // Changed to Mixed type to handle object
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Reference to User model
  },
  { timestamps: true }
);

const Form = mongoose.model("Form", formSchema);

module.exports = Form;
