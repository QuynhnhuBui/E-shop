const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { use } = require('./products');
router.get(`/`, async (req, res) =>{
    const userList = await User.find()
    .select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})


router.get(`/:id`, async (req, res)=>{
    const user = await User.findById(req.params.id).select("-passwordHash")
    if (!user){
        res.status(500).json({
            success: false,
            message:'The user with the given ID was not found'
        })
    }
    res.send(user)
})


router.post(`/`, async (req, res)=>{
    
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password,10),    
        phone: req.body.phone,
        apartment: req.body.apartment,
        isAdmin: req.body.isAdmin,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
        street: req.body.street,
    })

    user = await user.save()
    if (!user){
        return res.status(400).send({
            message: 'User cannot be created'
        })
    } else {
        return res.send(user)
    }
   
})
//login
router.post('/login', async(req, res)=>{
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret

    if (!user){
        return res.status(400).send('User not found')
    } 
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token = jwt.sign(
            {
            userId: user.id
        },
        secret,
        {
            expiresIn: '1d'
        }  
        )
        res.status(200).send({
            user: user.email,
            token: token
        })
    } else {
        res.status(400).send('Incorrect password')
    }
})

module.exports =router;