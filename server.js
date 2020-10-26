const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;


// connect mongo db
mongo.connect('mongodb://127.0.0.1/mongochat',function(err, db) {
    if (err) {
        throw err

    }
    console.log("Mongodb connected");

    client.on('connection', function (socket) {
        let chat = db.collection('chats');
        // create function to send staus
        sendStaus = function (s) {
            socket.emit('status', s);
        }
        // get chats from mongo collection
        chat.find().limit(100).sort({ _id: 1 }).toArray(function (err, res) {
            if (err) throw err;
            // emit the mesage
            socket.emit('output', res);
        });
        // handle input event
        socket.on('input', function (data) {
            let name = data.name;
            let message = data.message;

            // check for the name and message

            if (name == '' || message == '') {
                // send error status
                sendStaus('Please enter the name and message');


            }
            else {
                // insert message
                chat.insert({ name: name, message: message }, function () {
                    client.emit('output', [data]);
                    // send status object
                    sendStaus({
                        message: "message sent",
                        clear: true
                    })
                })
            }
        });
        // handle clear 
        socket.on('clear', function (data) {
            // remove all chats from collection
            chat.remove({}, function () {
                // emit cleared
                socket.emit();
            })
        })

    })
});

