const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

// extract hashtags from string
const extractHashtags = (text) => {
    if (!text) return [];
    const matches = text.match(/#(\w+)/g);
    return matches ? matches.map((tag) => tag.replace('#', '').toLowerCase()) : [];
};

// makes order id like KS-YYYYMMDD-XXX
const generateOrderId = () => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(Math.random() * 900 + 100);
    return `KS-${date}-${rand}`;
};

module.exports = { slugify, extractHashtags, generateOrderId };