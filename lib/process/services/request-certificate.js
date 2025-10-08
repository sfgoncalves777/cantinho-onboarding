const { ACMClient, RequestCertificateCommand, DescribeCertificateCommand } = require('@aws-sdk/client-acm');
const database = require('../../database');

const companyCollection = 'companies';

const limitRetry = 10;
let currentRetry = 0;
let delayBetweenRetries = 5000;

const acm = new ACMClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const requestCertificateDetail = async (certificateArn) => {
  if (currentRetry >= limitRetry) {
    return [];
  };
  const certificateDetail = await acm.send(new DescribeCertificateCommand({
    CertificateArn: certificateArn,
  }));

  console.log('Status do certificado:', certificateDetail.Certificate.Status);

  const domainValidationOptions = certificateDetail.Certificate.DomainValidationOptions;

  const cNameData = []

  domainValidationOptions.forEach(option => {
    const record = option.ResourceRecord;
    if (record) {
      cNameData.push({
        DomainName: option.DomainName,
        Name: record.Name,
        Type: record.Type,
        Value: record.Value
      });
    };
  });

  if (!cNameData.length) {
    console.log(`Dados de CNAME não disponíveis ainda. Aguardando ${delayBetweenRetries / 1000} segundos e tentando novamente...`);
    currentRetry += 1;
    delayBetweenRetries += 5000;
    await new Promise(resolve => setTimeout(resolve, delayBetweenRetries));
    return requestCertificateDetail(certificateArn);
  };

  return cNameData;
};

const requestCertificate = async (tenant) => {
  const company = await database.getCollection(companyCollection).findOne({ tenant });
  if (!company) {
    throw new Error(`Company not found for tenant: ${tenant}`);
  };
  const command = new RequestCertificateCommand({
    DomainName: company.dns,
    SubjectAlternativeNames: [company.dns.slice(4)],
    ValidationMethod: "DNS",
  });

  const responseRequestCertificate = await acm.send(command);
  const certificateArn = responseRequestCertificate.CertificateArn;

  const setUpdateCompany = { certificateArn };
  await database.getCollection(companyCollection).updateOne({ tenant }, { $set: setUpdateCompany });

  console.log('Certificate ARN gerado:', certificateArn);

  await new Promise(resolve => setTimeout(resolve, delayBetweenRetries));

  const cNameData = await requestCertificateDetail(certificateArn);
  if (!cNameData.length) {
    throw new Error('Failed to retrieve CNAME data for DNS validation.');
  };
  console.log('Dados de CNAME para configuração de DNS:');
  cNameData.forEach(cname => {
    console.log(`- Domain: ${cname.DomainName}`);
    console.log(`  Name:  ${cname.Name} (obs: se for na Godaddy, retire o .${company.dns.slice(4)} do final)`);
    console.log(`  Type:  ${cname.Type}`);
    console.log(`  Value: ${cname.Value}\n`);
  });
}

module.exports = { requestCertificate };
