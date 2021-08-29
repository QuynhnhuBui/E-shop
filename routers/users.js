const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { use } = require('./products');
const {sendWelcomeEmail}= require('../email/account')



router.get(`/getAllUsers`, async (req, res) =>{ //"/getAllUsers"
    const userList = await User.find()
    .select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})


router.get(`/getProfile/:id`, async (req, res)=>{ //"/getProfile/:id"
    const user = await User.findById(req.params.id).select("-passwordHash")
    if (!user){
        res.status(500).json({
            success: false,
            message:'The user with the given ID was not found'
        })
    }
    res.send(user)
})


router.post(`/register`, async (req, res)=>{ //"/register"
    //add check email and phone are unique
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
    // sendWelcomeEmail(user.email,user.name)
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
        return res.status(400).json({message:'User not found', success: false})
    } 
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token = jwt.sign(
            {
            userId: user.id,
            isAdmin: user.isAdmin       
        },
        secret,
        {
            expiresIn: '1d'
        }  
        )
        res.status(200).send({
            user: user.email,
            token: token,
            success: true
        })
    } else {
        res.status(400).json({message:'Incorrect email or password', success: false})
    }
})

router.get('/getUsers/count', async (req,res)=>{ //"getUsers"
    const userCount = await User.countDocuments((count)=>{
        count
    })
    if(!userCount){
        res.status(500).json({success: false})
    } 
    res.send({
        count: userCount     
    })
})

router.delete('/deleteUser/:id', (req, res)=>{ //"/delete/id"
    User.findByIdAndRemove(req.params.id).then((user)=>{
        if(user){
            return res.status(200).json({
                success: true,
                message: 'The user is deleted'
            })
        } else{
            return res.status(404).json({
                success: false,
                message: 'User not found'
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

module.exports =router;