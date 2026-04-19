const catchAsync = require('../utils/catchAsync');

// fake for now
const subscribers = new Set();

exports.subscribe = catchAsync(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ status: 'fail', message: 'Email is required' });
    }
    subscribers.add(email);
    console.log(`Newsletter subscriber: ${email}`);
    res.status(201).json({ status: 'success', message: 'Subscribed to newsletter!' });
});