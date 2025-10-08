const { CloudFrontClient, CreateDistributionCommand } = require('@aws-sdk/client-cloudfront');

const cloudFront = new CloudFrontClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const createCdn = async (tenant, company) => {
  const DomainName = process.env.AWS_REGION === 'us-east-1'
    ? `${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com`
    : `${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

  const { dns, certificateArn } = company;

  const params = {
    DistributionConfig: {
      CallerReference: `${tenant}-${Date.now()}`,
      Comment: `CDN for tenant ${tenant}`,
      Enabled: true,
      IsIPV6Enabled: true,
      Aliases: {
        Quantity: 1,
        Items: [dns]
      },
      DefaultRootObject: 'index.html',
      Origins: {
        Quantity: 1,
        Items: [
          {
            Id: `${tenant}-origin`,
            DomainName,
            OriginPath: `/${tenant}`,
            OriginAccessControlId: process.env.AWS_ORIGIN_ACCESS_CONTROL_ID,
            S3OriginConfig: {
              OriginAccessIdentity: ''
            }
          }
        ]
      },
      DefaultCacheBehavior: {
        TargetOriginId: `${tenant}-origin`,
        ViewerProtocolPolicy: 'redirect-to-https',
        AllowedMethods: {
          Quantity: 3,
          Items: ['GET', 'HEAD', 'OPTIONS']
        },
        CachedMethods: {
          Quantity: 2,
          Items: ['GET', 'HEAD']
        },
        Compress: true,
        MinTTL: 0,
        DefaultTTL: 86400, // 24h
        MaxTTL: 86400,
        ForwardedValues: {
          QueryString: false,
          Cookies: { Forward: 'none' }
        }
      },
      CacheBehaviors: {
        Quantity: 3,
        Items: [
          {
            PathPattern: '/administrativo/*',
            TargetOriginId: `${tenant}-origin`,
            ViewerProtocolPolicy: 'redirect-to-https',
            AllowedMethods: {
              Quantity: 3,
              Items: ['GET', 'HEAD', 'OPTIONS']
            },
            CachedMethods: {
              Quantity: 2,
              Items: ['GET', 'HEAD']
            },
            Compress: true,
            MinTTL: 0,
            DefaultTTL: 0,
            MaxTTL: 0,
            ForwardedValues: {
              QueryString: true,
              Cookies: { Forward: 'all' }
            }
          },
          {
            PathPattern: '/assets/*',
            TargetOriginId: `${tenant}-origin`,
            ViewerProtocolPolicy: 'redirect-to-https',
            AllowedMethods: {
              Quantity: 3,
              Items: ['GET', 'HEAD', 'OPTIONS']
            },
            CachedMethods: {
              Quantity: 2,
              Items: ['GET', 'HEAD']
            },
            Compress: true,
            MinTTL: 0,
            DefaultTTL: 86400,
            MaxTTL: 86400,
            ForwardedValues: {
              QueryString: false,
              Cookies: { Forward: 'none' }
            }
          },
          {
            PathPattern: '/properties/*',
            TargetOriginId: `${tenant}-origin`,
            ViewerProtocolPolicy: 'redirect-to-https',
            AllowedMethods: {
              Quantity: 3,
              Items: ['GET', 'HEAD', 'OPTIONS']
            },
            CachedMethods: {
              Quantity: 2,
              Items: ['GET', 'HEAD']
            },
            Compress: true,
            MinTTL: 0,
            DefaultTTL: 86400,
            MaxTTL: 86400,
            ForwardedValues: {
              QueryString: false,
              Cookies: { Forward: 'none' }
            }
          }
        ]
      },
      ViewerCertificate: {
        ACMCertificateArn: certificateArn,
        SSLSupportMethod: 'sni-only',
        MinimumProtocolVersion: 'TLSv1.2_2021',
      },
      PriceClass: 'PriceClass_200',
    }
  };

  const cdnCreated = await cloudFront.send(new CreateDistributionCommand(params));
  const cloudFrontDomain = cdnCreated.Distribution.DomainName;

  console.log('CDN criada com sucesso!');
  console.log('Configure o seguinte CNAME no seu provedor de DNS (ex.: GoDaddy):');
  console.log(`- Tenant: ${tenant}`);
  console.log(`  Name: www`);
  console.log(`  Value: ${cloudFrontDomain}`);

  return { distributionId: cdnCreated.Distribution.Id };
};

module.exports = { createCdn };
