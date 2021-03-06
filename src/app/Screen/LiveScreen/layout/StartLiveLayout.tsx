//Live class component

import React, { Component } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
  Image,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Animated
} from 'react-native';
import RtcEngine, {
  RtcRemoteView,
  RtcLocalView,
  VideoRenderMode,
  ChannelProfile,
  ClientRole,
  RtcEngineConfig,
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
import styled from 'styled-components/native'
import { Icon_Image } from '@assets/image';
import { useDispatch } from 'react-redux'

interface Props { }
interface Message {
  url?: string,
  name?: string,
  message?: string,
}
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
  data: Live[];
  role?: boolean;
  comment: string;
  timer: number;
  message: Message[];
  keyboardStatus: any;
  animation: any;
  _open:any
}
class StartLiveLayout extends Component<{ navigation, userLogin, requestLiveThunk, data }, State> {
  _rtcEngine?: RtcEngine;
  _rtmEngine?: RtmEngine;
  constructor(props?: State & any) {
    super(props);
    this.state = {
      appId: '9f7cb444e3c84a788609a98dd123e75a',
      token: null,
      channelName: "",
      inCall: false,
      input: 'live stream ',
      inLobby: false,
      peerIds: [],
      seniors: [],
      myUsername: 'toi la ' + new Date().getTime(),
      rooms: {},
      data: [],
      role: true,
      comment: "",
      timer: 0,
      message: [],
      keyboardStatus: undefined,
      animation: new Animated.Value(0),
      _open:false
    };
    if (Platform.OS === 'android') {
      requestCameraAndAudioPermission().then(() => {
        console.log('requested!');
      });
    }
  }
  _request = async () => {
    await axios.get(ApiURL.Live).then((res) => {
      if (res.status === 200) {
        this.setState({ data: res.data })
      }
    }).catch((e) => {

    })
  }
  /**
   * @name _onPressSend
   * @description h??m g???i message 
   */
  _onPressSend = async () => {
    const { comment, message } = this.state
    if (comment) {
      console.log(comment);
      const streamId = await this._rtcEngine?.createDataStreamWithConfig({});
      await this._rtcEngine?.sendStreamMessage(streamId!, comment);
      this.setState({
        message:
          [...message, {
            name: "you",
            message: comment
          }],
        comment: ""
      }
      )
    }
  };
  /**
   * @name _update
   * @param channelName t??n c???a channel ??ang hi???n h???u
   * @param countMember s??? ng?????i ??ang c?? trong live
   * @param status tr???ng th??i c???a live stream
   * @description h??m x??? l?? update live
   */
  _update = async (channelName, countMember: number, status: boolean, value?: any) => {
    let val = this.state.data.find((id) => id.channel === channelName)
    let params = { ...val, users: countMember, status: status, [value]: value };
    await axios.put(`${ApiURL.Live}/${val?.id}`, params).then((res) => {
      let resultData = this.state.data.map((val, ind) => {
        if (val.channel === channelName) {
          return res.data
        } else {
          return val
        }
      })
      this.setState({ data: resultData })
    }).catch((e) => {
      console.log(e);
    })
  }
  componentDidMount() {
    this.initRTC();
    this.initRTM();
    this._request();

  }

  componentWillUnmount = async () => {
    await this._rtmEngine?.destroyClient();
    await this._rtcEngine?.destroy();
  }

  /**
   * @name initRTC
   * @description initRTC s??? l?? c??c s??? ki???n c???a rtc engine
   */
  initRTC = async () => {
    const { appId } = this.state;
    this._rtcEngine = await RtcEngine.createWithConfig(
      new RtcEngineConfig(appId)
    )
    await this._rtcEngine.enableVideo();
    await this._rtcEngine.setChannelProfile(ChannelProfile.LiveBroadcasting)
    await this._rtcEngine.setDefaultAudioRoutetoSpeakerphone(true);
    await this._rtcEngine.setClientRole(ClientRole.Broadcaster)
    await this._rtcEngine.enableAudio();
    this._addListener(this._rtcEngine);
  };
  /**
   * @name _addListener
   * @param _rtcEngine truy???n v??o gi?? tr??? rtcEngine
   * @description l???ng nghe c??c s??? ki???n x???y ra
   */
  _addListener = (_rtcEngine) => {
    const { appId, role, inCall, inLobby, myUsername } = this.state;
    _rtcEngine.addListener('Error', (err) => {
      console.log('Error', err);
    });
    _rtcEngine.addListener('UserJoined', (uid) => {
      const { peerIds, inCall, seniors, channelName } = this.state;
      if (peerIds.indexOf(uid) === -1) {
        if (inCall && seniors.length < 2) {
          this._rtmEngine?.sendMessageByChannelId(
            'lobby',
            channelName + ':' + (peerIds.length + 2),
          );
        }
        this.setState({
          peerIds: [...peerIds, uid],
        });
      }
    });
    _rtcEngine.addListener('UserOffline', (uid) => {
      const { peerIds } = this.state;
      this.setState({
        peerIds: peerIds.filter((id) => id !== uid),
      });
    });
    _rtcEngine.addListener(
      'JoinChannelSuccess',
      (channel, uid, elapsed) => {
        console.log('JoinChannelSuccess', channel, uid, elapsed);
        this.setState({
          inCall: true,
        });
        let value = {
          uid: uid,
          channel: channel,
          token: this.state.token,
          users: 0,
          appId: appId,
          messages: [],
          status: true
        };
        axios.post(ApiURL.Live, value).then((res) => {
          this.setState({
            data: [...this.state.data, res.data]
          })
        }).catch((e) => {
        })
      },
    );
    this._rtcEngine?.addListener('StreamMessage', (uid, streamId, data) => {
      this.setState({
        message: [...this.state.message, {
          name: `${uid}`,
          message: data,
        }]
      })

    });
    this._rtcEngine?.addListener(
      'StreamMessageError',
      (uid, streamId, error, missed, cached) => {
        console.info(
          'StreamMessageError',
          uid,
          streamId,
          error,
          missed,
          cached);
      });
  }

  /**
   * @name initRTM
   * @description Function to initialize the Rtm Engine, attach event listeners and use them to sync usernames
   */

  initRTM = async () => {
    let { appId, myUsername } = this.state;
    this._rtmEngine = new RtmEngine();
    this._onRTM(this._rtmEngine);
    await this._rtmEngine.createClient(appId).catch((e) => console.log(e));
    await this._rtmEngine
      ?.login({ uid: myUsername })
      .catch((e) => console.log(e));
    await this._rtmEngine?.joinChannel('lobby').catch((e) => console.log(e));
    this.setState({ inLobby: true });
  };
  /**
   * @name onRTM
   * @description function con c???a init RTM
   */
  _onRTM = (_rtmEngine) => {
    _rtmEngine.on('error', (evt) => {
      console.log(evt);
    });
    _rtmEngine.on('channelMessageReceived', (evt) => {
      let { text } = evt;
      let data = text.split(':');
      console.log(data,"channel");
      
      this.setState({ rooms: { ...this.state.rooms, [data[0]]: data[1] } });
    });
    _rtmEngine.on('messageReceived', (evt) => {
      
      let { text } = evt;
      let data = text.split(':');
      console.log(data,"none");
      this.setState({ rooms: { ...this.state.rooms, [data[0]]: data[1] } });
    });
    _rtmEngine.on('channelMemberJoined', (evt) => {
      let { channelName, seniors, peerIds, inCall } = this.state;
      let { channelId, uid } = evt;
      console.log("channelMemberJoined");
      
      if (inCall && channelId === 'lobby' && seniors.length < 2) {
        this._rtmEngine
          ?.sendMessageToPeer({
            peerId: uid,
            text: channelName + ':' + (peerIds.length + 1),
            offline: false,
          }).catch((e) => console.log(e));
        this._update(channelName, peerIds.length + 1, true)
      }
    });
    _rtmEngine.on('channelMemberLeft', (evt) => {
      let { channelId, uid } = evt;
      console.log("channelMemberLeft");
      
      let { channelName, seniors, inCall, peerIds, rooms } = this.state;
      if (channelName === channelId) {
        this.setState({
          seniors: seniors.filter((id) => id !== uid),
          rooms: { ...rooms, [channelName]: peerIds.length },
        });
        this._update(channelName, peerIds.length + 1, true)
        if (inCall && seniors.length < 2) {
          this._rtmEngine
            ?.sendMessageByChannelId(
              'lobby',
              channelName + ':' + (peerIds.length + 1),
            )
            .catch((e) => console.log(e));
        }
      }
    });
  }
  /**
   * @name joinCall
   * @description Function to join a room and start the call
   */

  joinCall = async (channelName: any, role: boolean) => {
    this.setState({
      channelName: channelName,
    });
    let { token } = this.state;
    await this._rtcEngine?.joinChannel(token, channelName, null, 0);
    await this._rtmEngine?.joinChannel(channelName)
      .catch((e) => console.log(e));
    let { members } = await this._rtmEngine?.getChannelMembersBychannelId(
      channelName,
    );
    if (members.length === 1) {
      await this._rtmEngine
        ?.sendMessageByChannelId('lobby', channelName + ':' + 2 + "/" + 0)
        .catch((e) => console.log(e));
    }
    this.setState({
      inLobby: false,
      seniors: members.map((m: any) => m.uid),
    });
  };
  endCall = async () => {
    let { channelName, myUsername, peerIds, seniors, role, data } = this.state;
    if (seniors.length < 2) {
      await this._rtmEngine
        ?.sendMessageByChannelId('lobby', channelName + ':' + peerIds.length)
        .catch((e) => console.log(e));
    }
    await this._rtcEngine?.leaveChannel();

    await this._rtmEngine?.logout();
    await this._rtmEngine?.login({ uid: myUsername });
    await this._rtmEngine?.joinChannel('lobby');

    /**
     * @name update live v??? tr???ng th??i ???? live v?? record
     */
    if (role) {
      this._update(channelName, 0, false)
    }

    this.setState({
      peerIds: [],
      inCall: false,
      inLobby: true,
      seniors: [],
      channelName: '',
      role: false
    });
  };
  toggle=()=>{
    const toValue = this.state._open?0:1;
    Animated.timing(
      this.state.animation,
      {
        toValue,
        duration: 3000,
        useNativeDriver: false
      }).start();
      this.setState({_open:!this.state._open})
  }
  /**
   * @returns all render c???n thi???t
   */
  render() {
    const { inCall, channelName, inLobby, role } = this.state;
    return (
      <SafeAreaView style={styles.max}>
        {!inCall && <GoBackLayout title="Live Streaming Start"
          onClickIcon={() => {
            this.props.navigation.goBack();
          }} />}
        {this._renderRooms()}
        {this._renderCall()}
        {!inLobby && !inCall ? (
          <Text style={styles.waitText}>Please wait, joining room...</Text>
        ) : null}
      </SafeAreaView>
    );
  }
  /**
   * 
   * @returns render ra danh s??ch live ??ang 
   */
  _renderRooms = () => {
    const { inLobby, input, data, comment } = this.state;
    return inLobby ? (
      <View style={{ flex: 1 }}>
        <ViewLiveStart >
          <Image source={Icon_Image.live_image_live_stream_screen} style={{
            width: "50%",
            height: 260,
          }} />
          <TextStartLive>H??y k???t n???i v???i m???i ng?????i b???ng c??ch b???t ?????u live stream ho???c th?????ng th???c live stream n??o ...</TextStartLive>
          <StartLiveButton
            onPress={() => {
              this.setState({ role: true }, () => this.joinCall(this.props.userLogin.email, true))
            }}>
            <TextStartLiveButton >Live</TextStartLiveButton>
          </StartLiveButton>
        </ViewLiveStart>
      </View>
    ) : null;
  };
  /**
   * @name renderCall 
   * @returns render ra m??n h??nh call khi g???i t???i
   */

  _renderCall = () => {
    const { inCall, peerIds, channelName, data, comment, message, role } = this.state;
    return inCall ? (
      <View style={{}}>
        <RtcLocalView.SurfaceView
          style={styles.video}
          channelId={channelName}
          renderMode={VideoRenderMode.Hidden}
        />
        {data?.filter((e) => e.channel === channelName && e.status).length != 0 && <ViewAbsoluteAllRender >
          <KeyboardAvoidingViewStyled
            style={{ flex: 1 }}
            enabled
            behavior={(Platform.OS !== 'ios' && 'padding') || undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 85 : 85}
          >
            <ViewKey>
              <ViewHeaderCallInfo>
                <DirectionRow>
                  <ViewProfileHeaderLive>
                    <ImageProfileLive source={Icon_Image.image_boy_profile} />
                  </ViewProfileHeaderLive>
                  <View>
                    <TextChannelName>
                      {"   " + channelName}
                    </TextChannelName>
                    <TextViewUserInLive>
                      <IconEyeStyled source={Icon_Image.eye_ic} />  10</TextViewUserInLive>
                  </View>
                </DirectionRow>
                <TouchableOpacity onPress={async () => {
                  await this.endCall()
                }}>
                  <IconClose source={Icon_Image.close_ic} />
                </TouchableOpacity>
              </ViewHeaderCallInfo>

              <ViewFooter >
                <ScrollViewMessage>
                  {message.map((v, ind) => {
                    return (
                      <View key={ind} style={{ marginVertical: 5, flexDirection: "row", alignItems: "center" }}>
                        <Image source={Icon_Image.image_boy_profile} style={{ height: 25, width: 25, borderRadius: 13 }} />
                        <ViewInfoDetailMessage>
                          <Text style={{ color: "white" }}>{v.name}:{v.message}</Text>
                        </ViewInfoDetailMessage>
                      </View>
                    )
                  })}
                </ScrollViewMessage>
                <ViewTabBarOption>
                  <ButtonOption
                    onPress={() => { }}>
                    <IconOption source={Icon_Image.shopping_bag} />
                  </ButtonOption>
                  <ViewCommentOption>
                    <TextInputComment
                      value={comment}
                      onChangeText={(t) => { this.setState({ comment: t }) }}
                      placeholder="comment..."
                      placeholderTextColor="white"
                    />
                    <TouchableOpacity
                      onPress={async () => {
                        comment ? await this._onPressSend() : null;
                      }}
                    >
                      <IconOption source={Icon_Image.send_ic} />
                    </TouchableOpacity>
                  </ViewCommentOption>
                  <ButtonOption
                    onPress={() => { }}>
                    <IconOption source={Icon_Image.share} />
                  </ButtonOption>
                  <ButtonOption
                    onPress={() => {
                      this.toggle()
                    }}>
                    <IconOption source={Icon_Image.heart_ic}
                    />
                  </ButtonOption>
                </ViewTabBarOption>
                <View />
              </ViewFooter>
            </ViewKey>
          </KeyboardAvoidingViewStyled>
          <Animated.Image source={Icon_Image.heart_ic}
            style={{
              width: 20,
              height: 20,
              position:"absolute",
              marginTop:Dimensions.get("window").height,
              top:this.state.animation.interpolate({
                inputRange: [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7, 0.8,0.9,1],
                outputRange: [0,-100,-170,-210,-300,-350,-400,-480,-590,-650,-Dimensions.get("window").height]
              }),
              left: this.state.animation.interpolate({
                inputRange: [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7, 0.8,0.9, 1],
                outputRange: [20, 60, 20, 70, 20,40,20,80,30,10,50]
              }),
              transform:[{
                scale:this.state.animation.interpolate({
                  inputRange: [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9, 1],
                  outputRange: [0.1,0.2,0.3,0.5,0.6,0.9,1, 1,0.7,0.5,0]
                }),
              }]
            }} />
        </ViewAbsoluteAllRender>}
      </View>
    ) : null;
  };
}
const mapStateToProps = (state) => ({
  data: state.data,
  userLogin: state.loginUserReducer.userLogin,
});

const mapDispatchToProps = (dispatch) => ({
  requestLiveThunk: () => dispatch(requestLiveThunk())
})

export default connect(mapStateToProps, mapDispatchToProps)(StartLiveLayout);
/**
 * @name styled  render list room
 * @description Vi???t c??c styled c???a _renderRoom ??? ????y
 */
const IconEyeStyled = styled.Image`
width: 10px;
height: 10px
`
const StartLiveButton = styled.TouchableOpacity`
paddingHorizontal: 16px;
paddingVertical: 8px;
backgroundColor: red;
marginBottom: 16px;
borderRadius: 30px;
width: 60px;
height: 60px;
justifyContent: center
alignItems: center;
marginTop:30px
`
const TextStartLiveButton = styled.Text`
color: white
fontWeight: bold;
fontSize: 13px
`
/**
 * @name styled renderCall
 * @description Vi???t c??c styled c???a renderCall ??? ????y
 */

const KeyboardAvoidingViewStyled = styled.KeyboardAvoidingView`
flex:1

`
const ViewAbsoluteAllRender = styled.View`
position: absolute
justifyContent: space-between
height: ${Dimensions.get('window').height - 80}px
paddingBottom: ${Platform.OS === "ios" ? 50 : 0}px
`
const ViewKey = styled.View`
flex:1
justifyContent: space-between
height: ${Dimensions.get('window').height - 80}px
paddingBottom: ${Platform.OS === "ios" ? 50 : 0}px
`
const ViewHeaderCallInfo = styled.View`
paddingVertical: 10px
flexDirection: row
justifyContent: space-between
paddingHorizontal: 10px
alignItems: center
width: ${Dimensions.get('window').width}
height: 50px
`
const DirectionRow = styled.View`
flexDirection: row
`
const ViewProfileHeaderLive = styled.View`
height: 32px
width: 32px
borderRadius: 16px
backgroundColor: white
alignItems: center
justifyContent: center
`
const ImageProfileLive = styled.Image`
height: 30px;
 width: 30px;
  borderRadius: 15px;
`
const TextChannelName = styled.Text`
color: white;
 fontWeight: bold;
`
const TextViewUserInLive = styled.Text`
color: white
marginLeft: 10px
fontSize: 12px
`
const IconClose = styled.Image`
height: 20px;
 width: 20px;
  borderRadius: 15px
`
const ViewFooter = styled.View`
width: 100%
justifyContent: space-between
`
const ScrollViewMessage = styled.ScrollView`
paddingHorizontal: 20px
marginVertical: 15px
width: 70%
height: 250px
`
const ViewInfoDetailMessage = styled.View`
backgroundColor: rgba(52, 52, 52, 0.5)
borderRadius: 15px
marginLeft: 10px
justifyContent: center
paddingHorizontal: 15px
paddingVertical: 10px
`
const ViewTabBarOption = styled.View`
height: 40px;
flexDirection: row;
alignItems: center;
justifyContent: space-around;
`
const ButtonOption = styled.TouchableOpacity`
width: 40px
height: 40px
borderRadius: 25px
backgroundColor: rgba(52, 52, 52, 0.5)
justifyContent: center;
alignItems: center;
`
const IconOption = styled.Image`
width: 20px;
 height: 20px
`
const ViewCommentOption = styled.View`
width: 50%
height: 40px
borderRadius: 25px
backgroundColor: rgba(52, 52, 52, 0.6)
flexDirection: row
alignItems: center
justifyContent: space-around
`
const TextInputComment = styled.TextInput`
width: 75%
height: 40px
borderRadius: 25px
color: white
padding: 5px
`

const ViewLiveStart = styled.View`
alignItems:center;
justifyContent:center;
width:${Dimensions.get("window").width}px;
height:${Dimensions.get("window").height - 80}px
`
const TextStartLive = styled.Text`
marginTop: 10px;
fontSize:10px;
textAlign: center ;
marginHorizontal:30px
`


