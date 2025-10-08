const { S3Client, GetBucketPolicyCommand, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Adiciona uma distribuição CloudFront existente à policy do bucket
 * sem criar um novo statement, apenas atualiza a Condition
 */
const updatePolicy = async (distributionId) => {
  let policy;

  const bucketName = process.env.AWS_BUCKET_NAME
  try {
    const currentPolicy = await s3.send(new GetBucketPolicyCommand({ Bucket: bucketName }));
    policy = JSON.parse(currentPolicy.Policy);
  } catch (err) {
    if (err.name === 'NoSuchBucketPolicy') {
      throw new Error(`Bucket ${bucketName} não possui policy existente.`);
    } else {
      throw err;
    }
  }

  const newArn = `arn:aws:cloudfront::${process.env.AWS_ACCOUNT_ID}:distribution/${distributionId}`;

  const cfStatement = policy.Statement.find(stmt =>
    stmt.Condition &&
    stmt.Condition.StringEquals &&
    stmt.Condition.StringEquals['AWS:SourceArn']
  );

  if (!cfStatement) {
    throw new Error('Não foi encontrado nenhum statement compatível para CloudFront no bucket.');
  }

  if (!cfStatement.Condition.StringEquals['AWS:SourceArn'].includes(newArn)) {
    cfStatement.Condition.StringEquals['AWS:SourceArn'].push(newArn);
  }

  await s3.send(new PutBucketPolicyCommand({
    Bucket: bucketName,
    Policy: JSON.stringify(policy)
  }));

  console.log(`Bucket ${bucketName} atualizado com os novos ARNs da CloudFront.`);
};

module.exports = { updatePolicy };
