const { BlobServiceClient } = require('@azure/storage-blob');

let _client = null;

function getClient() {
  if (!_client) {
    _client = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
  }
  return _client;
}

function getContainerClient() {
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'kalasetu';
  return getClient().getContainerClient(containerName);
}

module.exports = { getContainerClient };
