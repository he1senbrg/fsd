const ArtForm = require('../models/ArtForm');
const catchAsync = require('../utils/catchAsync');

exports.getAllArtForms = catchAsync(async (req, res, next) => {
  const artForms = await ArtForm.find().sort({ name: 1 });
  res.status(200).json({
    status: 'success',
    results: artForms.length,
    data: { artForms },
  });
});

exports.createArtForm = catchAsync(async (req, res, next) => {
  const { name, category } = req.body;

  let artForm = await ArtForm.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (artForm) {
    return res.status(200).json({
      status: 'success',
      data: { artForm },
    });
  }

  artForm = await ArtForm.create({
    name,
    category,
    addedBy: req.user ? req.user._id : undefined,
    isOfficial: true,
  });

  res.status(201).json({
    status: 'success',
    data: { artForm },
  });
});
