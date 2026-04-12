const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: [true, 'Full name is required'], trim: true },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
        role: {
            type: String,
            enum: ['artist', 'artLover', 'organizer', 'sponsor'],
            required: [true, 'Role is required'],
        },
        avatar: { type: String, default: '' },
        coverImage: { type: String, default: '' },
        bio: { type: String, default: '' },
        title: { type: String, default: '' },
        location: { type: String, default: '' },
        phone: { type: String, default: '' },
        primaryArtForm: { type: String, default: '' },
        specializations: [{ type: String }],
        languages: [{ type: String }],
        education: { type: String, default: '' },
        pricing: [
            {
                service: { type: String },
                price: { type: Number },
            },
        ],
        socialLinks: {
            website: { type: String, default: '' },
            instagram: { type: String, default: '' },
            facebook: { type: String, default: '' },
            youtube: { type: String, default: '' },
        },
        verified: { type: Boolean, default: false },
        verifiedDate: { type: Date },
        isPro: { type: Boolean, default: false },
        profileStrength: { type: Number, default: 0, min: 0, max: 100 },
        followerCount: { type: Number, default: 0 },
        followingCount: { type: Number, default: 0 },
        performanceCount: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 },
        notificationPrefs: {
            messages: { type: Boolean, default: true },
            eventReminders: { type: Boolean, default: true },
            orderUpdates: { type: Boolean, default: true },
            newFollowers: { type: Boolean, default: true },
            promotions: { type: Boolean, default: false },
        },
        privacySettings: {
            profileVisibility: {
                type: String,
                enum: ['public', 'followers', 'private'],
                default: 'public',
            },
            showOnline: { type: Boolean, default: true },
            showLocation: { type: Boolean, default: true },
        },
        payoutDetails: {
            bankName: { type: String, default: '' },
            accountNumber: { type: String, default: '' },
            ifscCode: { type: String, default: '' },
            upiId: { type: String, default: '' },
        },
        rememberToken: { type: String },
        passwordResetToken: { type: String },
        passwordResetExpires: { type: Date },
    },
    { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ primaryArtForm: 1, location: 1 });
userSchema.index({ fullName: 'text', bio: 'text', specializations: 'text' });

// hashing
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// profile strength
userSchema.pre('save', function () {
    let strength = 0;
    if (this.fullName) strength += 10;
    if (this.email) strength += 10;
    if (this.avatar) strength += 10;
    if (this.coverImage) strength += 5;
    if (this.bio) strength += 15;
    if (this.title) strength += 5;
    if (this.location) strength += 10;
    if (this.primaryArtForm) strength += 10;
    if (this.specializations && this.specializations.length > 0) strength += 10;
    if (this.pricing && this.pricing.length > 0) strength += 10;
    if (this.socialLinks && (this.socialLinks.website || this.socialLinks.instagram)) strength += 5;
    this.profileStrength = Math.min(100, strength);
});

// password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.rememberToken;
    delete obj.passwordResetToken;
    delete obj.passwordResetExpires;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
