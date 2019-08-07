import React, { Component } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  FlatList, 
  AsyncStorage, 
  TextInput, 
  Button, 
  ToastAndroid } from 'react-native';
import Ws from '@adonisjs/websocket-client';

export default class User extends Component {
  constructor(props) {
    super(props)
    this.state = {
      token: '',
      messages: [],
      currentUser: {},
      message: '', 
      socketids: [],
      user: {}
    }
  }

  componentWillMount() {
    this.getData();
  }

  async getData() {
    await AsyncStorage.getItem('currentUser')
      .then(user => this.setState({currentUser: JSON.parse(user)}))
    fetch('http://192.168.50.37:3333/api/users/' + this.props.id)
    .then( res => res.json() )
    .then( res => {
      this.setState({user:res})
      this.state.socketids = [];
      this.state.socketids.push(res.socket_id)
      console.log(res);
    })
    await AsyncStorage.getItem('token').then(token => this.setState({token}))
    const ws = Ws('ws://192.168.50.37:3333').withJwtToken(this.state.token).connect();
    const chat = ws.subscribe('chat');
    this.setState({chat});
    fetch('http://192.168.50.37:3333/api/chat/' + this.props.id, {
      method: 'GET', 
      headers: {
        Authorization : 'Bearer ' + this.state.token
      }
    })
    .then(res => res.json())
    .then(resJ => {
      if (resJ.messages) {
        this.setState({
          messages: resJ.messages
        })
      }
    })
    .catch(err => {
      console.error(err);
    });
    this.state.chat.on('new:message', () => {
      fetch('http://192.168.50.37:3333/api/chat/' + this.props.id, {
        method: 'GET', 
        headers: {
          Authorization : 'Bearer ' + this.state.token
        }
      })
      .then(res => res.json())
      .then(resJ => {
        if (resJ.messages) {
          this.setState({
            messages: resJ.messages
          })
        }
      })
      .catch(err => {
        console.error(err);
      });
    });
  }

  render() {
    return(
      <View>
        <View style={style.messages}>
          <FlatList
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
            keyExtractor={(item, index) => index.toString()}
          >

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

    fetch('http://192.168.50.37:3333/api/chat/'+this.props.id, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        Authorization: 'Bearer ' + this.state.token
      },
      body: JSON.stringify({
        messages: this.state.messages
      })
    })
    .then(res => {
      const data = {
        message: dataMsg,
        socketids: this.state.socketids
      }
      this.messageInput.clear();
      this.componentWillMount();
      this.state.chat.emit('new:message', data);
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