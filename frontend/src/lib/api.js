const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('kalasetu_token');
}

async function request(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.message || 'Something went wrong');
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data;
}

export const authAPI = {
    login: (email, password, rememberMe = false) =>
        request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, rememberMe }),
        }),
    register: (fullName, email, password, role) =>
        request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ fullName, email, password, role }),
        }),
    getMe: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),
};

export const postAPI = {
    getPosts: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/posts${qs ? `?${qs}` : ''}`);
    },
    createPost: (formData) =>
        request('/posts', { method: 'POST', body: formData }),
    toggleLike: (id) =>
        request(`/posts/${id}/like`, { method: 'POST' }),
    getComments: (id) => request(`/posts/${id}/comments`),
    addComment: (id, text) =>
        request(`/posts/${id}/comments`, {
            method: 'POST',
            body: JSON.stringify({ text }),
        }),
    sharePost: (id) =>
        request(`/posts/${id}/share`, { method: 'POST' }),
    deletePost: (id) =>
        request(`/posts/${id}`, { method: 'DELETE' }),
    updatePost: (id, data) =>
        request(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    reportPost: (id, reason = '') =>
        request(`/posts/${id}/report`, { method: 'POST', body: JSON.stringify({ reason }) }),
    savePost: (id) =>
        request(`/posts/${id}/save`, { method: 'POST' }),
};

export const productAPI = {
    getProducts: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/products${qs ? `?${qs}` : ''}`);
    },
    getFeatured: () => request('/products/featured'),
    getProduct: (id) => request(`/products/${id}`),
};

export const eventAPI = {
    getEvents: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/events${qs ? `?${qs}` : ''}`);
    },
    getUpcoming: () => request('/events/upcoming'),
    getEvent: (id) => request(`/events/${id}`),
    bookTicket: (id, quantity = 1) =>
        request(`/events/${id}/book`, {
            method: 'POST',
            body: JSON.stringify({ quantity }),
        }),
    rsvpEvent: (id) => request(`/events/${id}/rsvp`, { method: 'POST' }),
    createEvent: (data) =>
        request(`/events`, { method: 'POST', body: JSON.stringify(data) }),
};

export const opportunityAPI = {
    getOpportunities: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/opportunities${qs ? `?${qs}` : ''}`);
    },
    getTrending: () => request('/opportunities/trending'),
    apply: (id, coverLetter) =>
        request(`/opportunities/${id}/apply`, {
            method: 'POST',
            body: JSON.stringify({ coverLetter }),
        }),
    toggleBookmark: (id) =>
        request(`/opportunities/${id}/bookmark`, { method: 'POST' }),
};

export const campaignAPI = {
    getCampaigns: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/campaigns${qs ? `?${qs}` : ''}`);
    },
    getStats: () => request('/campaigns/stats'),
    getTopFunded: () => request('/campaigns/top-funded'),
    getCampaign: (id) => request(`/campaigns/${id}`),
    back: (id, amount, rewardTier) =>
        request(`/campaigns/${id}/back`, {
            method: 'POST',
            body: JSON.stringify({ amount, rewardTier }),
        }),
    getSponsorTiers: () => request('/campaigns/sponsor-tiers'),
};

export const orderAPI = {
    getOrders: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/orders${qs ? `?${qs}` : ''}`);
    },
    getOrder: (id) => request(`/orders/${id}`),
    getTracking: (id) => request(`/orders/${id}/tracking`),
    getTicket: (id) => request(`/orders/${id}/ticket`),
    submitReview: (id, rating, text) =>
        request(`/orders/${id}/review`, {
            method: 'POST',
            body: JSON.stringify({ rating, text }),
        }),
};

export const userAPI = {
    getProfile: (id) => request(`/users/${id}`),
    getPortfolio: (id) => request(`/users/${id}/portfolio`),
    getReviews: (id) => request(`/users/${id}/reviews`),
    getSettings: () => request('/users/me/settings'),
    updateAvatar: (formData) =>
        request('/users/me/avatar', { method: 'PUT', body: formData }),
    updateProfile: (data) =>
        request('/users/me/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    updatePassword: (currentPassword, newPassword) =>
        request('/users/me/password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword }),
        }),
    updateNotifications: (data) =>
        request('/users/me/notifications', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    updatePrivacy: (data) =>
        request('/users/me/privacy', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    updatePayout: (data) =>
        request('/users/me/payout', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    toggleFollow: (id) =>
        request(`/users/${id}/follow`, { method: 'POST' }),
};

export const artistAPI = {
    getArtists: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/artists${qs ? `?${qs}` : ''}`);
    },
    getFeatured: () => request('/artists/featured'),
};

export const notificationAPI = {
    getNotifications: () => request('/notifications'),
    getUnreadCount: () => request('/notifications/unread-count'),
    markAllRead: () => request('/notifications/mark-all-read', { method: 'PUT' }),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
    deleteNotification: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),
    clearAll: () => request('/notifications', { method: 'DELETE' }),
};

export const conversationAPI = {
    getConversations: () => request('/conversations'),
    getUnreadCount: () => request('/conversations/unread-count'),
    startConversation: (recipientId, message = '') =>
        request('/conversations', {
            method: 'POST',
            body: JSON.stringify({ recipientId, message }),
        }),
    getMessages: (id) => request(`/conversations/${id}/messages`),
    markRead: (id) => request(`/conversations/${id}/read`, { method: 'PUT' }),
    sendMessage: (id, text) =>
        request(`/conversations/${id}/messages`, {
            method: 'POST',
            body: JSON.stringify({ text }),
        }),
};

export const cartAPI = {
    getCart: () => request('/cart'),
    addItem: (productId, quantity = 1) =>
        request('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity }),
        }),
    updateItem: (itemId, quantity) =>
        request(`/cart/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity }),
        }),
    removeItem: (itemId) =>
        request(`/cart/${itemId}`, { method: 'DELETE' }),
    checkout: () => request('/cart/checkout', { method: 'POST' }),
};

export const wishlistAPI = {
    getWishlist: () => request('/wishlist'),
    toggleWishlist: (productId) =>
        request('/wishlist/toggle', {
            method: 'POST',
            body: JSON.stringify({ productId }),
        }),
};

export const searchAPI = {
    search: (q) => request(`/search?q=${encodeURIComponent(q)}`),
};

export const mediaAPI = {
    upload: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return request('/media/upload', { method: 'POST', body: formData });
    },
};

export const paymentAPI = {
    processPayment: (amount, type) =>
        request('/payments/process', {
            method: 'POST',
            body: JSON.stringify({ amount, type }),
        }),
};
