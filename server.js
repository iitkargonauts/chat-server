// Set up
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');

// Configuration
mongoose.connect('mongodb://localhost/chat-app');

app.use(bodyParser.urlencoded({ extended: true })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses
app.use(logger('dev')); // Log requests to API using morgan
app.use(cors());

//Enums
var Status = {
    INACTIVE: 0,
    ACTIVE: 2,
    READY: 1,
};

var RoomType = {
    ONEONE: 1,
    GROUP: 2,
};

// Models
var Room = mongoose.model('Room', {
    chat: Number,
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

user_list = [
    {
        name: "Jenil",
        current_room: "",
        status: Status.READY,
        email: "jenil@iitk.ac.in",
        rooms: [],
        pass: "asdf"
    },
    {
        name: "Mewada",
        current_room: "",
        status: Status.READY,
        email: "mewada@iitk.ac.in",
        rooms: [],
        pass: "qwer"
    },
    {
        name: "Robin",
        current_room: "",
        status: Status.INACTIVE,
        email: "robin@iitk.ac.in",
        rooms: [],
        pass: "zxcv"
    }
]

/*
 * Generate some test data, if no records exist already
 * MAKE SURE TO REMOVE THIS IN PROD ENVIRONMENT
*/

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

Room.remove({}, function (res) {
    console.log("removed Rooms");
});


User.count({}, function (err, count) {
    console.log("Users: " + count);
    if (!count) {
        console.log('once');
        for (u_i in user_list) {
            u = user_list[u_i];
            if (u != 0) {
                new_user = new User(u);
                new_user.save(function (err, doc) {
                    if (err) throw err;
                    console.log("Created user document: " + doc._id);
                });
            }
        }
    } else {
        console.log('once');
        User.remove({}, function (res) {
            console.log("removed Users");
        });
        for (u_i in user_list) {
            u = user_list[u_i];
            new_user = new User(u);
            new_user.save(function (err, doc) {
                if (err) throw err;
                console.log("Created user document: " + doc._id);
            });
        }
    }
});

/*Room.count({}, function(err, count){
    console.log("Rooms: " + count);
    if(!count){
        for (u in user_list){

        }
    }
});*/

function AddUsertoRoom(user_list, roomid) {
    if (!roomid && user_list.length != 0) {
        //Create Room
        console.log("room id 0");
        var new_room = new Room();
        if (user_list.length == 1) {
            console.log("user_list is 1 length : " + user_list);
            return new Promise(resolve => 0);
        } else if (user_list.length == 2) {
            console.log("user_list is 2 length : " + user_list);
            new_room.chat = RoomType.ONEONE;
        } else {
            console.log("user_list is  > 2 length : " + user_list);
            new_room.chat = RoomType.GROUP;
        }
        new_room.total_users = user_list.length;
        new_room.active_users = user_list.length;
        new_room.user_list = user_list;
        new_room.save(function (err, doc) {
            console.log("new room id : " + doc._id);
            roomid = doc._id;
            //Update Users
            for (uid_i in user_list) {
                uid = user_list[uid_i];
                console.log("Updating : " + uid);
                User.findByIdAndUpdate(uid, {
                    $push: { "status": Status.ACTIVE, "current_room": roomid }
                }, {
                        safe: true,
                        new: true
                    }, function (err, user) {
                       
                    });
                console.log("User " + uid + " updated");
            }
        });
        return new Promise(resolve => {
            return roomid;
        });
    } else {
        console.log("room id non-zero or user_list length 0");
        return new Promise(resolve => roomid);
    }
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

function part(uid){
    console.log("part :::: " + uid);
    x = User.find(
        {
            "_id" : uid
        },
        {_id : 1}
    );
    var promise = x.exec();
    promise.addBack(function (err, docs){
        console.log("docs");
        console.log(docs);
        console.log(docs.length);
        if(docs.length == 0){
            return 0;
        }else{
            return docs[0];
        }
    });
}

// Routes
app.post('/api/combine', function(req, res){
    console.log("Combining " + req.query.first + " and " + req.query.second);
    var x = part(req.query.first);
    var y = part(req.query.second);
    if(x != 0 && y != 0 ){
        res.success=1;
        User.find(
            {
                $or : [
                    {
                        "_id" : req.query.first
                    },
                    {
                        "_id" : req.query.second
                    }
                ]
            },
            {_id : 1} , async function (err, users){
            var room_id;
            if(err){
                res.send(err);
            }else{
                room_id = await AddUsertoRoom(users, "");
            }
            console.log("added " + room_id);
        }).then(function (){
            console.log("start");
            Room.find({
            }, function (err, rooms) {
                console.log("start " + rooms);
                if (err) {
                    res.send(err);
                }else{
                    res.json(rooms);
                }
            });
        });
    }else{
        console.log("Invalid Operation");
        res.send({success: 0});
    }
});

app.post('/api/list_rooms', function (req, res) {
    console.log("add Jenil and Mewada in one room");
    User.find({"status": Status.READY}, {_id : 1} , async function (err, users){
        var room_id;
        if(err){
            res.send(err);
        }else{
            room_id = await AddUsertoRoom(users, "");
        }
        console.log("added " + room_id);
    }).then(function (){
        console.log("start");
        Room.find({
        }, function (err, rooms) {
            console.log("start " + rooms);
            if (err) {
                res.send(err);
            }else{
                res.json(rooms);
            }
        });
    });
    /*User.find({
    }, function (err, users) {
        if (err) {
            res.send(err);
        } else {
            res.json(users);
        }
    });*/
    /*Room.find({
        type: req.query.roomType,
        beds: req.query.beds,
        max_occupancy: {$gt: req.query.guests},
        cost_per_night: {$gte: req.query.priceRange.lower, $lte: req.query.priceRange.upper},
        reserved: {
 
            //Check if any of the dates the room has been reserved for overlap with the requsted dates
            $not: {
                $elemMatch: {from: {$lt: req.query.to.substring(0,10)}, to: {$gt: req.query.from.substring(0,10)}}
            }
 
        }
    }, function(err, rooms){
        if(err){
            res.send(err);
        } else {
            res.json(rooms);
        }
    });*/
});

/*app.post('/api/list_users', function(req, res) {
 
    console.log(req.query._id);
 
    Room.findByIdAndUpdate(req.query._id, {
        $push: {"reserved": {from: req.query.from, to: req.query.to}}
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