const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const upload = multer();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

const now = Date.now();

function makeId(prefix, i) {
    return `${prefix}_${i}`;
}

const users = [
    {
        _id: 'user_1',
        fullName: 'Ananya Sharma',
        email: 'ananya@kalasetu.com',
        password: 'password123',
        role: 'artist',
        bio: 'Kathak dancer with 15 years of experience in classical and contemporary dance.',
        title: 'Kathak Dancer, Choreographer & Mentor',
        location: 'Mumbai, Maharashtra',
        primaryArtForm: 'Classical Dance',
        specializations: ['Kathak', 'Choreography', 'Workshops'],
        languages: ['Hindi', 'English', 'Marathi'],
        rating: 4.8,
        reviewCount: 24,
        verified: true,
        followerCount: 2,
        followingCount: 1,
        pricing: [
            { service: 'Solo Performance', price: 25000 },
            { service: 'Workshop (2hrs)', price: 8000 },
        ],
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
    },
    {
        _id: 'user_2',
        fullName: 'Rajesh Kulkarni',
        email: 'rajesh@kalasetu.com',
        password: 'password123',
        role: 'artist',
        bio: 'Master potter from Jaipur specializing in blue pottery and terracotta art.',
        title: 'Blue Pottery Artist & Ceramic Designer',
        location: 'Jaipur, Rajasthan',
        primaryArtForm: 'Pottery',
        specializations: ['Blue Pottery', 'Terracotta', 'Ceramic Art'],
        languages: ['Hindi', 'Rajasthani', 'English'],
        rating: 4.6,
        reviewCount: 18,
        verified: true,
        pricing: [
            { service: 'Custom Pottery', price: 5000 },
            { service: 'Pottery Workshop', price: 3000 },
        ],
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    },
    {
        _id: 'user_3',
        fullName: 'Priya Nair',
        email: 'priya@kalasetu.com',
        password: 'password123',
        role: 'artist',
        bio: 'Bharatanatyam dancer and Carnatic vocalist, bringing south Indian traditions to global stages.',
        title: 'Bharatanatyam Dancer & Carnatic Vocalist',
        location: 'Chennai, Tamil Nadu',
        primaryArtForm: 'Classical Dance',
        specializations: ['Bharatanatyam', 'Carnatic Music', 'Folk Dance'],
        languages: ['Tamil', 'English', 'Hindi'],
        rating: 4.9,
        reviewCount: 32,
        verified: true,
        followerCount: 2,
        followingCount: 1,
        pricing: [
            { service: 'Dance Performance', price: 30000 },
            { service: 'Music Recital', price: 15000 },
        ],
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
    },
    {
        _id: 'user_4',
        fullName: 'Vikram Singh',
        email: 'vikram@kalasetu.com',
        password: 'password123',
        role: 'artist',
        bio: 'Textile artist preserving Rajasthani block printing and bandhani traditions.',
        title: 'Textile Artist & Block Print Master',
        location: 'Bagru, Rajasthan',
        primaryArtForm: 'Textile Arts',
        specializations: ['Block Printing', 'Bandhani', 'Natural Dyes'],
        languages: ['Hindi', 'Rajasthani'],
        rating: 4.7,
        reviewCount: 15,
        pricing: [
            { service: 'Custom Textile', price: 4000 },
            { service: 'Block Printing Workshop', price: 2500 },
        ],
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
    },
    {
        _id: 'user_5',
        fullName: 'Meera Patel',
        email: 'meera@kalasetu.com',
        password: 'password123',
        role: 'artLover',
        bio: 'Art collector and patron supporting traditional Indian art forms.',
        title: 'Art Enthusiast & Collector',
        location: 'Ahmedabad, Gujarat',
        followingCount: 3,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
    },
];

const follows = [
    { follower: 'user_5', followee: 'user_1' },
    { follower: 'user_5', followee: 'user_2' },
    { follower: 'user_5', followee: 'user_3' },
    { follower: 'user_1', followee: 'user_3' },
    { follower: 'user_3', followee: 'user_1' },
];

const posts = [
    {
        _id: 'post_1',
        author: 'user_1',
        postType: 'performance',
        text: 'Just finished an incredible Kathak recital at NCPA! The audience was amazing. #Kathak #ClassicalDance #NCPA',
        hashtags: ['kathak', 'classicaldance', 'ncpa'],
        likeCount: 42,
        commentCount: 8,
        shareCount: 5,
        media: [{ url: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=600', type: 'image' }],
        createdAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
    },
    {
        _id: 'post_2',
        author: 'user_2',
        postType: 'craft',
        text: 'New collection of blue pottery vases inspired by Mughal garden motifs. #BluePottery #Jaipur #Crafts',
        hashtags: ['bluepottery', 'jaipur', 'crafts'],
        likeCount: 35,
        commentCount: 12,
        shareCount: 2,
        media: [{ url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600', type: 'image' }],
        createdAt: new Date(now - 1000 * 60 * 60 * 14).toISOString(),
    },
    {
        _id: 'post_3',
        author: 'user_3',
        postType: 'workshop',
        text: 'Announcing a 3-day Bharatanatyam workshop in Chennai! Limited seats. Register now. #Bharatanatyam #Workshop',
        hashtags: ['bharatanatyam', 'workshop'],
        likeCount: 56,
        commentCount: 15,
        shareCount: 4,
        embeddedEvent: {
            month: 'MAR',
            date: '15',
            title: 'Bharatanatyam Intensive',
            location: 'Chennai',
            time: '10 AM - 5 PM',
        },
        createdAt: new Date(now - 1000 * 60 * 60 * 20).toISOString(),
    },
    {
        _id: 'post_4',
        author: 'user_4',
        postType: 'craft',
        text: 'Block printing process from start to finish. Preserving 300-year old techniques. #BlockPrint #TextileArt',
        hashtags: ['blockprint', 'textileart'],
        likeCount: 28,
        commentCount: 6,
        shareCount: 1,
        media: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600', type: 'image' }],
        createdAt: new Date(now - 1000 * 60 * 60 * 32).toISOString(),
    },
];

const commentsByPost = {
    post_1: [
        {
            _id: 'comment_1',
            user: { _id: 'user_5', fullName: 'Meera Patel', avatar: users[4].avatar },
            text: 'This looks amazing. Congratulations!',
            createdAt: new Date(now - 1000 * 60 * 20).toISOString(),
        },
    ],
    post_2: [],
    post_3: [],
    post_4: [],
};

const products = [
    {
        _id: 'product_1',
        seller: 'user_2',
        name: 'Handcrafted Blue Pottery Vase',
        category: 'pottery',
        price: 2499,
        originalPrice: 3499,
        description: 'Authentic Jaipur blue pottery vase with floral motifs.',
        images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500'],
        region: 'Rajasthan',
        stock: 8,
        badge: 'Bestseller',
        rating: 4.7,
        reviewCount: 23,
    },
    {
        _id: 'product_2',
        seller: 'user_4',
        name: 'Block Print Cotton Dupatta',
        category: 'textiles',
        price: 1299,
        originalPrice: 1899,
        description: 'Hand block printed cotton dupatta with natural dyes.',
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500'],
        region: 'Rajasthan',
        stock: 15,
        badge: 'New Arrival',
        rating: 4.5,
        reviewCount: 12,
    },
    {
        _id: 'product_3',
        seller: 'user_2',
        name: 'Terracotta Wall Hanging',
        category: 'pottery',
        price: 1899,
        description: 'Traditional terracotta wall art handcrafted by artisans.',
        images: ['https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=500'],
        region: 'Rajasthan',
        stock: 5,
        badge: 'Only 5 left',
        rating: 4.8,
        reviewCount: 9,
    },
    {
        _id: 'product_4',
        seller: 'user_4',
        name: 'Bandhani Silk Saree',
        category: 'textiles',
        price: 4999,
        originalPrice: 6999,
        description: 'Exquisite Bandhani tie-dye silk saree from Gujarat.',
        images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500'],
        region: 'Gujarat',
        stock: 3,
        rating: 4.9,
        reviewCount: 7,
    },
];

const events = [
    {
        _id: 'event_1',
        organizer: 'user_1',
        title: 'Kathak Mahotsav 2026',
        category: 'festival',
        artForm: 'Kathak',
        description: 'Annual Kathak festival featuring top dancers from across India.',
        startDate: '2026-04-15T00:00:00.000Z',
        endDate: '2026-04-17T00:00:00.000Z',
        time: '6:00 PM',
        venue: 'Kamani Auditorium, New Delhi',
        eventType: 'paid',
        ticketTiers: [
            { name: 'General', price: 500, totalQty: 200, soldQty: 45 },
            { name: 'VIP', price: 2000, totalQty: 50, soldQty: 12 },
        ],
        status: 'published',
        coverImage: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800',
    },
    {
        _id: 'event_2',
        organizer: 'user_3',
        title: 'South Indian Classical Dance Workshop',
        category: 'workshop',
        artForm: 'Bharatanatyam',
        description: 'Intensive 2-day workshop for intermediate dancers.',
        startDate: '2026-03-20T00:00:00.000Z',
        endDate: '2026-03-21T00:00:00.000Z',
        time: '10:00 AM',
        venue: 'Kalakshetra, Chennai',
        eventType: 'paid',
        ticketTiers: [{ name: 'Workshop Pass', price: 3000, totalQty: 30, soldQty: 18 }],
        status: 'published',
        coverImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
    },
    {
        _id: 'event_3',
        organizer: 'user_2',
        title: 'Pottery & Chai Evening',
        category: 'exhibition',
        artForm: 'Pottery',
        description: 'An evening of live pottery demonstration with tea tasting.',
        startDate: '2026-03-25T00:00:00.000Z',
        time: '5:00 PM',
        venue: 'Jawahar Kala Kendra, Jaipur',
        eventType: 'free',
        maxAttendees: 100,
        status: 'published',
        coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
    },
];

const opportunities = [
    {
        _id: 'opp_1',
        organizer: 'user_1',
        title: 'Kathak Performers for Cultural Festival',
        type: 'performance',
        artForm: 'Kathak',
        location: 'Delhi',
        description: 'Looking for 3 experienced Kathak dancers for a 2-day cultural festival.',
        payType: 'fixed',
        payAmount: { min: 15000, max: 25000 },
        deadline: '2026-04-01T00:00:00.000Z',
        slots: 3,
        status: 'open',
        applicationCount: 8,
        tags: ['Kathak', 'Performance', 'Festival'],
    },
    {
        _id: 'opp_2',
        organizer: 'user_3',
        title: 'Dance Instructor for Summer Program',
        type: 'teaching',
        artForm: 'Classical Dance',
        location: 'Chennai',
        isRemote: false,
        description: 'Seeking a dance instructor for a 4-week summer program for children.',
        payType: 'stipend',
        payAmount: { min: 20000, max: 30000 },
        deadline: '2026-05-01T00:00:00.000Z',
        slots: 1,
        status: 'open',
        applicationCount: 12,
        tags: ['Teaching', 'Classical Dance', 'Children'],
    },
];

const campaigns = [
    {
        _id: 'campaign_1',
        creator: 'user_2',
        title: 'Save Jaipur Blue Pottery',
        shortDescription: 'Help preserve the 300-year-old tradition of Jaipur blue pottery.',
        fullStory: '<p>Blue pottery is a dying art form...</p>',
        category: 'heritage',
        location: 'Jaipur, Rajasthan',
        goalAmount: 500000,
        raisedAmount: 325000,
        backerCount: 142,
        deadline: '2026-05-01T00:00:00.000Z',
        duration: 45,
        status: 'active',
        coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
        rewardTiers: [
            { name: 'Rasa', amount: 500, perks: ['Thank you card', 'Name in credits'] },
            { name: 'Kala', amount: 2000, perks: ['All Rasa perks', 'Handmade pottery piece'] },
            { name: 'Guru', amount: 5000, perks: ['All Kala perks', 'Visit to workshop', 'Custom pottery set'] },
        ],
        tags: ['pottery', 'heritage', 'rajasthan'],
    },
    {
        _id: 'campaign_2',
        creator: 'user_4',
        title: 'Block Printing Revival Project',
        shortDescription: 'Supporting artisan families preserving traditional block printing.',
        category: 'textiles',
        location: 'Bagru, Rajasthan',
        goalAmount: 300000,
        raisedAmount: 180000,
        backerCount: 89,
        deadline: '2026-04-15T00:00:00.000Z',
        duration: 30,
        status: 'active',
        coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
        rewardTiers: [
            { name: 'Rasa', amount: 500, perks: ['Thank you note'] },
            { name: 'Kala', amount: 2000, perks: ['Handmade block print fabric'] },
        ],
        tags: ['textiles', 'block-printing', 'artisans'],
    },
];

const notifications = [
    {
        _id: 'notif_1',
        user: 'user_5',
        type: 'booking',
        title: 'Ticket Confirmed',
        message: 'Your event booking has been confirmed.',
        isRead: false,
        createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
    },
    {
        _id: 'notif_2',
        user: 'user_5',
        type: 'social',
        title: 'New Post from Ananya',
        message: 'Ananya shared a new performance post.',
        isRead: false,
        createdAt: new Date(now - 1000 * 60 * 100).toISOString(),
    },
];

const conversations = [
    {
        _id: 'conv_1',
        participants: ['user_5', 'user_2'],
        unreadBy: ['user_5'],
        updatedAt: new Date(now - 1000 * 60 * 80).toISOString(),
    },
];

const messagesByConversation = {
    conv_1: [
        {
            _id: 'msg_1',
            sender: 'user_2',
            text: 'Hi, your order has been packed and shipped.',
            createdAt: new Date(now - 1000 * 60 * 90).toISOString(),
        },
        {
            _id: 'msg_2',
            sender: 'user_5',
            text: 'Great, thank you.',
            createdAt: new Date(now - 1000 * 60 * 70).toISOString(),
        },
    ],
};

let orders = [
    {
        _id: 'order_1',
        orderId: 'ORD-1001',
        buyer: 'user_5',
        type: 'product',
        status: 'confirmed',
        items: [
            {
                _id: 'order_item_1',
                product: 'product_1',
                quantity: 1,
                price: 2499,
            },
        ],
        seller: 'user_2',
        totalAmount: 2499,
        createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    },
];

const cart = {
    _id: 'cart_1',
    user: 'user_5',
    items: [
        { _id: 'cart_item_1', product: 'product_2', quantity: 1 },
        { _id: 'cart_item_2', product: 'product_3', quantity: 2 },
    ],
};

const wishlistByUser = {
    user_5: ['product_1', 'campaign_1'],
};

const sponsorTiers = [
    { _id: 'tier_1', name: 'Bronze Sponsor', minAmount: 5000, perks: ['Name mention', 'Certificate'] },
    { _id: 'tier_2', name: 'Silver Sponsor', minAmount: 25000, perks: ['Logo placement', 'Social shoutout'] },
    { _id: 'tier_3', name: 'Gold Sponsor', minAmount: 100000, perks: ['Stage mention', 'VIP invite'] },
];

const tokenToUserId = new Map();
const likesByUser = {};

function safeUser(user) {
    if (!user) return null;
    const { password, ...clean } = user;
    return clean;
}

function getUserById(id) {
    return users.find((u) => String(u._id) === String(id));
}

function parseToken(req) {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return null;
    return header.slice('Bearer '.length);
}

function getCurrentUser(req) {
    const token = parseToken(req);
    const uid = tokenToUserId.get(token);
    return getUserById(uid) || users[4];
}

function ensureAuth(req, res, next) {
    const token = parseToken(req);
    const uid = tokenToUserId.get(token);
    if (!uid) {
        return res.status(401).json({
            status: 'fail',
            message: 'Unauthorized',
        });
    }
    req.user = getUserById(uid);
    return next();
}

function success(res, data, message = 'OK') {
    return res.json({ status: 'success', message, data });
}

function withAuthor(post) {
    return {
        ...post,
        author: safeUser(getUserById(post.author)),
    };
}

function withSeller(product) {
    return {
        ...product,
        seller: safeUser(getUserById(product.seller)),
    };
}

function withOrganizer(item) {
    return {
        ...item,
        organizer: safeUser(getUserById(item.organizer)),
    };
}

function withCreator(campaign) {
    return {
        ...campaign,
        creator: safeUser(getUserById(campaign.creator)),
    };
}

function cartWithProducts() {
    return {
        ...cart,
        items: cart.items.map((item) => ({
            ...item,
            product: withSeller(products.find((p) => p._id === item.product)),
            total: (products.find((p) => p._id === item.product)?.price || 0) * item.quantity,
        })),
    };
}

function orderExpanded(order) {
    return {
        ...order,
        buyer: safeUser(getUserById(order.buyer)),
        seller: safeUser(getUserById(order.seller)),
        items: order.items.map((it) => {
            const product = products.find((p) => p._id === it.product);
            return {
                ...it,
                product: product ? withSeller(product) : null,
            };
        }),
    };
}

function caseIncludes(value, q) {
    return String(value || '').toLowerCase().includes(String(q || '').toLowerCase());
}

app.get('/api/health', (req, res) => {
    return success(res, {
        server: 'KalaSetu Dummy Backend',
        timestamp: new Date().toISOString(),
    }, 'KalaSetu dummy API is running');
});

app.get('/', (req, res) => {
    return success(res, {
        name: 'KalaSetu Dummy Backend',
        api: '/api',
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    const user = users.find((u) => u.email === email);
    if (!user || user.password !== password) {
        return res.status(401).json({ status: 'fail', message: 'Invalid email or password' });
    }

    const token = `mock-token-${user._id}`;
    tokenToUserId.set(token, user._id);
    return success(res, { token, user: safeUser(user) }, 'Logged in');
});

app.post('/api/auth/register', (req, res) => {
    const { fullName, email, password, role = 'artLover' } = req.body || {};
    if (!fullName || !email || !password) {
        return res.status(400).json({ status: 'fail', message: 'fullName, email, and password are required' });
    }

    if (users.some((u) => u.email === email)) {
        return res.status(409).json({ status: 'fail', message: 'Email already exists' });
    }

    const newUser = {
        _id: makeId('user', users.length + 1),
        fullName,
        email,
        password,
        role,
        avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=300',
        followerCount: 0,
        followingCount: 0,
    };
    users.push(newUser);

    const token = `mock-token-${newUser._id}`;
    tokenToUserId.set(token, newUser._id);

    return success(res, { token, user: safeUser(newUser) }, 'Registered successfully');
});

app.get('/api/auth/me', ensureAuth, (req, res) => {
    return success(res, { user: safeUser(req.user) });
});

app.post('/api/auth/logout', (req, res) => {
    const token = parseToken(req);
    tokenToUserId.delete(token);
    return success(res, { loggedOut: true }, 'Logged out');
});

app.get('/api/posts', (req, res) => {
    const { type } = req.query;

    let postType = null;
    if (type === 'performances') postType = 'performance';
    if (type === 'crafts') postType = 'craft';
    if (type === 'workshops') postType = 'workshop';

    const filtered = postType ? posts.filter((p) => p.postType === postType) : posts;
    const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return success(res, { posts: sorted.map(withAuthor) });
});

app.post('/api/posts', upload.none(), (req, res) => {
    const user = getCurrentUser(req);
    const text = req.body?.text || 'New post from dummy backend';
    const newPost = {
        _id: makeId('post', posts.length + 1),
        author: user._id,
        postType: 'performance',
        text,
        hashtags: [],
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        media: [],
        createdAt: new Date().toISOString(),
    };
    posts.unshift(newPost);
    commentsByPost[newPost._id] = [];

    return success(res, { post: withAuthor(newPost) }, 'Post created');
});

app.post('/api/posts/:id/like', (req, res) => {
    const user = getCurrentUser(req);
    const post = posts.find((p) => p._id === req.params.id);
    if (!post) return res.status(404).json({ status: 'fail', message: 'Post not found' });

    likesByUser[user._id] = likesByUser[user._id] || new Set();
    const key = `${user._id}:${post._id}`;
    const wasLiked = likesByUser[user._id].has(key);
    if (wasLiked) {
        likesByUser[user._id].delete(key);
        post.likeCount = Math.max(0, post.likeCount - 1);
    } else {
        likesByUser[user._id].add(key);
        post.likeCount += 1;
    }

    return success(res, { likeCount: post.likeCount, isLiked: !wasLiked });
});

app.get('/api/posts/:id/comments', (req, res) => {
    return success(res, { comments: commentsByPost[req.params.id] || [] });
});

app.post('/api/posts/:id/comments', (req, res) => {
    const user = getCurrentUser(req);
    const post = posts.find((p) => p._id === req.params.id);
    if (!post) return res.status(404).json({ status: 'fail', message: 'Post not found' });

    const text = req.body?.text || '';
    if (!text.trim()) return res.status(400).json({ status: 'fail', message: 'Comment text is required' });

    const comment = {
        _id: makeId('comment', Object.values(commentsByPost).flat().length + 1),
        user: { _id: user._id, fullName: user.fullName, avatar: user.avatar },
        text,
        createdAt: new Date().toISOString(),
    };

    commentsByPost[post._id] = commentsByPost[post._id] || [];
    commentsByPost[post._id].push(comment);
    post.commentCount += 1;

    return success(res, { comment }, 'Comment added');
});

app.post('/api/posts/:id/share', (req, res) => {
    const post = posts.find((p) => p._id === req.params.id);
    if (!post) return res.status(404).json({ status: 'fail', message: 'Post not found' });
    post.shareCount += 1;
    return success(res, { shareCount: post.shareCount }, 'Post shared');
});

app.delete('/api/posts/:id', (req, res) => {
    const i = posts.findIndex((p) => p._id === req.params.id);
    if (i === -1) return res.status(404).json({ status: 'fail', message: 'Post not found' });
    posts.splice(i, 1);
    delete commentsByPost[req.params.id];
    return success(res, { deleted: true }, 'Post deleted');
});

app.put('/api/posts/:id', (req, res) => {
    const post = posts.find((p) => p._id === req.params.id);
    if (!post) return res.status(404).json({ status: 'fail', message: 'Post not found' });
    Object.assign(post, req.body || {});
    return success(res, { post: withAuthor(post) }, 'Post updated');
});

app.post('/api/posts/:id/report', (req, res) => {
    return success(res, { reported: true, reason: req.body?.reason || null }, 'Post reported');
});

app.post('/api/posts/:id/save', (req, res) => {
    return success(res, { saved: true }, 'Post saved');
});

app.get('/api/products/featured', (req, res) => {
    return success(res, { products: products.slice(0, 3).map(withSeller) });
});

app.get('/api/products/:id', (req, res) => {
    const product = products.find((p) => p._id === req.params.id);
    if (!product) return res.status(404).json({ status: 'fail', message: 'Product not found' });
    return success(res, { product: withSeller(product) });
});

app.get('/api/products', (req, res) => {
    const q = req.query?.q;
    const category = req.query?.category;
    let list = [...products];
    if (category) list = list.filter((p) => p.category === category);
    if (q) list = list.filter((p) => caseIncludes(p.name, q) || caseIncludes(p.description, q));
    return success(res, { products: list.map(withSeller) });
});

app.get('/api/events/upcoming', (req, res) => {
    return success(res, { events: events.slice(0, 2).map(withOrganizer) });
});

app.get('/api/events/:id', (req, res) => {
    const event = events.find((e) => e._id === req.params.id);
    if (!event) return res.status(404).json({ status: 'fail', message: 'Event not found' });
    return success(res, { event: withOrganizer(event) });
});

app.get('/api/events', (req, res) => {
    return success(res, { events: events.map(withOrganizer) });
});

app.post('/api/events/:id/book', (req, res) => {
    const event = events.find((e) => e._id === req.params.id);
    if (!event) return res.status(404).json({ status: 'fail', message: 'Event not found' });

    const quantity = Number(req.body?.quantity) || 1;
    const ticketTierName = req.body?.ticketTier || event.ticketTiers?.[0]?.name || 'General';
    const tier = event.ticketTiers?.find((t) => t.name === ticketTierName) || event.ticketTiers?.[0];
    const amount = (tier?.price || 0) * quantity;

    const order = {
        _id: makeId('order', orders.length + 1),
        orderId: `TKT-${1000 + orders.length + 1}`,
        buyer: getCurrentUser(req)._id,
        seller: event.organizer,
        type: 'event',
        status: 'confirmed',
        totalAmount: amount,
        items: [{ _id: makeId('order_item', orders.length + 1), event: event._id, quantity, price: tier?.price || 0 }],
        createdAt: new Date().toISOString(),
    };
    orders.unshift(order);

    return success(res, { order }, 'Ticket booked');
});

app.post('/api/events/:id/rsvp', (req, res) => {
    return success(res, { rsvp: true }, 'RSVP successful');
});

app.get('/api/opportunities/trending', (req, res) => {
    return success(res, { opportunities: opportunities.slice(0, 2).map(withOrganizer) });
});

app.get('/api/opportunities/:id', (req, res) => {
    const item = opportunities.find((o) => o._id === req.params.id);
    if (!item) return res.status(404).json({ status: 'fail', message: 'Opportunity not found' });
    return success(res, { opportunity: withOrganizer(item) });
});

app.get('/api/opportunities', (req, res) => {
    return success(res, { opportunities: opportunities.map(withOrganizer) });
});

app.post('/api/opportunities/:id/apply', (req, res) => {
    const item = opportunities.find((o) => o._id === req.params.id);
    if (!item) return res.status(404).json({ status: 'fail', message: 'Opportunity not found' });
    item.applicationCount += 1;
    return success(res, { applied: true, applicationCount: item.applicationCount }, 'Applied successfully');
});

app.post('/api/opportunities/:id/bookmark', (req, res) => {
    return success(res, { bookmarked: true }, 'Bookmark updated');
});

app.get('/api/campaigns/stats', (req, res) => {
    const totalRaised = campaigns.reduce((sum, c) => sum + c.raisedAmount, 0);
    const totalBackers = campaigns.reduce((sum, c) => sum + c.backerCount, 0);
    return success(res, {
        totalCampaigns: campaigns.length,
        totalRaised,
        totalBackers,
    });
});

app.get('/api/campaigns/top-funded', (req, res) => {
    const sorted = [...campaigns].sort((a, b) => b.raisedAmount - a.raisedAmount);
    return success(res, { campaigns: sorted.map(withCreator) });
});

app.get('/api/campaigns/sponsor-tiers', (req, res) => {
    return success(res, { tiers: sponsorTiers });
});

app.get('/api/campaigns/:id', (req, res) => {
    const campaign = campaigns.find((c) => c._id === req.params.id);
    if (!campaign) return res.status(404).json({ status: 'fail', message: 'Campaign not found' });
    return success(res, { campaign: withCreator(campaign) });
});

app.get('/api/campaigns', (req, res) => {
    return success(res, { campaigns: campaigns.map(withCreator) });
});

app.post('/api/campaigns/:id/back', (req, res) => {
    const campaign = campaigns.find((c) => c._id === req.params.id);
    if (!campaign) return res.status(404).json({ status: 'fail', message: 'Campaign not found' });

    const amount = Number(req.body?.amount) || 0;
    campaign.raisedAmount += amount;
    campaign.backerCount += 1;

    const contribution = {
        _id: makeId('contribution', campaign.backerCount),
        campaign: campaign._id,
        amount,
        rewardTier: req.body?.rewardTier || null,
        createdAt: new Date().toISOString(),
    };

    return success(res, { contribution, campaign: withCreator(campaign) }, 'Thanks for backing this campaign');
});

app.get('/api/orders/:id/tracking', (req, res) => {
    const order = orders.find((o) => o._id === req.params.id || o.orderId === req.params.id);
    if (!order) return res.status(404).json({ status: 'fail', message: 'Order not found' });

    return success(res, {
        orderId: order.orderId,
        status: order.status,
        checkpoints: [
            { label: 'Order placed', at: order.createdAt, done: true },
            { label: 'Packed', at: new Date(Date.parse(order.createdAt) + 3600000).toISOString(), done: true },
            { label: 'Shipped', at: new Date(Date.parse(order.createdAt) + 7200000).toISOString(), done: true },
            { label: 'Delivered', at: null, done: false },
        ],
    });
});

app.get('/api/orders/:id/ticket', (req, res) => {
    const order = orders.find((o) => o._id === req.params.id || o.orderId === req.params.id);
    if (!order) return res.status(404).json({ status: 'fail', message: 'Order not found' });

    return success(res, {
        orderId: order.orderId,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(order.orderId)}`,
        entryNote: 'Show this ticket at event entry.',
    });
});

app.post('/api/orders/:id/review', (req, res) => {
    return success(res, {
        review: {
            _id: makeId('review', Math.floor(Math.random() * 1000)),
            rating: Number(req.body?.rating) || 5,
            text: req.body?.text || '',
        },
    }, 'Review submitted');
});

app.get('/api/orders/:id', (req, res) => {
    const order = orders.find((o) => o._id === req.params.id || o.orderId === req.params.id);
    if (!order) return res.status(404).json({ status: 'fail', message: 'Order not found' });
    return success(res, { order: orderExpanded(order) });
});

app.get('/api/orders', (req, res) => {
    return success(res, { orders: orders.map(orderExpanded) });
});

app.get('/api/users/me/settings', (req, res) => {
    return success(res, { user: safeUser(getCurrentUser(req)) });
});

app.put('/api/users/me/avatar', upload.none(), (req, res) => {
    const user = getCurrentUser(req);
    user.avatar = req.body?.avatar || user.avatar;
    return success(res, { user: safeUser(user) }, 'Avatar updated');
});

app.put('/api/users/me/profile', (req, res) => {
    const user = getCurrentUser(req);
    Object.assign(user, req.body || {});
    return success(res, { user: safeUser(user) }, 'Profile updated');
});

app.put('/api/users/me/password', (req, res) => {
    const user = getCurrentUser(req);
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword || user.password !== currentPassword) {
        return res.status(400).json({ status: 'fail', message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    return success(res, { updated: true }, 'Password updated');
});

app.put('/api/users/me/notifications', (req, res) => {
    return success(res, { preferences: req.body || {} }, 'Notification settings updated');
});

app.put('/api/users/me/privacy', (req, res) => {
    return success(res, { privacy: req.body || {} }, 'Privacy settings updated');
});

app.put('/api/users/me/payout', (req, res) => {
    return success(res, { payout: req.body || {} }, 'Payout settings updated');
});

app.get('/api/users/:id/portfolio', (req, res) => {
    const userPosts = posts.filter((p) => String(p.author) === String(req.params.id)).map(withAuthor);
    return success(res, { posts: userPosts, portfolio: userPosts });
});

app.get('/api/users/:id/reviews', (req, res) => {
    const target = getUserById(req.params.id);
    if (!target) return res.status(404).json({ status: 'fail', message: 'User not found' });

    const reviews = [
        {
            _id: 'review_1',
            user: { _id: 'user_5', fullName: 'Meera Patel' },
            rating: 5,
            text: `Wonderful experience working with ${target.fullName}.`,
            createdAt: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
        },
    ];

    return success(res, { reviews });
});

app.post('/api/users/:id/follow', (req, res) => {
    const me = getCurrentUser(req);
    const target = getUserById(req.params.id);
    if (!target) return res.status(404).json({ status: 'fail', message: 'User not found' });

    const idx = follows.findIndex((f) => f.follower === me._id && f.followee === target._id);
    let isFollowing = false;

    if (idx >= 0) {
        follows.splice(idx, 1);
        target.followerCount = Math.max(0, (target.followerCount || 0) - 1);
        me.followingCount = Math.max(0, (me.followingCount || 0) - 1);
        isFollowing = false;
    } else {
        follows.push({ follower: me._id, followee: target._id });
        target.followerCount = (target.followerCount || 0) + 1;
        me.followingCount = (me.followingCount || 0) + 1;
        isFollowing = true;
    }

    return success(res, { isFollowing, followerCount: target.followerCount });
});

app.get('/api/users/:id', (req, res) => {
    const user = getUserById(req.params.id);
    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });
    return success(res, { user: safeUser(user) });
});

app.get('/api/artists/featured', (req, res) => {
    const artists = users.filter((u) => u.role === 'artist').slice(0, 3).map(safeUser);
    return success(res, { artists });
});

app.get('/api/artists', (req, res) => {
    const artists = users.filter((u) => u.role === 'artist').map(safeUser);
    return success(res, { artists });
});

app.get('/api/notifications/unread-count', (req, res) => {
    const me = getCurrentUser(req);
    const count = notifications.filter((n) => n.user === me._id && !n.isRead).length;
    return success(res, { count });
});

app.put('/api/notifications/mark-all-read', (req, res) => {
    const me = getCurrentUser(req);
    notifications.forEach((n) => {
        if (n.user === me._id) n.isRead = true;
    });
    return success(res, { markedAll: true });
});

app.put('/api/notifications/:id/read', (req, res) => {
    const n = notifications.find((x) => x._id === req.params.id);
    if (!n) return res.status(404).json({ status: 'fail', message: 'Notification not found' });
    n.isRead = true;
    return success(res, { notification: n }, 'Notification marked as read');
});

app.delete('/api/notifications/:id', (req, res) => {
    const i = notifications.findIndex((n) => n._id === req.params.id);
    if (i === -1) return res.status(404).json({ status: 'fail', message: 'Notification not found' });
    notifications.splice(i, 1);
    return success(res, { deleted: true });
});

app.delete('/api/notifications', (req, res) => {
    const me = getCurrentUser(req);
    for (let i = notifications.length - 1; i >= 0; i -= 1) {
        if (notifications[i].user === me._id) notifications.splice(i, 1);
    }
    return success(res, { cleared: true });
});

app.get('/api/notifications', (req, res) => {
    const me = getCurrentUser(req);
    return success(res, {
        notifications: notifications
            .filter((n) => n.user === me._id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    });
});

app.get('/api/conversations/unread-count', (req, res) => {
    const me = getCurrentUser(req);
    const count = conversations.filter((c) => c.unreadBy.includes(me._id)).length;
    return success(res, { count });
});

app.post('/api/conversations', (req, res) => {
    const me = getCurrentUser(req);
    const recipientId = req.body?.recipientId;
    if (!recipientId || !getUserById(recipientId)) {
        return res.status(400).json({ status: 'fail', message: 'Valid recipientId is required' });
    }

    let conv = conversations.find(
        (c) => c.participants.includes(me._id) && c.participants.includes(recipientId),
    );

    if (!conv) {
        conv = {
            _id: makeId('conv', conversations.length + 1),
            participants: [me._id, recipientId],
            unreadBy: [recipientId],
            updatedAt: new Date().toISOString(),
        };
        conversations.unshift(conv);
        messagesByConversation[conv._id] = [];
    }

    const text = (req.body?.message || '').trim();
    if (text) {
        const msg = {
            _id: makeId('msg', (messagesByConversation[conv._id] || []).length + 1),
            sender: me._id,
            text,
            createdAt: new Date().toISOString(),
        };
        messagesByConversation[conv._id].push(msg);
    }

    return success(res, { conversation: conv }, 'Conversation ready');
});

app.get('/api/conversations/:id/messages', (req, res) => {
    return success(res, { messages: messagesByConversation[req.params.id] || [] });
});

app.put('/api/conversations/:id/read', (req, res) => {
    const me = getCurrentUser(req);
    const conv = conversations.find((c) => c._id === req.params.id);
    if (!conv) return res.status(404).json({ status: 'fail', message: 'Conversation not found' });

    conv.unreadBy = conv.unreadBy.filter((id) => id !== me._id);
    return success(res, { conversation: conv }, 'Conversation marked read');
});

app.post('/api/conversations/:id/messages', (req, res) => {
    const me = getCurrentUser(req);
    const conv = conversations.find((c) => c._id === req.params.id);
    if (!conv) return res.status(404).json({ status: 'fail', message: 'Conversation not found' });

    const text = (req.body?.text || '').trim();
    if (!text) return res.status(400).json({ status: 'fail', message: 'Message text is required' });

    const message = {
        _id: makeId('msg', (messagesByConversation[conv._id] || []).length + 1),
        sender: me._id,
        text,
        createdAt: new Date().toISOString(),
    };

    messagesByConversation[conv._id] = messagesByConversation[conv._id] || [];
    messagesByConversation[conv._id].push(message);
    conv.updatedAt = new Date().toISOString();

    for (const participant of conv.participants) {
        if (participant !== me._id && !conv.unreadBy.includes(participant)) conv.unreadBy.push(participant);
    }

    return success(res, { message }, 'Message sent');
});

app.get('/api/conversations', (req, res) => {
    const me = getCurrentUser(req);

    const data = conversations
        .filter((c) => c.participants.includes(me._id))
        .map((c) => {
            const otherId = c.participants.find((id) => id !== me._id);
            const lastMessage = (messagesByConversation[c._id] || []).slice(-1)[0] || null;
            return {
                ...c,
                participant: safeUser(getUserById(otherId)),
                lastMessage,
            };
        })
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return success(res, { conversations: data });
});

app.get('/api/cart', (req, res) => {
    return success(res, { cart: cartWithProducts() });
});

app.post('/api/cart/add', (req, res) => {
    const { productId, quantity = 1 } = req.body || {};
    const product = products.find((p) => p._id === productId);
    if (!product) return res.status(404).json({ status: 'fail', message: 'Product not found' });

    const existing = cart.items.find((i) => i.product === productId);
    if (existing) existing.quantity += Number(quantity) || 1;
    else cart.items.push({ _id: makeId('cart_item', cart.items.length + 1), product: productId, quantity: Number(quantity) || 1 });

    return success(res, { cart: cartWithProducts() }, 'Added to cart');
});

app.put('/api/cart/:itemId', (req, res) => {
    const item = cart.items.find((i) => i._id === req.params.itemId);
    if (!item) return res.status(404).json({ status: 'fail', message: 'Cart item not found' });
    item.quantity = Math.max(1, Number(req.body?.quantity) || 1);
    return success(res, { cart: cartWithProducts() }, 'Cart updated');
});

app.delete('/api/cart/:itemId', (req, res) => {
    const i = cart.items.findIndex((item) => item._id === req.params.itemId);
    if (i === -1) return res.status(404).json({ status: 'fail', message: 'Cart item not found' });
    cart.items.splice(i, 1);
    return success(res, { cart: cartWithProducts() }, 'Item removed');
});

app.post('/api/cart/checkout', (req, res) => {
    const me = getCurrentUser(req);
    if (!cart.items.length) return res.status(400).json({ status: 'fail', message: 'Cart is empty' });

    const expanded = cartWithProducts();
    const total = expanded.items.reduce((sum, item) => sum + item.total, 0);
    const firstSeller = expanded.items[0]?.product?.seller?._id || 'user_2';

    const order = {
        _id: makeId('order', orders.length + 1),
        orderId: `ORD-${1000 + orders.length + 1}`,
        buyer: me._id,
        seller: firstSeller,
        type: 'product',
        status: 'confirmed',
        items: expanded.items.map((it) => ({
            _id: it._id,
            product: it.product._id,
            quantity: it.quantity,
            price: it.product.price,
        })),
        totalAmount: total,
        createdAt: new Date().toISOString(),
    };

    orders.unshift(order);
    cart.items = [];

    return success(res, { order }, 'Checkout successful');
});

app.get('/api/wishlist', (req, res) => {
    const me = getCurrentUser(req);
    const ids = wishlistByUser[me._id] || [];

    const productsInWishlist = ids
        .map((id) => products.find((p) => p._id === id))
        .filter(Boolean)
        .map(withSeller);

    const campaignsInWishlist = ids
        .map((id) => campaigns.find((c) => c._id === id))
        .filter(Boolean)
        .map(withCreator);

    return success(res, {
        items: ids,
        products: productsInWishlist,
        campaigns: campaignsInWishlist,
    });
});

app.post('/api/wishlist/toggle', (req, res) => {
    const me = getCurrentUser(req);
    const productId = req.body?.productId;
    if (!productId) return res.status(400).json({ status: 'fail', message: 'productId is required' });

    wishlistByUser[me._id] = wishlistByUser[me._id] || [];
    const ids = wishlistByUser[me._id];
    const i = ids.indexOf(productId);
    let isWishlisted = false;

    if (i >= 0) {
        ids.splice(i, 1);
        isWishlisted = false;
    } else {
        ids.push(productId);
        isWishlisted = true;
    }

    return success(res, { isWishlisted, wishlist: ids }, 'Wishlist updated');
});

app.get('/api/search', (req, res) => {
    const q = String(req.query?.q || '').trim();
    if (!q) {
        return success(res, { users: [], posts: [], products: [], events: [], opportunities: [], campaigns: [] });
    }

    const userResults = users.filter((u) => caseIncludes(u.fullName, q) || caseIncludes(u.primaryArtForm, q)).map(safeUser);
    const postResults = posts.filter((p) => caseIncludes(p.text, q) || p.hashtags.some((h) => caseIncludes(h, q))).map(withAuthor);
    const productResults = products.filter((p) => caseIncludes(p.name, q) || caseIncludes(p.description, q)).map(withSeller);
    const eventResults = events.filter((e) => caseIncludes(e.title, q) || caseIncludes(e.artForm, q)).map(withOrganizer);
    const opportunityResults = opportunities.filter((o) => caseIncludes(o.title, q) || caseIncludes(o.artForm, q)).map(withOrganizer);
    const campaignResults = campaigns.filter((c) => caseIncludes(c.title, q) || c.tags.some((t) => caseIncludes(t, q))).map(withCreator);

    return success(res, {
        users: userResults,
        posts: postResults,
        products: productResults,
        events: eventResults,
        opportunities: opportunityResults,
        campaigns: campaignResults,
    });
});

app.post('/api/payments/process', (req, res) => {
    const amount = Number(req.body?.amount) || 0;
    const type = req.body?.type || 'generic';

    return success(res, {
        paymentId: `PAY-${Date.now()}`,
        amount,
        type,
        status: 'success',
    }, 'Payment processed in dummy mode');
});

app.use((req, res) => {
    return res.status(404).json({
        status: 'fail',
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

app.listen(PORT, () => {
    console.log('---------------------------------------------');
    console.log(`KalaSetu dummy backend is running on ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log('Test logins:');
    console.log('  ananya@kalasetu.com / password123');
    console.log('  rajesh@kalasetu.com / password123');
    console.log('  priya@kalasetu.com / password123');
    console.log('  vikram@kalasetu.com / password123');
    console.log('  meera@kalasetu.com / password123');
    console.log('---------------------------------------------');
});
