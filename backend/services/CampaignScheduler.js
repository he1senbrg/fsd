const cron = require('node-cron');
const Campaign = require('../models/Campaign');
const Contribution = require('../models/Contribution');
const User = require('../models/User');
const NotificationService = require('./NotificationService');
const EmailService = require('./EmailService');

// check for expired campaigns and processes them
// if goal met then status becomes 'funded', notify creator
// if goal not met then status becomes 'failed', refund all contributions, notify everyone
const startCampaignScheduler = () => {
  // run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running campaign expiry check...');
    try {
      const now = new Date();

      // find active campaigns past their deadline
      const expiredCampaigns = await Campaign.find({
        status: 'active',
        deadline: { $lt: now },
      });

      for (const campaign of expiredCampaigns) {
        if (campaign.raisedAmount >= campaign.goalAmount) {
          // funded
          campaign.status = 'funded';
          await campaign.save();

          const creator = await User.findById(campaign.creator);

          // notify creator
          await NotificationService.notifyCampaignMilestone(
            campaign.creator,
            campaign._id,
            'its funding goal! 🎉',
          );

          // send email
          if (creator) {
            await EmailService.sendCampaignFunded(creator, campaign);
          }

          console.log(`Campaign funded: ${campaign.title}`);
        } else {
          // failed
          campaign.status = 'failed';
          await campaign.save();

          // mark all contributions as refunded
          const contributions = await Contribution.find({
            campaign: campaign._id,
            status: 'completed',
          });

          for (const contribution of contributions) {
            contribution.status = 'refunded';
            await contribution.save();

            // notify backer
            await NotificationService.createNotification({
              user: contribution.backer,
              type: 'campaign',
              message: `Campaign "${campaign.title}" didn't reach its goal. Your ₹${contribution.amount} has been refunded.`,
              relatedEntity: { entityType: 'Campaign', entityId: campaign._id },
            });

            // send refund email
            const backer = await User.findById(contribution.backer);
            if (backer) {
              await EmailService.sendCampaignRefund(backer, campaign);
            }
          }

          // notify creator
          await NotificationService.createNotification({
            user: campaign.creator,
            type: 'campaign',
            message: `Your campaign "${campaign.title}" did not reach its funding goal. All contributions have been refunded.`,
            relatedEntity: { entityType: 'Campaign', entityId: campaign._id },
          });
          console.log(
            `Campaign failed: ${campaign.title} (₹${campaign.raisedAmount} / ₹${campaign.goalAmount})`,
          );
        }
      }

      if (expiredCampaigns.length > 0) {
        console.log(`⏰ Processed ${expiredCampaigns.length} expired campaigns`);
      }
    } catch (err) {
      console.error('Campaign scheduler error:', err);
    }
  });

  console.log('Campaign scheduler started (runs daily at midnight)');
};

module.exports = { startCampaignScheduler };
