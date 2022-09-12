const cron = require('node-cron')
const mailer = require('../../modules/mailer')
const whoisFunction = require('../functions/whoisFunction')

const Notification = require('../models/Notification')

async function checkAvailability() {

    try {

        const notifications = await Notification.find({ 'completed': false }).populate('user')

        notifications.forEach(async element => {
            var domain = element.domain
            console.log(domain)
            var result = await whoisFunction(domain)

            if (result.availability === true){

                var update = await Notification.findByIdAndUpdate(element._id, {
                    completed: true
                }, { new: true })

                update.save()

                mailer.sendMail({
                    to: element.user.email,
                    from: 'no-reply@surikt.com',
                    subject: 'Your domain is available!',
                    template: 'domains/domain_availability',
                    context: {domain}
                }, (err) => {
                    if (err){
                        console.log(err)
                    }else{
                        console.log(`Email sent to ${element.user.email} about ${domain}`)
                    }
                })
            }
        })

        // const db_content = await Notification.find().populate('user')
        // console.log(db_content)

    } catch (err) {
        console.log(err)
    }

}

module.exports = cron.schedule('*/5 * * * * *', checkAvailability, {
    scheduled: true
})