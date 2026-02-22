const User = require('../Modelse/User');
const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    let user = new User(req.body);
    if (req.body.password && req.body.email) {
      let salt = bcrypt.genSaltSync(12);
      user.password = bcrypt.hashSync(req.body.password, salt);
    }

    if (req.body.password.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])/.test(req.body.password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters long and contain at least one uppercase letter and one lowercase letter" });
    }

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
    const id = req.params.id || req.user._id;
    let user = await User.findByIdAndUpdate(id, req.body, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    let user = await User.findOne({ email: req.body.email })
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    let isMatch = bcrypt.compareSync(req.body.password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user._id }, "secret password", { expiresIn: '7d' });
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        fullName: user.fullName
      }
    });
  } catch (error) {
    res.json({ message: error.message })
  }
}

exports.auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, "secret password");
    req.user = await User.findById(decoded.userId);
    if (!req.user) throw new Error("User not found");
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and new password are required" });
    }
    if (password.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters long and contain at least one uppercase letter and one lowercase letter" });
    }
    let user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Internal Error: User not found" });

    let salt = bcrypt.genSaltSync(12);
    user.password = bcrypt.hashSync(password, salt);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.saveItinerary = async (req, res) => {
  try {
    const { itinerary, times } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.itineraries.push({
      destination: times.destination,
      aiPlan: itinerary,
      flightDetails: {
        landingDate: times.landingDate,
        landingTime: times.landingTime,
        takeoffDate: times.takeoffDate,
        takeoffTime: times.takeoffTime
      }
    });

    await user.save();
    res.status(201).json({ message: "Itinerary saved successfully", itineraries: user.itineraries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserItineraries = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.itineraries || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteItinerary = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.itineraries = user.itineraries.filter(it => it._id.toString() !== req.params.id);
    await user.save();
    res.json({ message: "Itinerary deleted successfully", itineraries: user.itineraries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};