const User = require('../models/User');
const Follow = require('../models/Follow');
const Review = require('../models/Review');
const Post = require('../models/Post');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { paginate, paginationMeta } = require('../utils/pagination');
const NotificationService = require('../services/NotificationService');
const { uploadBuffer } = require('../utils/blobStorage');

// GET /api/users/:id
exports.getUserProfile = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id).select('-payoutDetails -notificationPrefs -privacySettings');
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // check if follows this user
    let isFollowing = false;
    if (req.user) {
        const follow = await Follow.findOne({ follower: req.user._id, followee: user._id });
        isFollowing = !!follow;
    }

    res.status(200).json({
        status: 'success',
        data: { user, isFollowing },
    });
});

// GET /api/users/:id/portfolio
exports.getUserPortfolio = catchAsync(async (req, res) => {
    const { page, limit, skip } = paginate(req.query);
    const filter = { author: req.params.id };
    if (req.query.type) filter.postType = req.query.type;

    const [posts, total] = await Promise.all([
        Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Post.countDocuments(filter),
    ]);

    res.status(200).json({
        status: 'success',
        data: { posts },
        pagination: paginationMeta(total, page, limit),
    });
});

// GET /api/users/:id/reviews
exports.getUserReviews = catchAsync(async (req, res) => {
    const { page, limit, skip } = paginate(req.query);

    const [reviews, total] = await Promise.all([
        Review.find({ target: req.params.id })
            .populate('reviewer', 'fullName avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Review.countDocuments({ target: req.params.id }),
    ]);

    res.status(200).json({
        status: 'success',
        data: { reviews },
        pagination: paginationMeta(total, page, limit),
    });
});

// POST /api/users/:id/follow (follow/unfollow)
exports.toggleFollow = catchAsync(async (req, res, next) => {
    const followeeId = req.params.id;
    const followerId = req.user._id;

    if (followerId.toString() === followeeId) {
        return next(new AppError('You cannot follow yourself', 400));
    }

    const followee = await User.findById(followeeId);
    if (!followee) {
        return next(new AppError('User not found', 404));
    }

    const existingFollow = await Follow.findOne({ follower: followerId, followee: followeeId });

    if (existingFollow) {
        // unfollow
        await Follow.deleteOne({ _id: existingFollow._id });
        await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
        await User.findByIdAndUpdate(followeeId, { $inc: { followerCount: -1 } });

        res.status(200).json({ status: 'success', data: { following: false } });
    } else {
        // follow
        await Follow.create({ follower: followerId, followee: followeeId });
        await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
        await User.findByIdAndUpdate(followeeId, { $inc: { followerCount: 1 } });

        // notify
        NotificationService.notifyFollow(followeeId, followerId, req.user.fullName).catch(() => { });

        res.status(200).json({ status: 'success', data: { following: true } });
    }
});

// GET /api/users/:id/followers
exports.getFollowers = catchAsync(async (req, res) => {
    const { page, limit, skip } = paginate(req.query);

    const [follows, total] = await Promise.all([
        Follow.find({ followee: req.params.id })
            .populate('follower', 'fullName avatar title primaryArtForm')
            .skip(skip)
            .limit(limit),
        Follow.countDocuments({ followee: req.params.id }),
    ]);

    const followers = follows.map((f) => f.follower);

    res.status(200).json({
        status: 'success',
        data: { followers },
        pagination: paginationMeta(total, page, limit),
    });
});

// GET /api/users/:id/following
exports.getFollowing = catchAsync(async (req, res) => {
    const { page, limit, skip } = paginate(req.query);

    const [follows, total] = await Promise.all([
        Follow.find({ follower: req.params.id })
            .populate('followee', 'fullName avatar title primaryArtForm')
            .skip(skip)
            .limit(limit),
        Follow.countDocuments({ follower: req.params.id }),
    ]);

    const following = follows.map((f) => f.followee);

    res.status(200).json({
        status: 'success',
        data: { following },
        pagination: paginationMeta(total, page, limit),
    });
});

// GET /api/users/me/settings
exports.getSettings = catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.status(200).json({
        status: 'success',
        data: { user },
    });
});

// PUT /api/users/me/profile
exports.updateProfile = catchAsync(async (req, res) => {
    const allowedFields = [
        'fullName', 'bio', 'title', 'location', 'phone', 'primaryArtForm',
        'specializations', 'languages', 'education', 'pricing', 'socialLinks',
    ];
    const updates = {};
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        data: { user },
    });
});

// PUT /api/users/me/avatar
exports.updateAvatar = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('Please upload an image', 400));
    }

    // upload to az blob storage
    const result = await uploadBuffer(req.file.buffer, req.file.mimetype, 'avatars');

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar: result.url },
        { new: true }
    );

    res.status(200).json({
        status: 'success',
        data: { user },
    });
});

// PUT /api/users/me/cover
exports.updateCover = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('Please upload an image', 400));
    }

    const result = await uploadBuffer(req.file.buffer, req.file.mimetype, 'covers');

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { coverImage: result.url },
        { new: true }
    );

    res.status(200).json({
        status: 'success',
        data: { user },
    });
});

// PUT /api/users/me/password
exports.updatePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
        return next(new AppError('Current password is incorrect', 401));
    }

    user.password = newPassword;
    await user.save();

    const token = require('../utils/tokenUtils').generateToken(user._id);

    res.status(200).json({
        status: 'success',
        message: 'Password updated successfully',
        data: { token },
    });
});

// PUT /api/users/me/notifications
exports.updateNotificationPrefs = catchAsync(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { notificationPrefs: req.body },
        { new: true }
    );

    res.status(200).json({
        status: 'success',
        data: { notificationPrefs: user.notificationPrefs },
    });
});

// PUT /api/users/me/privacy
exports.updatePrivacySettings = catchAsync(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { privacySettings: req.body },
        { new: true }
    );

    res.status(200).json({
        status: 'success',
        data: { privacySettings: user.privacySettings },
    });
});

// POST /api/users/me/payment-method — stub
exports.addPaymentMethod = catchAsync(async (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Payment method saved (stub)',
    });
});

// PUT /api/users/me/payout
exports.updatePayoutDetails = catchAsync(async (req, res) => {
    const { bankName, accountNumber, ifscCode, upiId } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { payoutDetails: { bankName, accountNumber, ifscCode, upiId } },
        { new: true }
    );

    res.status(200).json({
        status: 'success',
        data: { payoutDetails: user.payoutDetails },
    });
});

// POST /api/users/me/verify
exports.requestVerification = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if (user.verified) {
        return next(new AppError('You are already verified', 400));
    }

    if (user.reviewCount < 5) {
        return next(new AppError('You need at least 5 reviews to request verification', 400));
    }

    if (user.profileStrength < 80) {
        return next(new AppError('Your profile must be at least 80% complete', 400));
    }

    user.verified = true;
    user.verifiedDate = new Date();
    await user.save();

    res.status(200).json({
        status: 'success',
        message: 'Profile verified successfully!',
        data: { user },
    });
});
