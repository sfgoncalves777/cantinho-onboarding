const { EventBridgeClient, PutRuleCommand, PutTargetsCommand } = require('@aws-sdk/client-eventbridge');

const eventBridge = new EventBridgeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const createEventBridgeRule = async (tenant) => {
  const rules = {};
  const ruleNameRebuildHomePage = `daily-rebuild-home-page-${tenant}`;
  const ruleCreatedRebuildHomePage = await eventBridge.send(new PutRuleCommand({
    Name: ruleNameRebuildHomePage,
    ScheduleExpression: 'cron(0 3 * * ? *)',
    State: 'ENABLED',
  }));

  await eventBridge.send(new PutTargetsCommand({
    Rule: ruleNameRebuildHomePage,
    Targets: [
      {
        Id: ruleNameRebuildHomePage,
        Arn: process.env.AWS_LAMBDA_REBUILD_HOME_PAGE_ARN,
        Input: JSON.stringify({ tenant })
      }
    ]
  }));

  const ruleNameRebuildSalePage = `daily-rebuild-sale-page-${tenant}`;
  const ruleCreatedRebuildSalePage = await eventBridge.send(new PutRuleCommand({
    Name: ruleNameRebuildSalePage,
    ScheduleExpression: 'cron(0 3 * * ? *)',
    State: 'ENABLED',
  }));

  await eventBridge.send(new PutTargetsCommand({
    Rule: ruleNameRebuildSalePage,
    Targets: [
      {
        Id: ruleNameRebuildSalePage,
        Arn: process.env.AWS_LAMBDA_REBUILD_SALE_PAGE_ARN,
        Input: JSON.stringify({ tenant })
      }
    ]
  }));

  const ruleNameRebuildRentPage = `daily-rebuild-rent-page-${tenant}`;
  const ruleCreatedRebuildRentPage = await eventBridge.send(new PutRuleCommand({
    Name: ruleNameRebuildRentPage,
    ScheduleExpression: 'cron(0 3 * * ? *)',
    State: 'ENABLED',
  }));

  await eventBridge.send(new PutTargetsCommand({
    Rule: ruleNameRebuildRentPage,
    Targets: [
      {
        Id: ruleNameRebuildRentPage,
        Arn: process.env.AWS_LAMBDA_REBUILD_RENT_PAGE_ARN,
        Input: JSON.stringify({ tenant })
      }
    ]
  }));

  rules.dailyRebuildHomePageArn = ruleCreatedRebuildHomePage.RuleArn;
  rules.dailyRebuildSalePageArn = ruleCreatedRebuildSalePage.RuleArn;
  rules.dailyRebuildRentPageArn = ruleCreatedRebuildRentPage.RuleArn;

  return rules;
};

module.exports = { createEventBridgeRule }
