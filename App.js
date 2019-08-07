/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Router, Scene } from 'react-native-router-flux';

import Login from './app/components/Login';
import Groups from './app/components/Groups';
import Users from './app/components/Users';
import User from './app/components/User';
import Group from './app/components/Group';
import Profile from './app/components/Profile';
import AddGroup from './app/components/AddGroup';


export default class App extends Component {
  render() {
    return (
      <Router>
        <Scene key="root" hideNavBar>
          <Scene key="login" hideNavBar>
            <Scene key="login" component={Login} initial></Scene>
          </Scene>
          <Scene key="tabbar" title="Users" tabBarPosition="bottom" tabs={true} hideNavBar>
            <Scene key="users" title="Users" renderBackButton={() => (null)}>
              <Scene key="users" component={Users}></Scene>
              <Scene key="user" component={User} hideTabBar hideNavBar></Scene>
            </Scene>
            <Scene key="groups" title="Groups" title="My groups">
              <Scene key="groups" component={Groups}></Scene>
              <Scene key="addgroup"  component={AddGroup}></Scene>
              <Scene key="group" component={Group} hideNavBar hideTabBar></Scene>
            </Scene>
            <Scene key="profile" title="Profile" title="Profile">
              <Scene key="groups" component={Profile}></Scene>
            </Scene>
          </Scene>
        </Scene>
      </Router>
    );
  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
