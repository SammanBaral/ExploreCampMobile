// Email Configuration for ExploreCamp
// Replace these values with your actual Gmail credentials

const emailConfig = {
    service: 'gmail',  // Use service instead of host
    auth: {
        user: 'abfghdioe.acc@gmail.com', // Your Gmail address
        pass: 'uvqw ronc bkbv wlzt'     // Your Gmail App Password
    }
};

// Alternative configuration if the above doesn't work
const alternativeEmailConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,  // Use SSL
    auth: {
        user: 'abfghdioe.acc@gmail.com', // Your Gmail address
        pass: 'uvqw ronc bkbv wlzt'     // Your Gmail App Password
    }
};

export { alternativeEmailConfig, emailConfig };

