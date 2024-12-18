const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required: true
    }],
    status:{
        type: String,
        required: true,
        default:'Pending'
    },
    total:{
        type: Number
    },
    phone:{
        type: Number,
        required: true
    },
    shippingAddress1:{
        type: String,
        required: true
    },
    shippingAddress2:{
        type: String
    },
    city:{
        type: String,
        required: true
    },
    country:{
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    dateOrder:{
        type: Date,
        default: Date.now
    },
    totalPrice:{
        type: Number,
        default: 0 
    }

})

orderSchema.virtual('id').get(function(){
    return this._id.toHexString()
})

orderSchema.set('toJSON',{
    virtuals: true
})

exports.Order = mongoose.model('Order', orderSchema);
