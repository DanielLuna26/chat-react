import React, { Component } from 'react';
import { 
  View, 
  StyleSheet, 
  ToastAndroid, 
  AsyncStorage, 
  Text, 
  TextInput, 
  FlatList,
  Button } from 'react-native';
import Ws from '@adonisjs/websocket-client';

export default class Group extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true,
      token: '',
      messages: [],
      currentUser: {},
      socketids: [],
      users: []
    }
  }

  componentDidMount() {
    this.getData()
  }

  async getData() {
    await AsyncStorage.getItem('currentUser')
      .then(user => this.setState({currentUser: JSON.parse(user)}))
    await AsyncStorage.getItem('token')
      .then(token => { this.setState({token: token})})
    const ws = Ws('ws://192.168.50.37:3333').withJwtToken(this.state.token).connect();
    const chat = ws.subscribe('chat');
    this.setState({chat});
    fetch('http://192.168.50.37:3333/api/rooms/'+this.props.id, {
      method: 'GET'
    })
    .then(res => res.json())
    .then(resJ => {
      if (resJ.messages) {
        this.setState({
          isLoading: false,
          messages: resJ.messages
        })
      }
    });

    fetch('http://192.168.50.37:3333/api/groups/' + this.props.id + '/users',{
      method: 'GET',
    })
    .then(res => res.json())
    .then(resJ => {
      this.setState({users: resJ})
      resJ.forEach(user => {
        this.state.socketids.push(user.socket_id);
      });
    });

    this.state.chat.on('new:message', () => {
      fetch('http://192.168.50.37:3333/api/rooms/'+this.props.id, {
        method: 'GET'
      })
      .then(res => res.json())
      .then(resJ => {
        if (resJ.messages) {
          this.setState({
            isLoading: false,
            messages: resJ.messages
          });
        }
      });
    });
  }

  render() {
    return(
      <View>
        <View>
          <FlatList style={style.messages}
            data={this.state.messages}
            renderItem={ ({item}) => 
            <View style={style.contentMessage}>
              <View>
                <Text style={style.messageUsername}>{item.username}</Text>
              </View>
              <View style={style.message}>
                <Text>{item.body}</Text>
              </View>
            </View>
            }
            keyExtractor={(item, index) => index.toString()}>
          </FlatList>
        </View>
        <View>
          <TextInput 
            onChangeText={ (message) => { this.setState({message})} }
            ref={(input) => { this.messageInput = input }}
            >

          </TextInput>
          <Button title="Send" onPress={() => { this.sendMessage()  }}></Button>
        </View>
      </View>
    )
  }

  sendMessage() {
    const dataMsg = {
      id: this.state.currentUser.id,
      username:  this.state.currentUser.username,
      body: this.state.message
    }

    this.state.messages.push(dataMsg)

    fetch('http://192.168.50.37:3333/api/rooms/'+this.props.id, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        messages: this.state.messages
      })
    })
    .then(res => {
      this.componentDidMount();
      const data = {
        message: dataMsg,
        socketids: this.state.socketids
      }
      this.state.chat.emit('new:message', data);
      this.messageInput.clear();
    })
    .catch(err => {
      console.error(err);
    }) 
  }
}

const style = StyleSheet.create({
  messages: {
    height: 525
  },
  username: {
    fontSize: 30,
    borderWidth: 1,
  },
  contentMessage: {
    borderWidth: 0.2,
    padding: 4,
  },
  messageUsername: {
    color: '#0000ff',
    fontSize: 20,
  },
  message: {
    fontSize: 18
  }
})