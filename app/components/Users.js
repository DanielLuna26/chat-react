import React, {Component} from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView, Text, FlatList, AsyncStorage, TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import Ws from '@adonisjs/websocket-client';

export default class Users extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      token: '',
      chat: {}
    }
  }
  componentDidMount() {
    this.getData();
    
  }

  async getData() {
    await AsyncStorage.getItem('token').then(token => this.setState({token}))
    const ws = Ws('ws://192.168.50.37:3333').withJwtToken(this.state.token).connect();
    const chat = ws.subscribe('chat');
    this.setState({chat});
    fetch('http://192.168.50.37:3333/api/currentuser', {
      method: 'GET',
      headers: {
        Authorization : 'Bearer ' + this.state.token
      }
    })
    .then(res => res.json())
    .then(async (resJ) => {
      await AsyncStorage.setItem('currentUser', JSON.stringify(resJ))
    }).catch(err => {
      console.error(err)
    })
    fetch('http://192.168.50.37:3333/api/users', {
      method: 'GET',
      headers: {
        Authorization : 'Bearer ' + this.state.token
      }
    })
    .then(res => res.json())
    .then(resJ => {
      this.setState({
        isLoading: false,
        dataSource: resJ
      })
    })
    .catch(err => console.error(err));
    this.state.chat.on('new:user', () => {
      fetch('http://192.168.50.37:3333/api/users', {
        method: 'GET',
        headers: {
          Authorization : 'Bearer ' + this.state.token
        }
      })
      .then(res => res.json())
      .then(resJ => {
        this.setState({
          isLoading: false,
          dataSource: resJ
        });
      });
    });
    this.state.chat.on('added:user', () => {
      fetch('http://192.168.50.37:3333/api/users', {
        method: 'GET',
        headers: {
          Authorization : 'Bearer ' + this.state.token
        }
      })
      .then(res => res.json())
      .then(resJ => {
        this.setState({
          isLoading: false,
          dataSource: resJ
        });
      });
    });
  }

  render() {
    if(this.state.isLoading){
      return(
        <View style={{flex: 1, padding: 20}}>
          <ActivityIndicator/>
        </View>
      )
    }

    return(
      <View style={style.container}>
        <FlatList style={style.item}
          data={this.state.dataSource}
          renderItem={({item}) => 
          <TouchableOpacity onPress={() => {Actions.user({id : item.id}) }}><Text style={style.content}>{item.username}</Text></TouchableOpacity>}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  }
}

const style = StyleSheet.create({
  container: {
    backgroundColor: '#fafafa'
  },
  item: {
  },
  content: {
    color: '#1f1f1f',
    padding: 10,
    paddingBottom: 34,
    fontSize: 19,
    borderBottomWidth: 0.5,
  }
})