import React, {Component} from 'react';
import { StyleSheet, View, ScrollView, Button, TouchableOpacity, FlatList, Text, AsyncStorage, ActivityIndicator } from 'react-native';
import { Actions } from 'react-native-router-flux';
import Ws from '@adonisjs/websocket-client';

export default class Groups extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      token: ''
    }
  }
  componentDidMount() {
    this.getData()
  }

  async getData() {
    await AsyncStorage.getItem('token').then(token => this.setState({token}))
    const ws = Ws('ws://192.168.50.37:3333').withJwtToken(this.state.token).connect();
    const chat = ws.subscribe('chat');
    this.setState({chat});
    fetch('http://192.168.50.37:3333/api/users/0/rooms', {
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
    this.state.chat.on('new:group', () => {
      fetch('http://192.168.50.37:3333/api/users/0/rooms', {
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
      <View>
        <Button title="Add group" onPress={() => {Actions.addgroup() }}></Button>
        <FlatList
          data={this.state.dataSource}
          renderItem={ ({item}) => <TouchableOpacity onPress={() => {Actions.group({id : item.id}) }}><Text style={style.content}>{item.name}</Text></TouchableOpacity>}
          keyExtractor={(item, index) => index.toString()}
        >

        </FlatList>
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