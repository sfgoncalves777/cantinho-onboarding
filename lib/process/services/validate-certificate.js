const { ACMClient, DescribeCertificateCommand } = require('@aws-sdk/client-acm');

const acm = new ACMClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const validateCertificate = async (tenant, company) => {
  const certificateDetail = await acm.send(new DescribeCertificateCommand({
    CertificateArn: company.certificateArn,
  }));

  if (certificateDetail.Certificate.Status !== 'ISSUED') {
    return {
      valid: false,
      message: `O status atual do certificado SSL é ${certificateDetail.Certificate.Status}. Precisa estar ISSUED.`,
    };
  }

  return { valid: true };
};



module.exports = { validateCertificate };
