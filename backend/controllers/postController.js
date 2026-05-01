const Post = require('../models/Post');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const { extractHashtags } = require('../utils/helpers');
const NotificationService = require('../services/NotificationService');

// GET /api/posts
exports.getPosts = catchAsync(async (req, res) => {
  let filter = {};

  // filter by type
  if (req.query.type && req.query.type !== 'all') {
    const typeMap = {
      performances: 'performance',
      crafts: 'craft',
      workshops: 'workshop',
    };
    filter.postType = typeMap[req.query.type] || req.query.type;
  }

  // feed: posts from followed users, trending
  if (req.user) {
    const follows = await Follow.find({ follower: req.user._id }).select('followee');
    const followedIds = follows.map((f) => f.followee);
    followedIds.push(req.user._id);

    if (followedIds.length > 1) {
      filter.$or = [
        { author: { $in: followedIds } },
        {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          likeCount: { $gte: 5 },
        },
      ];
    }
  }

  const posts = await Post.find(filter)
    .populate('author', 'fullName avatar title verified primaryArtForm')
    .populate('linkedProduct', 'name price images')
    .sort({ createdAt: -1 });

  let postsWithLikeStatus = posts;
  if (req.user) {
    const postIds = posts.map((p) => p._id);
    const likes = await Like.find({ user: req.user._id, post: { $in: postIds } });
    const likedPostIds = new Set(likes.map((l) => l.post.toString()));

    postsWithLikeStatus = posts.map((p) => ({
      ...p.toObject(),
      isLiked: likedPostIds.has(p._id.toString()),
    }));
  }

  res.status(200).json({
    status: 'success',
    data: { posts: postsWithLikeStatus },
  });
});

// POST /api/posts (create post)
exports.createPost = catchAsync(async (req, res) => {
  const { text, postType, embeddedEvent, linkedProduct } = req.body;

  const hashtags = extractHashtags(text);

  // handle uploaded media files
  const { uploadBuffer } = require('../utils/blobStorage');
  let media = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadBuffer(file.buffer, file.mimetype, 'posts');
      media.push({
        url: result.url,
        type: result.type,
        thumbnail: result.url,
      });
    }
  }

  const post = await Post.create({
    author: req.user._id,
    text,
    hashtags,
    media,
    postType: postType || 'general',
    embeddedEvent,
    linkedProduct,
  });

  const populatedPost = await Post.findById(post._id).populate(
    'author',
    'fullName avatar title verified',
  );

  res.status(201).json({
    status: 'success',
    data: { post: populatedPost },
  });
});

// GET /api/posts/:id (single post)
exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'fullName avatar title verified primaryArtForm')
    .populate('linkedProduct', 'name price images');

  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  let isLiked = false;
  if (req.user) {
    const like = await Like.findOne({ user: req.user._id, post: post._id });
    isLiked = !!like;
  }

  res.status(200).json({
    status: 'success',
    data: { post: { ...post.toObject(), isLiked } },
  });
});

// DELETE /api/posts/:id (delete own post)
exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  if (post.author.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only delete your own posts', 403));
  }

  await Post.deleteOne({ _id: post._id });

  await Like.deleteMany({ post: post._id });
  await Comment.deleteMany({ post: post._id });

  res.status(200).json({
    status: 'success',
    message: 'Post deleted',
  });
});

// POST /api/posts/:id/like (toggle like)
exports.toggleLike = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  const existingLike = await Like.findOne({ user: req.user._id, post: post._id });

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    const updated = await Post.findByIdAndUpdate(
      post._id,
      { $inc: { likeCount: -1 } },
      { new: true },
    );
    res
      .status(200)
      .json({ status: 'success', data: { isLiked: false, likeCount: updated.likeCount } });
  } else {
    await Like.create({ user: req.user._id, post: post._id });
    const updated = await Post.findByIdAndUpdate(
      post._id,
      { $inc: { likeCount: 1 } },
      { new: true },
    );

    NotificationService.notifyLike(post._id, req.user._id, post.author, req.user.fullName).catch(
      () => {},
    );

    res
      .status(200)
      .json({ status: 'success', data: { isLiked: true, likeCount: updated.likeCount } });
  }
});

// GET /api/posts/:id/comments
exports.getComments = catchAsync(async (req, res) => {
  const comments = await Comment.find({ post: req.params.id, parentComment: null })
    .populate('author', 'fullName avatar')
    .sort({ createdAt: -1 });

  // replies
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => {
      const replies = await Comment.find({ parentComment: comment._id })
        .populate('author', 'fullName avatar')
        .sort({ createdAt: 1 });
      return { ...comment.toObject(), replies };
    }),
  );

  res.status(200).json({
    status: 'success',
    data: { comments: commentsWithReplies },
  });
});

// POST /api/posts/:id/comments (add comment)
exports.addComment = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  const comment = await Comment.create({
    post: post._id,
    author: req.user._id,
    text: req.body.text,
    parentComment: req.body.parentComment || null,
  });

  await Post.findByIdAndUpdate(post._id, { $inc: { commentCount: 1 } });

  const populatedComment = await Comment.findById(comment._id).populate(
    'author',
    'fullName avatar',
  );

  NotificationService.notifyComment(post._id, req.user._id, post.author, req.user.fullName).catch(
    () => {},
  );

  res.status(201).json({
    status: 'success',
    data: { comment: populatedComment },
  });
});

// POST /api/posts/:id/share
exports.sharePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  await Post.findByIdAndUpdate(post._id, { $inc: { shareCount: 1 } });

  res.status(200).json({
    status: 'success',
    message: 'Post shared',
  });
});
