import React, {Component} from 'react';
import { View, FlatList, AsyncStorage, Text, TextInput, Button } from 'react-native';
import { Actions } from 'react-native-router-flux';

export default class AddGroup extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentUser: {},
    }
  }

  componentDidMount() {
    this.getData()
  }

  async getData() {
    await AsyncStorage.getItem('currentUser')
      .then(user => this.setState({currentUser: JSON.parse(user)}))
  }

  render() {
    return(
      <View>
        <Text>{this.state.currentUser.username}</Text>
        <Text>{this.state.currentUser.email}</Text>
        <Button title="Log out" onPress={() => { this.logOut() }}></Button>
      </View>
    )
  }

  async logOut() {
    await AsyncStorage.clear().then(succes => {
      Actions.login()
    })
  }
}