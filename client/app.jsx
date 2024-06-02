'use strict';

var React = require('react');

var socket = io.connect();

var UsersList = React.createClass({
   render() {
      return (
         <div className='users'>
            <h3> 참여자들 </h3>
            <ul>
               {
                  this.props.users.map((user, i) => {
                     return (
                        <li key={i}>
                           {user}
                        </li>
                     );
                  })
               }
            </ul>            
         </div>
      );
   }
});

var Message = React.createClass({
   render() {
      var messageClass = this.props.isUserMessage ? 'user-message' : 'other-user-message';
 
      return (
        <div className={"message " + messageClass}>
          <img src='images/chatprofile_icon.png' alt="profile" />
          <div className="text-container">
            <span className="user-name">{this.props.user}</span>
            <span>{this.props.text}</span>
          </div>     
        </div>
      );
   }
 });

var MessageList = React.createClass({
   render() {
      return (
         <div className='messages'>
            {/* <h2> 채팅방 </h2> */}
            {
               this.props.messages.map((message, i) => {
                  return (
                     <Message
                        key={i}
                        user={message.user}
                        text={message.text} 
                        isUserMessage={message.user === this.props.currentUser}
                     />
                  );
               })
            } 
         </div>
      );
   }
});

var MessageForm = React.createClass({

   getInitialState() {
      return {text: ''};
   },

   handleSubmit(e) {
      e.preventDefault();
      var message = {
         user : this.props.user,
         text : this.state.text
      }
      this.props.onMessageSubmit(message);   
      this.setState({ text: '' });
   },

   changeHandler(e) {
      this.setState({ text : e.target.value });
   },

   render() {
      return(
         <div className='message_form'>
            <form onSubmit={this.handleSubmit}>
               <input 
                  placeholder='메시지 입력'
                  className='textinput'
                  onChange={this.changeHandler}
                  value={this.state.text}
               />
               <button type="submit" className='send-button'><img src='images/send_btn.png' alt="Send" /></button>
            </form>
         </div>
      );
   }
});

var ChangeNameForm = React.createClass({
   getInitialState() {
      return {newName: ''};
   },

   onKey(e) {
      this.setState({ newName : e.target.value });
   },

   handleSubmit(e) {
      e.preventDefault();
      var newName = this.state.newName;
      this.props.onChangeName(newName);   
      this.setState({ newName: '' });
   },

   render() {
      return(
         <div className='change_name_form'>
            <h3> 아이디 변경 </h3>
            <form onSubmit={this.handleSubmit}>
               <input
                  placeholder='변경할 아이디 입력'
                  onChange={this.onKey}
                  value={this.state.newName} 
               />
            </form>   
         </div>
      );
   }
});


var SignUpForm = React.createClass({
   getInitialState() {
      return {username: '', password: '', showModal: false};
   },

   handleSubmit(e) {
      e.preventDefault();
      var {username, password} = this.state;
      socket.emit('signup', {username, password}, (response) => {
         if(response.success) {
            this.setState({showModal: true});
         } else {
            alert('회원가입 실패: ' + response.message);
         }
      });
   },

   handleChange(e) {
      this.setState({[e.target.name]: e.target.value});
   },

   closeModal() {
      this.setState({showModal: false});
      this.props.onSignUp();
   },

   render() {
      return (
         <div className='signup_form'>
            <p> 회원가입 </p>
            <form onSubmit={this.handleSubmit}>
               <input className='form_input'
                  name='username'
                  placeholder='아이디'
                  onChange={this.handleChange}
                  value={this.state.username}
               />
               <br />
               <input className='form_input'
                  name='password'
                  type='password'
                  placeholder='비밀번호'
                  onChange={this.handleChange}
                  value={this.state.password}
               />
               <br />
               <button type='submit' className='form_button'>회원가입</button>
               <button type='button' className='form_button' onClick={this.props.onSwitchToLogin}>로그인</button>
            </form>
            {this.state.showModal &&
                  <div className='form_modal'>
                       <p>🎉회원가입 성공!🎉</p>
                       <button onClick={this.closeModal}>OK</button>
                     </div>
              }
         </div>
      );
   }
});


var LoginForm = React.createClass({
   getInitialState() {
      return {username: '', password: ''};
   },

   handleSubmit(e) {
      e.preventDefault();
      var {username, password} = this.state;
      socket.emit('login', {username, password}, (response) => {
         if(response.success) {
            this.props.onLogin(username);
         } else {
            alert('로그인 실패: ' + response.message);
         }
      });
   },

   handleChange(e) {
      this.setState({[e.target.name]: e.target.value});
   },

   render() {
      return (
         <div className='signup_form'>
            <p> 로그인 </p>
            <form onSubmit={this.handleSubmit}>
               <input className='form_input'
                  name='username'
                  placeholder='아이디'
                  onChange={this.handleChange}
                  value={this.state.username}
               />
               <br />
               <input className='form_input'
                  name='password'
                  type='password'
                  placeholder='비밀번호'
                  onChange={this.handleChange}
                  value={this.state.password}
               />
               <br />
               <button className='form_button' type='submit'>로그인</button>
               <button className='form_button' type='button' onClick={this.props.onSwitchToSignUp}>회원가입</button>
            </form>
         </div>
      );
   }
});

var MessageName = React.createClass({
   render() {
      return (
         <div className='message_name'>
            <h4>{this.props.msgname}</h4>
         </div>
      );
   }
});

var Header = React.createClass({
   render() {
     return (
      <div className='header'>
        <img src='images/INU.png' alt='INU Logo' className='logo' />
      </div>
     );
   }
  });

  var DrawerItem = React.createClass({
   render() {
      return (
         <div className='drawer_item'>
            {this.props.icon}
            <span>{this.props.text}</span>
         </div>
      );
   }
});

var Drawer = React.createClass({
   render() {
      return (
         <div className='drawer'>
            <DrawerItem icon={<img src='images/friends_icon.png' alt='친구' />} />
            <DrawerItem icon={<img src='images/chat_icon.png' alt='채팅' />} />
            <DrawerItem icon={<img src='images/notification_icon.png' alt='알림' />} />
            <DrawerItem icon={<img src='images/profile_icon.png' alt='프로필' />} />
         </div>
      );
   }
});

var SearchRoom = React.createClass({
    getInitialState() {
        return { roomName: '', roomExists: null, roomList: [] };
    },

    handleChange(e) {
        this.setState({ roomName: e.target.value });
    },

    handleSearch() {
        socket.emit('search:room', { roomName: this.state.roomName }, (response) => {
            this.setState({ roomExists: response.exists });
            if (response.exists) {
                this.setState({ roomList: [this.state.roomName] });
            } else {
                this.setState({ roomList: [] });
            }
        });
    },

    handleCreateRoom() {
        if (this.state.roomName) {
            socket.emit('create:room', { roomName: this.state.roomName }, (response) => {
                if (response.success) {
                    alert('방이 성공적으로 개설되었습니다!');
                    this.setState({ roomExists: true });
                } else {
                    alert('방 개설 실패: ' + response.message);
                }
            });
        }
    },

    handleJoinRoom(roomName) {
        socket.emit('join:room', { roomName }, (response) => {
            if (response.success) {
                alert('방에 성공적으로 참여했습니다!');
            this.props.onRoomJoin(roomName);
            } else {
                alert('방 참여 실패: ' + response.message);
            }
        });
    },

    render() {
        return (
            <div className='search_room'>
            <div className='search_room_top'>
               <input className='search_room_input'
                  placeholder='찾을 방'
                  onChange={this.handleChange}
                  value={this.state.roomName}
               />
               <button onClick={this.handleSearch} className='search_button'><img src='images/magnifier_icon.png' alt='검색' /></button>
            </div>
                {this.state.roomExists === false && (
                    <div className='search_room_check'>
                        <p>해당 방이 존재하지 않습니다. 방을 개설하시겠습니까?</p>
                        <button onClick={this.handleCreateRoom}>O</button>
                        <button onClick={() => this.setState({ roomExists: null })}>X</button>
                    </div>
                )}
                {this.state.roomExists === true && (
                    <div>
                        <div>
                            {this.state.roomList.map((room, index) => (
                                <div className='search_room_exist' key={index} onClick={() => this.handleJoinRoom(room)}>
                                    <img src='images/home_icon.png' alt='room' />
                           <p>{room}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }
});

var ChatApp = React.createClass({
   getInitialState() {
      return {
         users: [],
         user: '', 
         messages:[], 
         text: '', 
         loggedIn: false, 
         signUp: false,
         rooms: [],
         currentRoom: '',
      };
   },

   componentDidMount() {
      socket.on('init', this._initialize);
      socket.on('send:message', this._messageRecieve);
      socket.on('user:join', this._userJoined);
      socket.on('user:left', this._userLeft);
      socket.on('change:name', this._userChangedName);
   },

   _initialize(data) {
      var {users, name} = data;
      this.setState({users, user: name});
   },

   _messageRecieve(message) {
      var {messages} = this.state;
      messages.push(message);
      this.setState({messages});
   },


   handleMessageSubmit(message) {
      var {messages} = this.state;
      messages.push(message);
      this.setState({messages});
      socket.emit('send:message', { ...message, user: this.state.user, roomName: this.state.currentRoom });
   },

   handleChangeName(newName) {
      var oldName = this.state.user;
      socket.emit('change:name', { name : newName}, (result) => {
         if(!result) {
            return alert('There was an error changing your name');
         }
         var {users} = this.state;
         var index = users.indexOf(oldName);
         users.splice(index, 1, newName);
         this.setState({users, user: newName});
      });
   },

   handleLogin(username) {
      this.setState({loggedIn: true, user: username});
   },

   handleSignUp() {
      this.setState({signUp: true});
   },

   handleSwitchToSignUp() {
      this.setState({ signUp: false });
   },

   handleSwitchToLogin() {
      this.setState({ signUp: true });
   },

   handleRoomJoin(roomName) {
      socket.emit('join:room', { roomName }, (response) => {
         if (response.success) {
            this.setState({ currentRoom: roomName, messages: response.messages });
         } else {
            alert('방 참여 실패: ' + response.message);
         }
      });
   },

   render() {
      if (!this.state.loggedIn) {
         return this.state.signUp ? (
            <LoginForm onLogin={this.handleLogin} onSwitchToSignUp={this.handleSwitchToSignUp} /> 
         ) : (
            <SignUpForm onSignUp={this.handleSignUp} onSwitchToLogin={this.handleSwitchToLogin} />
         );
      }

      return (
         <div className='main_container'>
            <div className='main_left'>
               <Drawer />
               <SearchRoom onRoomJoin={this.handleRoomJoin} />
            </div>
            <div className='main_right'>
               {this.state.currentRoom && (
                  <div>
                  <MessageName msgname={this.state.currentRoom} />
                  <MessageList
                     messages={this.state.messages}
                     currentUser={this.state.user}
                  />
                  <MessageForm
                     onMessageSubmit={this.handleMessageSubmit}
                     user={this.state.user}
                  />
                  </div>
               )}
            </div>
         </div>
      );
   }
});


React.render(<ChatApp/>, document.getElementById('app'));
React.render(<Header/>, document.getElementById('header'));