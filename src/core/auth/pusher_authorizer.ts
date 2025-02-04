import Logger from '../logger';
import Channel from '../channels/channel';
import Factory from '../utils/factory';
import Runtime from 'runtime';
import { AuthTransports } from './auth_transports';
import {
  AuthOptions,
  AuthorizerOptions,
  Authorizer,
  AuthorizerCallback
} from './options';

export default class PusherAuthorizer implements Authorizer {
  static authorizers: AuthTransports;

  channel: Channel;
  type: string;
  options: AuthorizerOptions;
  authOptions: AuthOptions;

  constructor(channel: Channel, options: AuthorizerOptions) {
    this.channel = channel;

    let { authTransport } = options;

    if (typeof Runtime.getAuthorizers()[authTransport] === 'undefined') {
      throw `'${authTransport}' is not a recognized auth transport`;
    }

    this.type = authTransport;
    this.options = options;
    this.authOptions = options.auth || {};
  }

  composeQuery(socketId: string): string {
    return JSON.stringify({socketId, channelName: this.channel.name});
  }

  authorize(socketId: string, callback: AuthorizerCallback): void {
    PusherAuthorizer.authorizers =
      PusherAuthorizer.authorizers || Runtime.getAuthorizers();

    PusherAuthorizer.authorizers[this.type].call(
      this,
      Runtime,
      socketId,
      callback
    );
  }
}
