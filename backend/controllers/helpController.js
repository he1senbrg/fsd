const catchAsync = require('../utils/catchAsync');

const faqs = [
  {
    id: 1,
    category: 'general',
    question: 'What is KalaSetu?',
    answer:
      'KalaSetu is a digital platform connecting Indian artists with art lovers, sponsors, and organizers.',
  },
  {
    id: 2,
    category: 'marketplace',
    question: 'How do I sell my artwork?',
    answer:
      'Create an artist profile, then list your products in the marketplace with photos, description, and pricing.',
  },
  {
    id: 3,
    category: 'crowdfunding',
    question: 'How does crowdfunding work?',
    answer:
      'Create a campaign with your goal amount and duration. KalaSetu uses an all-or-nothing model — funds are only released if the goal is met.',
  },
  {
    id: 4,
    category: 'crowdfunding',
    question: 'What is the platform fee?',
    answer: 'KalaSetu charges a 5% platform fee on successful campaigns and marketplace sales.',
  },
  {
    id: 5,
    category: 'events',
    question: 'How do I create an event?',
    answer:
      'Go to Events > Create Event and fill in the details including date, venue, ticket tiers, and description.',
  },
  {
    id: 6,
    category: 'payments',
    question: 'When do I receive my payments?',
    answer:
      'For marketplace sales, payments are processed after delivery confirmation. For crowdfunding, funds are released after the campaign succeeds.',
  },
  {
    id: 7,
    category: 'account',
    question: 'How do I get verified?',
    answer:
      'Complete your profile (80%+ strength) and receive at least 5 reviews. Then request verification from your settings.',
  },
  {
    id: 8,
    category: 'booking',
    question: 'How do I book an artist?',
    answer:
      "Visit the artist's profile, check their availability calendar, and submit a booking request.",
  },
];

const helpCategories = [
  { slug: 'general', name: 'General', icon: '📋' },
  { slug: 'marketplace', name: 'Marketplace', icon: '🛍️' },
  { slug: 'crowdfunding', name: 'Crowdfunding', icon: '💰' },
  { slug: 'events', name: 'Events', icon: '🎭' },
  { slug: 'payments', name: 'Payments', icon: '💳' },
  { slug: 'account', name: 'Account', icon: '👤' },
  { slug: 'booking', name: 'Booking', icon: '📅' },
];

exports.getFaqs = catchAsync(async (req, res) => {
  let results = faqs;
  if (req.query.q) {
    const q = req.query.q.toLowerCase();
    results = faqs.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q),
    );
  }
  if (req.query.category) {
    results = results.filter((f) => f.category === req.query.category);
  }
  res.status(200).json({ status: 'success', data: { faqs: results } });
});

exports.getCategories = catchAsync(async (req, res) => {
  res.status(200).json({ status: 'success', data: { categories: helpCategories } });
});

exports.submitTicket = catchAsync(async (req, res) => {
  const { type, subject, message } = req.body;
  // fake for now
  console.log(`🎫 Support ticket: [${type}] ${subject} — ${message}`);
  res
    .status(201)
    .json({ status: 'success', message: "Support ticket submitted. We'll get back to you soon!" });
});
