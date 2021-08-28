const sgMail = require('@sendgrid/mail')

sendGridAPIKey= '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'
sgMail.setApiKey(sendGridAPIKey)

const sendWelcomeEmail= (email,name)=>{
    console.log('aaaa')
    sgMail.send({
        to: 'buinhu210399@gmail.com',
        from:'nhubui210399@gmail.com',
        subject:'Welcome to the app!',
        text:`Thanks for joining ${'Nhu'}. Let me know how you get along with the app`
    })
}

// const sendCancelEmail= (email,name)=>{
//     sgMail.send({
//         to: email,
//         from:'nhubui210399@gmail.com',
//         subject:'Sorry to see you go!',
//         text:`Thanks for using our app ${name}. Hope to see you sometime soon`
//     })
// }

module.exports = {
    sendWelcomeEmail,
// sendCancelEmail

}