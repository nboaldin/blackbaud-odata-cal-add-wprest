const cron = require('node-cron')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ticketData = require('./ticketData')
const wpData = require('./wpData');

//Merged Data Schema
const mergedSchema = new Schema({
    _id: {
        type: Schema.ObjectId,
        auto: true
    },
    ProgramEventsStartdate: {
        type: String,
        index: true,
        unique: true
    },
    ProgramEventsSystemrecordID: {
        type: String,
        index: true,
        unique: true
    },
    ProgramEventsName: String,
    StartTime: String,
    EndTime: String,
    AdultPrice: String,
    ChildPrice: String
});

//Get Odata and wpREST data and compare
async function gatherData () {

    const oData = ticketData.Ticket.find({});
    const wpRest =  wpData.Wp.find({});

    return [await oData, await wpRest];
}

const cronStuff = cron.schedule('45 * * * * *', () => {


gatherData().then((response) => {
    const oData = response[0];
    const wpRest = response[1];

    wpRest.forEach((date, index, arr) => {
        date.Date = date.Date + 'T00:00:00'
    }, wpRest) 

    // console.log(wpRest)

    const indexes = wpRest.map(obj => obj.Date);
    // console.log(indexes)

    const mergedArr = oData.map(obj => {
        const index = indexes.indexOf(obj.ProgramEventsStartdate); 
        // console.log(index)
        return {
            ProgramEventsStartdate: index > -1? wpRest[index].Date : obj.ProgramEventsStartdate, 
            ProgramEventsSystemrecordID: index > -1? obj.ProgramEventsSystemrecordID : null,
            ProgramEventsName: index > -1? obj.ProgramEventsName : null,
            StartTime: index > -1? wpRest[index].StartTime : null,
            EndTime: index > -1? wpRest[index].EndTime : null,
            AdultPrice: index > -1? wpRest[index].AdultPrice : null,
            ChildPrice: index > -1? wpRest[index].ChildPrice : null,

        };
    });

    //Merged data model
    const Merged = mongoose.model("Merged", mergedSchema);


    console.log('Running a job every minute at America/Chicago timezone');
    Merged.deleteMany({}, function(err) {
        if (err) {
            console.log('Error deleting all MERGED entries before call to wp rest api');
        }
        console.log('All MERGED Entries Removed')              
    });

    mergedArr.forEach((obj) => {

        async function addMerged() {

            const merged = new Merged({
                ProgramEventsStartdate: obj.ProgramEventsStartdate,
                ProgramEventsSystemrecordID: obj.ProgramEventsSystemrecordID,
                ProgramEventsName: obj.ProgramEventsName,
                StartTime: obj.StartTime,
                EndTime: obj.EndTime,
                AdultPrice: obj.AdultPrice,
                ChildPrice: obj.ChildPrice
            });

            merged.save(function (err, merged) {
                if (err) {
                console.log('There was an error saving MERGED documents.', err.statusText);
                } else {
                    console.log(`This MERGED date was saved to db: ${merged.ProgramEventsStartdate}`);
                }
            });
        }
        addMerged();
    });


    module.exports.Merged = Merged;
    
})
.catch((err) => {
    console.log('Error getting oData and wpRest together', err)
})

}, {
    scheduled: true,
    timezone: "America/Chicago"
});






