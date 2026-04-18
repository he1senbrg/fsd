const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { uploadBuffer, deleteBlob } = require('../utils/blobStorage');

exports.uploadMedia = catchAsync(async (req, res, next) => {
    if (!req.file) return next(new AppError('No file uploaded', 400));

    const result = await uploadBuffer(req.file.buffer, req.file.mimetype, 'media');

    res.status(200).json({
        status: 'success',
        data: { url: result.url, publicId: result.blobName, type: result.type },
    });
});

exports.deleteMedia = catchAsync(async (req, res, next) => {
    const { publicId } = req.params;
    await deleteBlob(publicId);
    res.status(200).json({ status: 'success', message: 'Media deleted' });
});