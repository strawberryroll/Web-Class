// Keep track of which names are used so that there are no duplicates
const users = {};
const rooms = {}; 
const roomMessages = {}; // Store messages for each room

var userNames = (function () {
  var names = {};

  var claim = function (name) {
    if (!name || names[name]) {
      return false;
    } else {
      names[name] = true;
      return true;
    }
  };

  // find the lowest unused "guest" name and claim it
  var getGuestName = function () {
    var name,
      nextUserId = 1;

    do {
      name = 'Guest ' + nextUserId;
      nextUserId += 1;
    } while (!claim(name));

    return name;
  };

  // serialize claimed names as an array
  var get = function () {
    var res = [];
    for (user in names) {
      res.push(user);
    }

    return res;
  };

  var free = function (name) {
    if (names[name]) {
      delete names[name];
    }
  };

  return {
    claim: claim,
    free: free,
    get: get,
    getGuestName: getGuestName
  };
}());

// export function for listening to the socket
module.exports = function (socket) {
  var name = userNames.getGuestName();

  // send the new user their name and a list of users
  socket.emit('init', {
    name: name,
    users: userNames.get()
  });

  // notify other clients that a new user has joined
  socket.broadcast.emit('user:join', {
    name: name
  });

  // broadcast a user's message to other users
  socket.on('send:message', function (data) {
    // Save the message to the room's message list
    const { roomName, user, text } = data;
    if (!roomMessages[roomName]) {
      roomMessages[roomName] = [];
    }
    roomMessages[roomName].push({ user: user, text });

    // Broadcast the message to the room
    socket.broadcast.to(roomName).emit('send:message', {
      user: name,
      text: text
    });
  });

  // validate a user's name change, and broadcast it on success
  socket.on('change:name', function (data, fn) {
    if (userNames.claim(data.name)) {
      var oldName = name;
      userNames.free(oldName);

      name = data.name;
      
      socket.broadcast.emit('change:name', {
        oldName: oldName,
        newName: name
      });

      fn(true);
    } else {
      fn(false);
    }
  });

  socket.on('signup', (data, callback) => {
    const { username, password } = data;
    if (users[username]) {
      callback({ success: false, message: 'Username already taken' });
    } else {
      users[username] = { username, password };
      callback({ success: true });
    }
  });

  socket.on('login', (data, callback) => {
    const { username, password } = data;
    const user = users[username];
    if (user && user.password === password) {
      callback({ success: true, user: username });
    } else {
      callback({ success: false, message: 'Invalid username or password' });
    }
  });

  socket.on('search:room', (data, callback) => {
    const { roomName } = data;
    const roomExists = !!rooms[roomName];
    callback({ exists: roomExists });
  });

  socket.on('create:room', (data, callback) => {
    const { roomName } = data;
    if (rooms[roomName]) {
        callback({ success: false, message: 'Room already exists' });
    } else {
        rooms[roomName] = { name: roomName };
        roomMessages[roomName] = []; // Initialize message storage for the new room
        callback({ success: true });
    }
  });

  socket.on('join:room', (data, callback) => {
    const { roomName } = data;
    if (rooms[roomName]) {
      socket.join(roomName);
      callback({ success: true, messages: roomMessages[roomName] });
    } else {
      callback({ success: false, message: 'Room does not exist' });
    }
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {
    socket.broadcast.emit('user:left', {
      name: name
    });
    userNames.free(name);
  });
};