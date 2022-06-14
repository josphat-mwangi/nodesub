const router = require('express').Router();
const User = require('../module/User');
const { registerValidation, loginValidation } = require('../validation');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verify = required('./privateroute.js')



router.post("/register", async (req, res)=>{

    
    //validation
    const {error} = registerValidation(req.body)

    if(error){
        return res.status(400).send(error.details[0].message);
    }

    //checking if user exists
    const emailExist = await User.findOne({email: req.body.email})

    if(emailExist)return res.status(400).send("Eamil already exist")
     
    //hash password
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //create new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword
    });

    try{
        const savedUser = await user.save();
        res.send({user: user._id})

    }catch(err){
        res.status(400).send(err);
    }
});

router.post("/login", async(req, res) => {
  

    const {error} = loginValidation(req.body)
    if(error)return res.status(400).send(error.details[0].message);
    

    // checking if email exists
    const user = await User.findOne({email: req.body.email})
    if(!user)return res.status(400).send("Email doesn't exist");
   

    //checking if password is the same
    const validpassword = await bcrypt.compare(req.body.password, user.password);

    if(!validpassword)  return res.status(400).send("Invalid password");

    //create and assign token
    const token = jwt.sign({_id: user._id}, process.env.SECRET_TOKEN);

    res.header('auth-token', token).send(token);

    

});

router.put('/logout', verify, (req, res)=>{
    const authHeader = req.headers["authorization"];

    jwt.sign(authHeader, "", { expiresIn: 1 } , (logout, err) => {
        if (logout) {
            res.send({msg : 'You have been Logged Out' });
        } else {
            res.send({msg:'Error'});
        }
    });
    
});


module.exports = router;