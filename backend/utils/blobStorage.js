const { v4: uuidv4 } = require('uuid');
const { getContainerClient } = require('../config/azureStorage');

// upload to az blob storage
async function uploadBuffer(buffer, mimetype, folder = 'media') {
    const ext = (mimetype.split('/')[1] || 'bin').split(';')[0];
    const blobName = `${folder}-${uuidv4()}.${ext}`;

    const containerClient = getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: { blobContentType: mimetype },
    });

    return {
        url: blockBlobClient.url,
        blobName,
        type: mimetype.startsWith('video/') ? 'video' : 'image',
    };
}

// del from az blob storage
async function deleteBlob(blobName) {
    const containerClient = getContainerClient();
    await containerClient.getBlockBlobClient(blobName).deleteIfExists();
}

module.exports = { uploadBuffer, deleteBlob };