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
  KeyboardAvoidingView
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
  keyboardStatus: any
}
class LiveRoomLayout extends Component<{ navigation, requestLiveThunk, data }, State> {
  _rtcEngine?: RtcEngine;
  _rtmEngine?: RtmEngine;
  constructor(props?: State & any) {
    super(props);
    this.state = {
      appId: '9f7cb444e3c84a788609a98dd123e75a',
      token: null,
      channelName: "",
      inCall: false,
      input: 'live stream',
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
      keyboardStatus: undefined
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
   * @description hàm gửi message 
   */
  _onPressSend = async () => {
    const { comment, message } = this.state
    if (comment) {
      const streamId = await this._rtcEngine?.createDataStreamWithConfig({});
      const channelId=await this._rtmEngine?.createClient
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
   * @param channelName tên của channel đang hiện hữu
   * @param countMember số người đang có trong live
   * @param status trạng thái của live stream
   * @description hàm xử lý update live
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
   * @description initRTC sử lý các sự kiện của rtc engine
   */
  initRTC = async () => {
    const { appId, inLobby } = this.state;
    this._rtcEngine = await RtcEngine.createWithConfig(
      new RtcEngineConfig(appId)
    )
    await this._rtcEngine.enableVideo();
    await this._rtcEngine.setChannelProfile(ChannelProfile.Communication)
    await this._rtcEngine.setDefaultAudioRoutetoSpeakerphone(true);
    await this._rtcEngine.setClientRole(ClientRole.Broadcaster)
    await this._rtcEngine.enableVideo();
    await this._rtcEngine.muteLocalAudioStream(true);
    await this._rtcEngine.muteLocalVideoStream(true);
    this._addListener(this._rtcEngine);
  };
  /**
   * @name _addListener
   * @param _rtcEngine truyền vào giá trị rtcEngine
   * @description lắng nghe các sự kiện xảy ra
   */
  _addListener = (_rtcEngine) => {
    const { appId, myUsername } = this.state;
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
   * @description function con của init RTM
   */
  _onRTM = (_rtmEngine) => {
    _rtmEngine.on('error', (evt) => {
      console.log(evt);
    });
    _rtmEngine.on('channelMessageReceived', (evt) => {
      let { text } = evt;
      let data = text.split(':');
      this.setState({ rooms: { ...this.state.rooms, [data[0]]: data[1] } });
    });
    _rtmEngine.on('messageReceived', (evt) => {
      let { text } = evt;
      console.log(text,"messageReceived");
      let data = text.split(':');
      
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
      }
    });
    _rtmEngine.on('channelMemberLeft', (evt) => {
      console.log("channelMemberLeft");
      let { channelId, uid } = evt;
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
        ?.sendMessageByChannelId('lobby', channelName + ':' + 1+':'+0)
        .catch((e) => console.log(e));
    }
    this.setState({
      inLobby: false,
      seniors: members.map((m: any) => m.uid),
    });
  };
  endCall = async () => {
    let { channelName, myUsername, peerIds, seniors } = this.state;
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
      role: false,
    });
  };
  _renderEndCall = () => {
    setTimeout(() => {
      if (this.state.peerIds
        ?.length === 0) {
        this.endCall()
      }
    }, 1500)
    return (
      <TextTurnOffLive>Live đã tắt</TextTurnOffLive>
    )
  }
  /**
   * @returns all render cần thiết
   */
  render() {
    const { inCall, channelName, inLobby, role } = this.state;
    return (
      <SafeAreaView style={styles.max}>
        {!inCall && <GoBackLayout title="Live Room"
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
   * @returns render ra danh sách live đang 
   */
  _renderRooms = () => {
    const { inLobby, rooms, input, data, comment } = this.state;
    return inLobby ? (
      <View style={styles.fullView}>
        {Object.keys(rooms).length != 0 &&
          <>
            <TextTitleStatusRoom >Đang live stream</TextTitleStatusRoom>
            <ScrollView horizontal={true}>
              {Object.keys(rooms).map((key, index) => {
                if (rooms[key] != 0) {
                  return (
                    <ButtonLiveRoom
                      key={index}
                      onPress={() => {
                        this.setState({ role: false }, () => this.joinCall(key, false))
                      }}>
                      <ImageBackgroundButton source={Icon_Image.image_live_example} >
                        <ViewLiveStatus>
                          <ViewLeftBtnRender >
                            <RedDot />
                            <TextRedDot>Live</TextRedDot>
                          </ViewLeftBtnRender>
                          <View style={{ width: "50%" }}>
                            <ViewRightBtnRender />
                            <TextUserInLive>
                              <IconEyeStyled source={Icon_Image.eye_ic} /> {rooms[key]}</TextUserInLive>
                          </View>
                        </ViewLiveStatus>
                      </ImageBackgroundButton>
                    </ButtonLiveRoom>
                  );
                }
              })}
            </ScrollView>
          </>}
        {Object.keys(rooms)?.length === 0 && <ScrollView horizontal={true}>
          <Text>
            {Object.keys(rooms)?.length === 0
              ? 'No active rooms, please create new room'
              : null}
          </Text>
        </ScrollView>}
      </View>
    ) : null;
  };
  /**
   * @name renderCall 
   * @returns render ra màn hình call khi gọi tới
   */
  _renderCall = () => {
    const { inCall, peerIds, channelName, data, comment, message } = this.state;
    return inCall ? (
      <View style={{}}>
        {peerIds?.length != 0 ? <>
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
          <ViewAbsoluteAllRender >
            <KeyboardAvoidingViewStyled
              style={{ flex: 1 }}
              enabled
              behavior={(Platform.OS !== 'ios' && 'padding') || undefined}
              keyboardVerticalOffset={85}
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

                <ViewFooter>
                  <ScrollViewMessage>
                    {message.map((v, ind) => {
                      return (
                        <View key={ind} style={{ marginVertical: 5, flexDirection: "row", alignItems: "center" }}>
                          <Image source={Icon_Image.image_boy_profile} style={{ height: 25, width: 25, borderRadius: 13 }} />
                          <ViewInfoDetailMessage>
                          <Text style={{ color:"white" }}>{v.name}:{v.message}</Text>
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
                      onPress={() => { }}>
                      <IconOption source={Icon_Image.heart_ic} />
                    </ButtonOption>
                  </ViewTabBarOption>
                  <View />
                </ViewFooter>
              </ViewKey>
            </KeyboardAvoidingViewStyled>
          </ViewAbsoluteAllRender>
        </> : <ViewTurnOffLive source={Icon_Image.friends_image_home_screen}>
          {this._renderEndCall()}
        </ViewTurnOffLive>}
      </View>
    ) : null;
  };
}
const mapStateToProps = (state: GenericListInitialState<Live>) => ({
  data: state.data
});

const mapDispatchToProps = (dispatch) => ({
  requestLiveThunk: () => dispatch(requestLiveThunk())
})

export default connect(mapStateToProps, mapDispatchToProps)(LiveRoomLayout);
/**
 * @name styled  render list room
 * @description Viết các styled của _renderRoom ở đây
 */
const TextTitleStatusRoom = styled.Text`
fontSize: 16px;
fontWeight: bold;
color: red;
marginVertical: 20px;
`
const ButtonLiveRoom = styled.TouchableOpacity`
width: 180px
height: 180px
backgroundColor: white
padding: 5px
`
const ImageBackgroundButton = styled.ImageBackground`
 width: 100% ;
 height: 100% ;
 `
const ViewLeftBtnRender = styled.View`
 width: 50%
 height: 25px
 justifyContent: center
 alignItems: center
 flexDirection: row
 backgroundColor: red
 borderBottomLeftRadius: 10px
 borderTopLeftRadius: 10px
 `
const ViewRightBtnRender = styled.View`
 width: 100%
 height: 25px
 justifyContent: center
 alignItems: center
 flexDirection: row
 backgroundColor: black
 borderBottomRightRadius: 10px
 borderTopRightRadius: 10px
 opacity: 0.2
 `
const ViewLiveStatus = styled.View`
height: 25px
width: 60%
alignItems: center
flexDirection: row
margin: 10px
`
const RedDot = styled.View`
width: 5px
height: 5px;
backgroundColor: white;
borderRadius: 3px
`
const TextRedDot = styled.Text`
color: white
fontWeight: bold;
marginLeft: 5px
 fontSize: 12px
`
const TextUserInLive = styled.Text`
color: white
marginLeft: 5px
fontSize: 12px
position: absolute
marginVertical: 5px
marginHorizontal: 5px
`
const IconEyeStyled = styled.Image`
width: 10px;
height: 10px
`
/**
 * @name styled renderCall
 * @description Viết các styled của renderCall ở đây
 */

const KeyboardAvoidingViewStyled = styled.KeyboardAvoidingView`
flex:1

`
const ViewAbsoluteAllRender = styled.View`
position: absolute
justifyContent: space-between
height: ${Dimensions.get('window').height - 80}
paddingBottom: ${Platform.OS === "ios" ? 50 : 0}
`
const ViewKey = styled.View`
flex:1
justifyContent: space-between
height: ${Dimensions.get('window').height - 80}
paddingBottom: ${Platform.OS === "ios" ? 50 : 0}
`
const ViewHeaderCallInfo = styled.View`
paddingVertical: 10px
flexDirection: row
justifyContent: space-between
paddingHorizontal: 10px
alignItems: center
width: ${Dimensions.get('window').width}
height: 50
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
height: 30;
 width: 30;
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
width: 100%
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
const ViewTurnOffLive = styled.ImageBackground`
justifyContent:center;
alignItems:center;
height: ${Dimensions.get("window").height - 80}px
width:100%
`
const TextTurnOffLive = styled.Text`
color:red;
fontSize:18px
fontWeight:bold
`


