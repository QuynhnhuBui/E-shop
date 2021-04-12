const express = require('express') 
const { model } = require('mongoose')
const router = express.Router()
const {Product} = require('../models/product')
const {Category} = require('../models/category')
const mongoose = require('mongoose')
router.get(`/`, async (req, res)=>{
    let filter = {}
    if (req.query.categories){
         filter = {category : req.query.categories.split(',')}
    }
    const productList = await Product.find(filter).populate('category')
    if (!productList){
        res.status(500).json({
            success: false  
        })
    }
    res.send(productList)
})

router.get(`/:id`, async (req, res)=>{
    const product = await Product.findById(req.params.id).populate('category')
    if (!product){
        res.status(500).json({
            success: false  
        })
    }
    res.send(product)
})

router.post(`/`, async (req, res)=>{
    const category = await Category.findById(req.body.category)
    if(!category){
        return res.status(400).send({
            message:"Invalid category"
        })
    }
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })

    product = await product.save()
    if (!product){
        return res.status(400).send({
            message: 'Product cannot be created'
        })
    } else {
        return res.send(product)
    }
   
})

router.put('/:id', async (req, res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid Product ID')
    }
    const category = await Category.findById(req.body.category)
    if(!category){
        return res.status(400).send({
            message:"Invalid category"
        })
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        },
        {new: true}
        )
        if (!product){
            return res.status(500).send('The category cannot be updated')
        } else {
            res.status(200).send(product)
        }
})

router.delete('/:id', (req, res)=>{
    Product.findByIdAndRemove(req.params.id).then((product)=>{
        if(product){
            return res.status(200).json({
                success: true,
                message: 'The product is deleted'
            })
        } else{
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }
    })
    .catch((err)=>{
        return res.status(400).json({
            success: false,
            error: err
        })
    })
})

//totalProduct
router.get('/get/count', async (req,res)=>{
    const productCount = await Product.countDocuments((count)=>{
        count
    })
    if(!productCount){
        res.status(500).json({success: false})
    } 
    res.send({
        count: productCount 
    })
})

router.get('/get/featured/:count', async (req,res)=>{
    const count = req.params.count ? req.params.count :0
    const featuredProduct = await Product.find({
        isFeatured: true
    })
    .limit(+count)
    if(!featuredProduct){
        res.status(500).json({success: false})
    } 
    res.send({
        count: featuredProduct 
    })
})


module.exports = router