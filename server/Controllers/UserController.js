const User = require('../Modolse/User');
const jwt = require('jsonwebtoken');// npm i jsonwebtoken
var bcrypt = require('bcryptjs');//npm i bcryptjs
exports.register = async (req, res) => {
  try {

    console.log(1);
    
    let user = new User(req.body);
    if (req.body.password && req.body.email) {

      let salt = bcrypt.genSaltSync(12);
      user.password = bcrypt.hashSync(req.body.password, salt);
    }//end of if password
    console.log(user);

    await user.save();

    res.json({ "message": "User added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    let users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteById = async (req, res) => {
  try {
    let user = await User.findByIdAndDelete(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateById = async (req, res) => {
  try {
    let user = await User.findByIdAndUpdate(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    //1. Validate input email passsword
    const { email, password } = req.body; // destructuring the request body
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    //2. Find user by email
    let user = await User.findOne({ email: req.body.email })
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    //3. Compare password
    let isMatch = bcrypt.compareSync(req.body.password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    //4. Generate token
    const token = jwt.sign({ userId: user._id }, "secret password", { expiresIn: '1h' });
    res.status(200).json({
      message: "Login successful",
      token
      
    });
   }
  catch (error) {
    res.json({ message: error.message })
  }
}
exports.auth = async (req, res, next) => {  
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, "secret password");
    console.log(decoded);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
}