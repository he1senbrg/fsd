const User = require('../models/User');
const Product = require('../models/Product');
const Event = require('../models/Event');
const catchAsync = require('../utils/catchAsync');

exports.search = catchAsync(async (req, res) => {
    const { q, type } = req.query;
    if (!q) {
        return res.status(200).json({ status: 'success', data: { artists: [], products: [], events: [] } });
    }

    const searchRegex = { $regex: q, $options: 'i' };
    const results = {};

    if (!type || type === 'artists') {
        results.artists = await User.find({
            role: 'artist',
            $or: [{ fullName: searchRegex }, { bio: searchRegex }, { primaryArtForm: searchRegex }],
        }).select('fullName avatar title primaryArtForm location rating').limit(10);
    }

    if (!type || type === 'products') {
        results.products = await Product.find({
            isActive: true,
            $or: [{ name: searchRegex }, { description: searchRegex }],
        }).select('name price images category').limit(10);
    }

    if (!type || type === 'events') {
        results.events = await Event.find({
            status: 'published',
            $or: [{ title: searchRegex }, { description: searchRegex }],
        }).select('title startDate venue category coverImage').limit(10);
    }

    res.status(200).json({ status: 'success', data: results });
});