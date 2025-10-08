const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const uploadFile = async (filePath, key) => {
  const fileStream = fs.createReadStream(filePath);
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: fileStream,
    ContentType: getContentTypes(filePath)
  };
  await s3Client.send(new PutObjectCommand(uploadParams));
};

const getContentTypes = (filePath) => {
  const ext = path.extname(filePath);
  const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
  }
  return contentTypes[ext] || 'application/octet-stream';
};

const uploadFiles = async (tenant, pathDirectory, prefix = '') => {
  const directoryOfFiles = pathDirectory || path.join(__dirname, `../../../builds/${tenant}`);
  const files = fs.readdirSync(directoryOfFiles);
  if (!files.length) {
    throw new Error(`No files to upload, directory: ${directoryOfFiles}`);
  };
  for (const file of files) {
    const filePath = path.join(directoryOfFiles, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      await uploadFiles(tenant, filePath, path.join(prefix, file));
    } else {
      const key = path.join(tenant, prefix, file).replace(/\\/g, "/");
      await uploadFile(filePath, key);
    }
  }
};

module.exports = { uploadFiles };
