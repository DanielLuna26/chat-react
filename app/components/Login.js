import React, { Component } from 'react';
import { StyleSheet, View, ScrollView, TextInput, Button, ToastAndroid, AsyncStorage } from 'react-native';
import { Actions } from 'react-native-router-flux';
import Ws from '@adonisjs/websocket-client';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: ''
    }
  }
  
  isAuthenticated() {
    AsyncStorage.getItem('token').then(token => {
      if(token !== null) {
        Actions.users();
        return true;
      }
      return false;
    });
  }

  render() {
    return(
      <ScrollView>
        <View style={style.container}>
          <TextInput 
            placeholder="Type your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={ (email) => { this.setState({email: email}) }}
            returnKeyType="next"
            onSubmitEditing={() => { this.passwordInput.focus() }}
            />
          <TextInput
            placeholder="Type your password" 
            onChangeText={ (password) => { this.setState({password: password}) }}
            secureTextEntry
            ref={(input) => { this.passwordInput = input }}
            />
          <Button 
            title="SignIn" 
            onPress={ () =>{ this.login() }}/>
        </View>
      </ScrollView>
    )
  }

  login () {
    if (this.state.email == '' && this.state.password == '') {
      ToastAndroid.show('You must fill all the fields.', ToastAndroid.SHORT);
      return;
    }
    const data = {
      email: this.state.email,
      password: this.state.password
    }
    fetch('http://192.168.50.37:3333/api/signin', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(res => res.json())
    .then(async (res) => {
      if(res.token) {
        await AsyncStorage.setItem('token', res.token);
        const ws = Ws('ws://192.168.50.37:3333').withJwtToken(res.token).connect();
        const chat = ws.subscribe('chat');
        this.setState({chat});
        this.state.chat.emit('new:user', true)
        Actions.users();
      } else {
        ToastAndroid.show('Bad credentials.', ToastAndroid.SHORT);
        this.state.password = '';
        this.passwordInput.clear();
      }
    })
    .catch(err => {
      console.log(err)
    });

  }
}

const style = StyleSheet.create({
  container: {
    padding: 20
  }
})