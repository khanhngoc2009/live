
import React, { Component } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RtcEngine, {
  RtcRemoteView,
  RtcLocalView,
  VideoRenderMode,
  ChannelProfile,
  ClientRole,
} from 'react-native-agora';
import requestCameraAndAudioPermission from '@components/livestream/Permission';
import styles from '../../../components/livestream/Styles';
import RtmEngine from 'agora-react-native-rtm';
import { GoBackLayout } from '../../../components';
import { useAppDispatch, useAppSelector } from '../../../store'
import { requestLiveThunk } from "@app/store/live/LiveRoomSlice";
import { connect } from 'react-redux';
import { Live } from '@model/index'
import { GenericListInitialState } from '@app/Screen/GetsentryScreen/slice/GenericListInitialState';
import axios from 'axios'
import { ApiURL } from '@app/network/api';
interface Props { }

interface State {
  appId: string;
  token: string | null;
  channelName: string;
  inCall: boolean;
  inLobby: boolean;
  input: string;
  peerIds: number[];
  seniors: string[];
  myUsername: string;
  rooms: { [name: string]: number };
  data?: Live[];
  role?:boolean
}
class LiveRoomLayout extends Component<{ navigation, data, requestLiveThunk }, State> {
  _rtcEngine?: RtcEngine;
  _rtmEngine?: RtmEngine;
  constructor(props?: State & any) {
    super(props);
    this.state = {
      appId: '9f7cb444e3c84a788609a98dd123e75a',
      token: null,
      channelName: "",
      inCall: false,
      input: '',
      inLobby: false,
      peerIds: [],
      seniors: [],
      myUsername: '' + new Date().getTime(),
      rooms: {},
      data: [],
      role:false
    };
    if (Platform.OS === 'android') {
      requestCameraAndAudioPermission().then(() => {
        console.log('requested!');
      });
    }
  }
  getListMyProduct = () => {
    this.props.requestLiveThunk();
  }
  _request = async () => {
    await axios.get(ApiURL.Live).then((res) => {
      if (res.status === 200) {
        this.setState({ data: res.data })
      }
    }).catch((e) => {

    })
  }

  componentDidMount() {
    this.initRTC();
    this.initRTM();
    this._request();
  }

  _onCreate = (value?: Live) => {

  }
  componentWillUnmount() {
    this._rtmEngine?.destroyClient();
    this._rtcEngine?.destroy();
  }

  initRTC = async () => {
    const { appId ,role} = this.state;
    this._rtcEngine = await RtcEngine.create(appId);
    await this._rtcEngine.enableVideo();

    this._rtcEngine.addListener('Error', (err) => {
      console.log('Error', err);
    });
    await this._rtcEngine.setChannelProfile(ChannelProfile.LiveBroadcasting)
    await this._rtcEngine.setDefaultAudioRoutetoSpeakerphone(true);
    await this._rtcEngine.setClientRole(!role ? ClientRole.Audience : ClientRole.Broadcaster)
    this._rtcEngine.addListener('UserJoined', (uid) => {
      // Get current peer IDs
      const { peerIds, inCall, seniors, channelName } = this.state;
      // If new user
      if (peerIds.indexOf(uid) === -1) {
        if (inCall && seniors.length < 2) {
          this._rtmEngine?.sendMessageByChannelId(
            'lobby',
            channelName + ':' + (peerIds.length + 2),
          );
        }
        this.setState({
          // Add peer ID to state array
          peerIds: [...peerIds, uid],
        });
      }
    });
    

    this._rtcEngine.addListener('UserOffline', (uid) => {
      const { peerIds } = this.state;
      this.setState({
        // Remove peer ID from state array
        peerIds: peerIds.filter((id) => id !== uid),
      });
    });

    // If Local user joins RTC channel
    this._rtcEngine.addListener(
      'JoinChannelSuccess',
      (channel, uid, elapsed) => {
        console.log('JoinChannelSuccess', channel, uid, elapsed);
        this.setState({
          inCall: true,
        });
      },
    );
    
  };

  /**
   * @name initRTM
   * @description Function to initialize the Rtm Engine, attach event listeners and use them to sync usernames
   */
  initRTM = async () => {
    let { appId, myUsername } = this.state;
    this._rtmEngine = new RtmEngine();

    this._rtmEngine.on('error', (evt) => {
      console.log(evt);
    });

    this._rtmEngine.on('channelMessageReceived', (evt) => {
      // received message is of the form - channel:membercount, add it to the state
      let { text } = evt;
      let data = text.split(':');
      this.setState({ rooms: { ...this.state.rooms, [data[0]]: data[1] } });
    });

    this._rtmEngine.on('messageReceived', (evt) => {
      // received message is of the form - channel:membercount, add it to the state
      let { text } = evt;
      let data = text.split(':');
      this.setState({ rooms: { ...this.state.rooms, [data[0]]: data[1] } });
    });

    this._rtmEngine.on('channelMemberJoined', (evt) => {
      let { channelName, seniors, peerIds, inCall } = this.state;
      let { channelId, uid } = evt;
      // if we're in call and receive a lobby message and also we're the senior member (oldest member in the channel), signal channel status to joined peer
      if (inCall && channelId === 'lobby' && seniors.length < 2) {
        this._rtmEngine
          ?.sendMessageToPeer({
            peerId: uid,
            text: channelName + ':' + (peerIds.length + 1),
            offline: false,
          })
          .catch((e) => console.log(e));
      }
    });

    this._rtmEngine.on('channelMemberLeft', (evt) => {
      let { channelId, uid } = evt;
      let { channelName, seniors, inCall, peerIds, rooms } = this.state;
      if (channelName === channelId) {
        // Remove seniors UID from state array
        this.setState({
          seniors: seniors.filter((id) => id !== uid),
          rooms: { ...rooms, [channelName]: peerIds.length },
        });
        if (inCall && seniors.length < 2) {
          // if we're in call and we're the senior member (oldest member in the channel), signal channel status to all users
          this._rtmEngine
            ?.sendMessageByChannelId(
              'lobby',
              channelName + ':' + (peerIds.length + 1),
            )
            .catch((e) => console.log(e));
        }
      }
    });

    await this._rtmEngine.createClient(appId).catch((e) => console.log(e));
    await this._rtmEngine
      ?.login({ uid: myUsername })
      .catch((e) => console.log(e));

    await this._rtmEngine?.joinChannel('lobby').catch((e) => console.log(e));
    this.setState({ inLobby: true });
  };

  /**
   * @name joinCall
   * @description Function to join a room and start the call
   */
  joinCall = async (channelName: string) => {
    
    this.setState({ channelName:channelName});
    
    let { token } = this.state;
    // Join RTC Channel using null token and channel name
    await this._rtcEngine?.joinChannel(token, channelName, null, 0);
    await this._rtmEngine?.joinChannel(channelName)
      .catch((e) => console.log(e));
    let { members } = await this._rtmEngine?.getChannelMembersBychannelId(
      channelName,
    );
    // if we're the only member, broadcast to room to all users on RTM
    if (members.length === 1) {
      await this._rtmEngine
        ?.sendMessageByChannelId('lobby', channelName + ':' + 1)
        .catch((e) => console.log(e));
    }
    this.setState({
      inLobby: false,
      seniors: members.map((m: any) => m.uid),
    });
  };

  /**
   * @name endCall
   * @description Function to end the call and return to lobby
   */
  endCall = async () => {
    let { channelName, myUsername, peerIds, seniors } = this.state;
    // if we're the senior member, broadcast room to all users before leaving
    if (seniors.length < 2) {
      await this._rtmEngine
        ?.sendMessageByChannelId('lobby', channelName + ':' + peerIds.length)
        .catch((e) => console.log(e));
    }
    await this._rtcEngine?.leaveChannel();

    await this._rtmEngine?.logout();
    await this._rtmEngine?.login({ uid: myUsername });
    await this._rtmEngine?.joinChannel('lobby');
    this.setState({
      peerIds: [],
      inCall: false,
      inLobby: true,
      seniors: [],
      channelName: '',
    });
  };

  render() {
    const { inCall, channelName, inLobby ,role} = this.state;
    return (
      <SafeAreaView style={styles.max}>
        <GoBackLayout title="Live Room"
          onClickIcon={() => {
            this.props.navigation.goBack();
          }} />
        <View style={styles.spacer}>
          <Text style={styles.roleText}>
            {inCall ? "You're in " + channelName : 'Lobby: Join/Create a room'}
          </Text>
        </View>
        {this._renderRooms()}
        {this._renderCall()}
        {!inLobby && !inCall ? (
          <Text style={styles.waitText}>Please wait, joining room...</Text>
        ) : null}
      </SafeAreaView>
    );
  }

  _renderRooms = () => {
    const { inLobby, rooms, input } = this.state;
    return inLobby ? (
      <View style={styles.fullView}>
        <Text style={styles.subHeading}>Room List</Text>
        <ScrollView>
          {Object.keys(rooms).map((key, index) => {
            if (rooms[key] != 0) {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => this.joinCall(key)}
                  style={styles.roomsBtn}>
                  <Text>
                    <Text style={styles.roomHead}>{key}</Text>
                    <Text style={styles.whiteText}>
                      {' (' + rooms[key] + ' users)'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              );
            }

          })}
          <Text>
            {Object.keys(rooms).length === 0
              ? 'No active rooms, please create new room'
              : null}
          </Text>
        </ScrollView>
        <TextInput
          value={input}
          onChangeText={(val) => this.setState({ input: val })}
          style={styles.input}
          placeholder="Enter Room Name"
        />
        <TouchableOpacity
          onPress={async () => {
            this.setState({
              role:true
            })
            input ? await this.joinCall(input) : null;
          }}
          style={styles.button}>
          <Text style={styles.buttonText}>Create Room</Text>
        </TouchableOpacity>
      </View>
    ) : null;
  };

  _renderCall = () => {
    const { inCall, peerIds, channelName } = this.state;
    return inCall ? (
      <View style={styles.fullView}>
        <RtcLocalView.SurfaceView
          style={styles.video}
          channelId={channelName}
          renderMode={VideoRenderMode.Hidden}
        />
        <ScrollView>
          {peerIds.map((key, index) => {
            return (
              <RtcRemoteView.SurfaceView
                channelId={channelName}
                renderMode={VideoRenderMode.Hidden}
                key={index}
                uid={key}
                style={styles.video}
              />
            );
          })}
        </ScrollView>
        <TouchableOpacity onPress={this.endCall} style={styles.button}>
          <Text style={styles.buttonText}>Leave Room</Text>
        </TouchableOpacity>
      </View>
    ) : null;
  };
}

const mapStateToProps = (state: GenericListInitialState<Live>) => ({
  data: state.data
});

const mapDispatchToProps = {
  requestLiveThunk
};

export default connect(mapStateToProps, mapDispatchToProps)(LiveRoomLayout);