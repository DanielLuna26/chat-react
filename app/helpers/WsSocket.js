import React, { Component } from 'react';
import Ws from '@adonisjs/websocket-client';
import { AsyncStorage } from 'react-native';

export default class WsSocket {

  constructor() {
  }

  async startSocket(token) {
    this.ws = Ws('ws://192.168.50.37:3333').withJwtToken(token).connect()
    this.subscibeChannel()
  }

  subscibeChannel() {
    this.chat = this.ws.subscribe('chat')
  }

  emitNewUser() {
    this.chat.emit('new:user', true);
  }

  emitNewGroup() {
    this.chat.emit('new:group', true);
  }

  emitNewMessage(data) {
    this.chat.emit('new:message', data);
  }
}