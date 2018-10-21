// Set up
var express  = require('express');
var app      = express();
var mongoose = require('mongoose');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
var mongo = require('mongodb');
mongourl='mongodb://localhost/chat-app'

 
// Configuration

app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses
app.use(logger('dev')); // Log requests to API using morgan
app.use(cors());

//Enums
var Status = {
    INACTIVE: 0,
    ACTIVE: 1,
    READY: 2,
};

var RoomType = {
    INDIVIDUAL: 0,
    GROUP: 1,
};

// Models
var Room = mongoose.model('Room', {
    status: Number,
    type: Number,
    total_users: Number,
    active_users: String,
    user_list: [String]
});

var User = mongoose.model('User', {
    name: String,
    status: Number,
    current_room: String,
    email: String,
    rooms: [String],
    pass: String
});

/*
* Generate some test data, if no records exist already
* MAKE SURE TO REMOVE THIS IN PROD ENVIRONMENT
*/

console.log('Hello');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

user_list = [
    {
        name : "Jenil",
        current_room: "",
        status: Status.ACTIVE,
        email: "jenil@iitk.ac.in",
        rooms: [  ],
        pass: "asdf"
    },
    {
        name : "Mewada",
        current_room: "",
        status: Status.ACTIVE,
        email: "mewada@iitk.ac.in",
        rooms: [  ],
        pass: "qwer"
    },
    {
        name : "Robin",
        current_room: "",
        status: Status.INACTIVE,
        email: "robin@iitk.ac.in",
        rooms: [  ],
        pass: "zxcv"
    }
]

function addUsertoRoom(){

}

/*Room.count({}, function(err, count){
    console.log("Rooms: " + count);
    
    if(count === 0){
        
        var recordsToGenerate = 150;
        
        var roomTypes = [
            'standard',
            'villa',
            'penthouse',
            'studio'
        ];
        
        // For testing purposes, all rooms will be booked out from:
        // 18th May 2017 to 25th May 2017, and
        // 29th Jan 2018 to 31 Jan 2018
        
        for(var i = 0; i < recordsToGenerate; i++){
            var newRoom = new Room({
                room_number: i,
                type: roomTypes[getRandomInt(0,3)],
                beds: getRandomInt(1, 6),
                max_occupancy: getRandomInt(1, 8),
                cost_per_night: getRandomInt(50, 500),
                reserved: [
                    {from: '1970-01-01', to: '1970-01-02'},
                    {from: '2017-04-18', to: '2017-04-23'},
                    {from: '2018-01-29', to: '2018-01-30'}
                ]
            });
            
            newRoom.save(function(err, doc){
                console.log("Created test document: " + doc._id);
            });
        }
        
    }
});*/

//Add data into database
mongoose.connect(mongourl, useMongoClient=true, function(err, db){
    if (err) throw err;
    var dbo = db.db("chat-app");
    dbo.createCollection("Users", function(err, res){
        if (err) throw err;
        console.log("Users Collection Created!");
    })
    dbo.createCollection("Rooms", function(err, res){
        if (err) throw err;
        console.log("Rooms Collection Created!");
    })

    result = dbo.collection("Users").insertMany(user_list, function(err, res){
        if (err) throw err;
        console.log("Number of Documents inserted : " + res.insertCount);
        return json(res);
    });
    console.log(result);

    db.close();
    console.log("Db created!");
});

// Routes
app.get('/api/find/', function(req, res){
    
});
app.post('/api/add', function(req, res){
    
});

/*app.post('/api/find', function(req, res) {
    
    Room.find({
        type: req.body.roomType,
        beds: req.body.beds,
        max_occupancy: {$gt: req.body.guests},
        cost_per_night: {$gte: req.body.priceRange.lower, $lte: req.body.priceRange.upper},
        reserved: {
            
            //Check if any of the dates the room has been reserved for overlap with the requsted dates
            $not: {
                $elemMatch: {from: {$lt: req.body.to.substring(0,10)}, to: {$gt: req.body.from.substring(0,10)}}
            }
            
        }
    }, function(err, rooms){
            if(err){
                res.send(err);
            } else {
                res.json(rooms);
            }
        });
 
    });


 
    app.post('/api/rooms/reserve', function(req, res) {
 
        console.log(req.body._id);
 
        Room.findByIdAndUpdate(req.body._id, {
            $push: {"reserved": {from: req.body.from, to: req.body.to}}
        }, {
            safe: true,
            new: true
        }, function(err, room){
            if(err){
                res.send(err);
            } else {
                res.json(room);
            }
        });
 
    });*/
 
// listen
app.listen(8080);
console.log("App listening on port 8080");