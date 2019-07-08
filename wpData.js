const axios = require('axios')
const cron = require('node-cron')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const wpSchema = new Schema({
    _id: {
        type: Schema.ObjectId,
        auto: true
    },
    ChildPrice: String,
    AdultPrice: String,
    EndTime: String,
    StartTime: String,
    Date: {
        type: String,
        index: true,
        unique: true
    },
});

const Wp = mongoose.model("Wp", wpSchema);

const cronStuff = cron.schedule('20 * * * * *', () => {

    console.log('Running a job every minute at America/Chicago timezone');
    Wp.deleteMany({}, function(err) {
        if (err) {
            console.log('Error deleting all wp entries before call to wp rest api');
        }
        console.log('All Wp Entries Removed')              
    });

    axios.get(process.env.WP_URI)
        .then((response) => {   
            
            response.data.forEach((date) => {

                async function addWp() {

                    const wp = new Wp({
                        Date: date.acf.date,
                        StartTime: date.acf.start_time,
                        EndTime: date.acf.end_time,
                        AdultPrice: date.acf.adult_price,
                        ChildPrice: date.acf.child_price,
                    });

                    wp.save(function (err, wp) {
                        if (err) {
                            console.log('There was an error saving Wordpress Rest documents.', err.statusText);
                        } else {
                            console.log(`This wp date was saved to db: ${wp.Date}`);
                        }
                    });
                }
                addWp();
            })

        })
        .catch((err) => {
            console.log(err)
    });
    }, {
    scheduled: true,
    timezone: "America/Chicago"
});

module.exports.Wp = Wp;

