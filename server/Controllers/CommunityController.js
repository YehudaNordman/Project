const SharedItinerary = require('../Modelse/SharedItinerary');

exports.shareItinerary = async (req, res) => {
    try {
        const { destination, aiPlan, flightDetails } = req.body;
        const newShared = new SharedItinerary({
            userId: req.user._id,
            userEmail: req.user.email,
            userName: req.user.fullName, // New field for full name
            destination,
            aiPlan,
            flightDetails
        });
        await newShared.save();
        res.status(201).json({ message: "Itinerary shared successfully", data: newShared });
    } catch (error) {
        res.status(500).json({ message: "Error sharing itinerary", error: error.message });
    }
};

exports.getAllShared = async (req, res) => {
    try {
        const shared = await SharedItinerary.find()
            .populate('userId', 'fullName')
            .populate('comments.userId', 'fullName')
            .sort({ createdAt: -1 });
        res.json(shared);
    } catch (error) {
        res.status(500).json({ message: "Error fetching shared itineraries", error: error.message });
    }
};

exports.likeItinerary = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const itinerary = await SharedItinerary.findById(id);

        if (!itinerary) return res.status(404).json({ message: "Not found" });

        const index = itinerary.likes.indexOf(userId);
        if (index === -1) {
            itinerary.likes.push(userId);
        } else {
            itinerary.likes.splice(index, 1);
        }

        await itinerary.save();
        res.json(itinerary);
    } catch (error) {
        res.status(500).json({ message: "Error liking itinerary", error: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const itinerary = await SharedItinerary.findById(id);

        if (!itinerary) return res.status(404).json({ message: "Not found" });

        itinerary.comments.push({
            userId: req.user._id,
            userEmail: req.user.email,
            userName: req.user.fullName, // New field for comment user name
            text
        });

        await itinerary.save();
        res.json(itinerary);
    } catch (error) {
        res.status(500).json({ message: "Error adding comment", error: error.message });
    }
};
