const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan'
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    method: {
        type: String,
        enum: ['cash', 'card', 'upi', 'bank_transfer', 'other'],
        default: 'cash'
    },
    status: {
        type: String,
        enum: ['completed', 'pending', 'failed', 'refunded'],
        default: 'completed'
    },
    transactionId: {
        type: String
    },
    invoiceNumber: {
        type: String,
        unique: true
    },
    notes: {
        type: String
    }
}, { timestamps: true });

// Auto-generate invoice number
PaymentSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        const count = await this.constructor.countDocuments();
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        this.invoiceNumber = `INV-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
