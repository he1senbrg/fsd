require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Post = require('../models/Post');
const Product = require('../models/Product');
const Event = require('../models/Event');
const Opportunity = require('../models/Opportunity');
const Campaign = require('../models/Campaign');
const Follow = require('../models/Follow');

const seed = async () => {
    await connectDB();
    console.log('Seeding database...');

    // clear existing
    await Promise.all([
        User.deleteMany({}), Post.deleteMany({}), Product.deleteMany({}),
        Event.deleteMany({}), Opportunity.deleteMany({}), Campaign.deleteMany({}),
        Follow.deleteMany({}),
    ]);

    const users = await User.create([
        {
            fullName: 'Ananya Sharma', email: 'ananya@kalasetu.com', password: 'password123',
            role: 'artist', bio: 'Kathak dancer with 15 years of experience in classical and contemporary dance.',
            title: 'Kathak Dancer, Choreographer & Mentor', location: 'Mumbai, Maharashtra',
            primaryArtForm: 'Classical Dance', specializations: ['Kathak', 'Choreography', 'Workshops'],
            languages: ['Hindi', 'English', 'Marathi'], rating: 4.8, reviewCount: 24, verified: true,
            pricing: [{ service: 'Solo Performance', price: 25000 }, { service: 'Workshop (2hrs)', price: 8000 }],
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
        },
        {
            fullName: 'Rajesh Kulkarni', email: 'rajesh@kalasetu.com', password: 'password123',
            role: 'artist', bio: 'Master potter from Jaipur specializing in blue pottery and terracotta art.',
            title: 'Blue Pottery Artist & Ceramic Designer', location: 'Jaipur, Rajasthan',
            primaryArtForm: 'Pottery', specializations: ['Blue Pottery', 'Terracotta', 'Ceramic Art'],
            languages: ['Hindi', 'Rajasthani', 'English'], rating: 4.6, reviewCount: 18, verified: true,
            pricing: [{ service: 'Custom Pottery', price: 5000 }, { service: 'Pottery Workshop', price: 3000 }],
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
        },
        {
            fullName: 'Priya Nair', email: 'priya@kalasetu.com', password: 'password123',
            role: 'artist', bio: 'Bharatanatyam dancer and Carnatic vocalist, bringing south Indian traditions to global stages.',
            title: 'Bharatanatyam Dancer & Carnatic Vocalist', location: 'Chennai, Tamil Nadu',
            primaryArtForm: 'Classical Dance', specializations: ['Bharatanatyam', 'Carnatic Music', 'Folk Dance'],
            languages: ['Tamil', 'English', 'Hindi'], rating: 4.9, reviewCount: 32, verified: true,
            pricing: [{ service: 'Dance Performance', price: 30000 }, { service: 'Music Recital', price: 15000 }],
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
        },
        {
            fullName: 'Vikram Singh', email: 'vikram@kalasetu.com', password: 'password123',
            role: 'artist', bio: 'Textile artist preserving Rajasthani block printing and bandhani traditions.',
            title: 'Textile Artist & Block Print Master', location: 'Bagru, Rajasthan',
            primaryArtForm: 'Textile Arts', specializations: ['Block Printing', 'Bandhani', 'Natural Dyes'],
            languages: ['Hindi', 'Rajasthani'], rating: 4.7, reviewCount: 15,
            pricing: [{ service: 'Custom Textile', price: 4000 }, { service: 'Block Printing Workshop', price: 2500 }],
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
        },
        {
            fullName: 'Meera Patel', email: 'meera@kalasetu.com', password: 'password123',
            role: 'artLover', bio: 'Art collector and patron supporting traditional Indian art forms.',
            title: 'Art Enthusiast & Collector', location: 'Ahmedabad, Gujarat',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
        },
    ]);

    console.log(`Created ${users.length} users`);

    await Follow.create([
        { follower: users[4]._id, followee: users[0]._id },
        { follower: users[4]._id, followee: users[1]._id },
        { follower: users[4]._id, followee: users[2]._id },
        { follower: users[0]._id, followee: users[2]._id },
        { follower: users[2]._id, followee: users[0]._id },
    ]);
    await User.findByIdAndUpdate(users[0]._id, { followerCount: 2, followingCount: 1 });
    await User.findByIdAndUpdate(users[2]._id, { followerCount: 2, followingCount: 1 });
    await User.findByIdAndUpdate(users[4]._id, { followingCount: 3 });

    const posts = await Post.create([
        {
            author: users[0]._id, postType: 'performance',
            text: 'Just finished an incredible Kathak recital at NCPA! The audience was amazing 🎶 #Kathak #ClassicalDance #NCPA',
            hashtags: ['kathak', 'classicaldance', 'ncpa'], likeCount: 42, commentCount: 8, shareCount: 5,
            media: [{ url: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=600', type: 'image' }],
        },
        {
            author: users[1]._id, postType: 'craft',
            text: 'New collection of blue pottery vases inspired by Mughal garden motifs 🏺 #BluePottery #Jaipur #Crafts',
            hashtags: ['bluepottery', 'jaipur', 'crafts'], likeCount: 35, commentCount: 12,
            media: [{ url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600', type: 'image' }],
        },
        {
            author: users[2]._id, postType: 'workshop',
            text: 'Announcing a 3-day Bharatanatyam workshop in Chennai! Limited seats. Register now 🙏 #Bharatanatyam #Workshop',
            hashtags: ['bharatanatyam', 'workshop'], likeCount: 56, commentCount: 15,
            embeddedEvent: { month: 'MAR', date: '15', title: 'Bharatanatyam Intensive', location: 'Chennai', time: '10 AM - 5 PM' },
        },
        {
            author: users[3]._id, postType: 'craft',
            text: 'Block printing process from start to finish. Preserving 300-year old techniques 🎨 #BlockPrint #TextileArt',
            hashtags: ['blockprint', 'textileart'], likeCount: 28, commentCount: 6,
            media: [{ url: 'https://images.unsplash.com/photo-1436918898788-ebce04d38e46', type: 'image' }],
        },
    ]);
    console.log(`Created ${posts.length} posts`);

    const products = await Product.create([
        {
            seller: users[1]._id, name: 'Handcrafted Blue Pottery Vase', category: 'pottery', price: 2499,
            originalPrice: 3499, description: 'Authentic Jaipur blue pottery vase with floral motifs.',
            images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500'], region: 'Rajasthan',
            stock: 8, badge: 'Bestseller', rating: 4.7, reviewCount: 23,
        },
        {
            seller: users[3]._id, name: 'Block Print Cotton Dupatta', category: 'textiles', price: 1299,
            originalPrice: 1899, description: 'Hand block printed cotton dupatta with natural dyes.',
            images: ['https://images.unsplash.com/photo-1742800766508-da7ac424b073'], region: 'Rajasthan',
            stock: 15, badge: 'New Arrival', rating: 4.5, reviewCount: 12,
        },
        {
            seller: users[1]._id, name: 'Terracotta Wall Hanging', category: 'pottery', price: 1899,
            description: 'Traditional terracotta wall art handcrafted by artisans.',
            images: ['https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=500'], region: 'Rajasthan',
            stock: 5, badge: 'Only 5 left', rating: 4.8, reviewCount: 9,
        },
        {
            seller: users[3]._id, name: 'Bandhani Silk Saree', category: 'textiles', price: 4999,
            originalPrice: 6999, description: 'Exquisite Bandhani tie-dye silk saree from Gujarat.',
            images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500'], region: 'Gujarat',
            stock: 3, rating: 4.9, reviewCount: 7,
        },
    ]);
    console.log(`Created ${products.length} products`);

    const events = await Event.create([
        {
            organizer: users[0]._id, title: 'Kathak Mahotsav 2026', category: 'festival',
            artForm: 'Kathak', description: 'Annual Kathak festival featuring top dancers from across India.',
            startDate: new Date('2026-04-15'), endDate: new Date('2026-04-17'),
            time: '6:00 PM', venue: 'Kamani Auditorium, New Delhi', eventType: 'paid',
            ticketTiers: [
                { name: 'General', price: 500, totalQty: 200, soldQty: 45 },
                { name: 'VIP', price: 2000, totalQty: 50, soldQty: 12 },
            ],
            status: 'published', coverImage: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800',
        },
        {
            organizer: users[2]._id, title: 'South Indian Classical Dance Workshop', category: 'workshop',
            artForm: 'Bharatanatyam', description: 'Intensive 2-day workshop for intermediate dancers.',
            startDate: new Date('2026-03-20'), endDate: new Date('2026-03-21'),
            time: '10:00 AM', venue: 'Kalakshetra, Chennai', eventType: 'paid',
            ticketTiers: [{ name: 'Workshop Pass', price: 3000, totalQty: 30, soldQty: 18 }],
            status: 'published', coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4Y82wjWdUTg8xJDlBH-sWIGHom3yZ_6xpFS27Ip3siiv3W1vXWZXN47P0V5xPiSU6gUfNTZgKJG1sunxQSvSJn4mIoT9zQ4jtIb4-ILz07bHwBMkFDGcuc2FBjTK9wXrb9fZ0ON8HO7no2VxYYiAMUiwtdQHkkCrEmAnsRBJ_40kmTGKcPXQafLYWQ1x43mcWhnx6-tRE65WtP1-5uxaue1D4QOGMeH7nsLUyih-n3ykPSe792Nr9m2gOIOGYj90nzD1XVhMS-h57',
        },
        {
            organizer: users[1]._id, title: 'Pottery & Chai Evening', category: 'exhibition',
            artForm: 'Pottery', description: 'An evening of live pottery demonstration with tea tasting.',
            startDate: new Date('2026-03-25'), time: '5:00 PM', venue: 'Jawahar Kala Kendra, Jaipur',
            eventType: 'free', maxAttendees: 100, status: 'published',
            coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
        },
    ]);
    console.log(`Created ${events.length} events`);

    const opps = await Opportunity.create([
        {
            organizer: users[0]._id, title: 'Kathak Performers for Cultural Festival',
            type: 'performance', artForm: 'Kathak', location: 'Delhi',
            description: 'Looking for 3 experienced Kathak dancers for a 2-day cultural festival.',
            payType: 'fixed', payAmount: { min: 15000, max: 25000 },
            deadline: new Date('2026-04-01'), slots: 3, status: 'open', applicationCount: 8,
            tags: ['Kathak', 'Performance', 'Festival'],
        },
        {
            organizer: users[2]._id, title: 'Dance Instructor for Summer Program',
            type: 'teaching', artForm: 'Classical Dance', location: 'Chennai', isRemote: false,
            description: 'Seeking a dance instructor for a 4-week summer program for children.',
            payType: 'stipend', payAmount: { min: 20000, max: 30000 },
            deadline: new Date('2026-05-01'), slots: 1, status: 'open', applicationCount: 12,
            tags: ['Teaching', 'Classical Dance', 'Children'],
        },
    ]);
    console.log(`Created ${opps.length} opportunities`);

    const campaigns = await Campaign.create([
        {
            creator: users[1]._id, title: 'Save Jaipur Blue Pottery',
            shortDescription: 'Help preserve the 300-year-old tradition of Jaipur blue pottery.',
            fullStory: '<p>Blue pottery is a dying art form...</p>',
            category: 'heritage', location: 'Jaipur, Rajasthan',
            goalAmount: 500000, raisedAmount: 325000, backerCount: 142,
            deadline: new Date('2026-05-01'), duration: 45, status: 'active',
            coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
            rewardTiers: [
                { name: 'Rasa', amount: 500, perks: ['Thank you card', 'Name in credits'] },
                { name: 'Kala', amount: 2000, perks: ['All Rasa perks', 'Handmade pottery piece'] },
                { name: 'Guru', amount: 5000, perks: ['All Kala perks', 'Visit to workshop', 'Custom pottery set'] },
            ],
            tags: ['pottery', 'heritage', 'rajasthan'],
        },
        {
            creator: users[3]._id, title: 'Block Printing Revival Project',
            shortDescription: 'Supporting artisan families preserving traditional block printing.',
            category: 'textiles', location: 'Bagru, Rajasthan',
            goalAmount: 300000, raisedAmount: 180000, backerCount: 89,
            deadline: new Date('2026-04-15'), duration: 30, status: 'active',
            coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
            rewardTiers: [
                { name: 'Rasa', amount: 500, perks: ['Thank you note'] },
                { name: 'Kala', amount: 2000, perks: ['Handmade block print fabric'] },
            ],
            tags: ['textiles', 'block-printing', 'artisans'],
        },
    ]);
    console.log(`Created ${campaigns.length} campaigns`);

    console.log('\nDatabase seeded successfully!');
    console.log(`
  Test Accounts:
  ──────────────
  Artist:    ananya@kalasetu.com / password123
  Artist:    rajesh@kalasetu.com / password123
  Artist:    priya@kalasetu.com / password123
  Artist:    vikram@kalasetu.com / password123
  Art Lover: meera@kalasetu.com / password123
  `);

    process.exit(0);
};

seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});