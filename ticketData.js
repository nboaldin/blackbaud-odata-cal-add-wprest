const axios = require('axios')
const cron = require('node-cron')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ticketSchema = new Schema({
    _id: {
        type: Schema.ObjectId,
        auto: true
    },
    ProgramEventsActive: Boolean,
    ProgramEventsCapacity: Number,
    ProgramEventsDescription: String,
    ProgramEventsEnddate: String,
    ProgramEventsEndtime: String,
    ProgramEventsName: String,
    ProgramEventsPresaleticketlimit: Number,
    ProgramEventsStartdate: String,
    ProgramEventsStarttime: String,
    ProgramEventsSystemrecordID: {
        type: String,
        index: true,
        unique: true
    },
});

const Ticket = mongoose.model("Ticket", ticketSchema);

const cronStuff = cron.schedule('0 59 * * * *', () => {

    console.log('Running a job every hour at America/Chicago timezone');
    Ticket.deleteMany({}, function(err) {
        if (err) {
            console.log('Error deleting all tickets before call to odata database');
        }
        console.log('All Tickets Removed')              
    });

    axios.get(process.env.ODATA_URI)
        .then((response) => {
            response.data.value.forEach((day) => {
                const ticket = new Ticket({
                    ProgramEventsActive: day.ProgramEventsActive,
                    ProgramEventsCapacity: day.ProgramEventsCapacity,
                    ProgramEventsDescription: day.ProgramEventsDescription,
                    ProgramEventsEnddate: day.ProgramEventsEnddate,
                    ProgramEventsEndtime: day.ProgramEventsEndtime,
                    ProgramEventsName: day.ProgramEventsName,
                    ProgramEventsPresaleticketlimit: day.ProgramEventsPresaleticketlimit,
                    ProgramEventsStartdate: day.ProgramEventsStartdate,
                    ProgramEventsStarttime: day.ProgramEventsStarttime,
                    ProgramEventsSystemrecordID: day.ProgramEventsSystemrecordID,
                });

                ticket.save(function (err, ticket) {
                    if (err) {
                        // console.log('There was an error.');
                    } else {
                        console.log(`This order saved to db: ${ticket._id}`);
                    }
                });

            })

        })
        .catch((err) => {
            console.log(err)
    });
    }, {
    scheduled: true,
    timezone: "America/Chicago"
});

module.exports.Ticket = Ticket;

