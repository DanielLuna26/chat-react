import React, {Component} from 'react';
import { View, FlatList, AsyncStorage, Text, TextInput, Button, ToastAndroid } from 'react-native';
import { Actions } from 'react-native-router-flux';

export default class AddGroup extends Component {
  constructor(props) {
    super(props)
    this.state = {
      submited: true,
      users: [],
      group: {},
      token: '',
      user: {},
      name: ''
    }
  }

  componentDidMount() {
    this.getData()
  }

  async getData() {
    await AsyncStorage.getItem('token').then(token => {
      this.setState({token})
    });
    await AsyncStorage.getItem('currentUser').then(user => {
      this.setState({user:JSON.parse(user)});
      console.log(user);
    });
    fetch('http://192.168.50.37:3333/api/users', {
        method: 'GET',
        headers: {
          Authorization : 'Bearer ' + this.state.token
        }
      })
      .then(res => res.json())
      .then(resJ => {
        this.setState({
          users: resJ
        });
      });
  }

  render() {
    if(this.state.submited) {
      return(
        <View>
          <TextInput onChangeText = { (name) => { this.setState({ name: name}) }}></TextInput>
          <Button title="Submit" onPress={ () => this.addGroup() }/>
        </View>
      )
    }
    return(
      <View>
        <FlatList 
          data={this.state.users}
          renderItem={ ({item}) => 
            <View>
              <Text>{item.username}</Text>
              <Button title="Add" onPress={ () => { this.addUserGroup(item) }} />
            </View>
          }
        />
        <Button title="Finish" onPress={ () => { Actions.groups() }}></Button>  
      </View>
    )
  }

  addGroup () {
    console.log(this.state.user);
    fetch('http://192.168.50.37:3333/api/rooms/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: this.state.name,
        type: 'm'
      })
    })
    .then(res => res.json())
    .then(resJ => {
      this.setState({submited: false, group: resJ})
      fetch('http://192.168.50.37:3333/api/participants',{
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          user_id: this.state.user.id,
          room_id: resJ.id
        })
      })
      .then( res => res.json())
      .then(resJ => {
        ToastAndroid.show('Participant add', ToastAndroid.SHORT);
      })
    }).catch(err => {
      console.error(err);
    });
  }

  async addUserGroup (item) {
    fetch('http://192.168.50.37:3333/api/participants',{
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        user_id: item.id,
        room_id: this.state.group.id
      })
    })
    .then( res => res.json())
    .then( () => {
      const array = this.state.users;
      const index = this.state.users.indexOf(item);
      this.state.users.splice(index, 1);
      this.setState({users: array});
    })
  }

  async finish() {
    Actions.users()
  }
}