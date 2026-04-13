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

module.exports = { slugify, extractHashtags };