const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();

//get list category
router.get(`/getListCategory`, async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    } 
    res.send(categoryList);
})
//get category by ID
router.get('/getCategory/:id', async (req,res)=>{
    const category = await Category.findById(req.params.id)
    if(!category){
        res.status(500).send({ 
            message:'The category with given ID not found'
        })
    } else {
        res.status(200).send(category)
    }
})
//add new
router.post('/addCategory', async (req, res)=>{ 
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })

    category = await category.save()

    if (!category){
        return res.status(404).send('The category cannot be created')
    } else {
        res.status(200).send(category)
    }
})


//api/v1/{id}
//delete
router.delete('/deleteCategory/:id', (req, res)=>{
    Category.findByIdAndRemove(req.params.id).then((category)=>{
        if(category){
            return res.status(200).json({
                success: true,
                message: 'The category is deleted'
            })
        } else{
            return res.status(404).json({
                success: false,
                message: 'Category not found'
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

//update category
router.put('/updateCategory/:id', async (req, res)=>{
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            color: req.body.color,
            icon: req.body.icon
        },
        {new: true}
        )
        if (!category){
            return res.status(400).send('The category cannot be updated')
        } else {
            res.status(200).send(category)
        }
})

module.exports =router;