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
  Dimensions
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
  message: Message[]
}
const width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;
const message = [
  { background: Icon_Image.profile, Name: "Huyền", message: "đã" },
  { background: Icon_Image.profile, Name: "Huyền", message: "đã" },
  { background: Icon_Image.profile, Name: "Huyền", message: "đã" },
  { background: Icon_Image.profile, Name: "Huyền", message: "đã" },
  { background: Icon_Image.profile, Name: "Huyền", message: "đã sssssss " },
  { background: Icon_Image.profile, Name: "Huyền", message: "đã" },
  { background: Icon_Image.profile, Name: "Huyền", message: "đã" },
  { background: Icon_Image.profile, Name: "Huyền", message: "đã" },
  { background: Icon_Image.profile, Name: "Huyền", message: "đã" },
]
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
      input: 'live stream ' + new Date().getTime(),
      inLobby: false,
      peerIds: [],
      seniors: [],
      myUsername: '' + new Date().getTime(),
      rooms: {},
      data: [],
      role: true,
      comment: "",
      timer: 0,
      message: []
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
  _onPressSend = async () => {
    if (this.state.comment) {
      const streamId = await this._rtcEngine?.createDataStreamWithConfig({});
      await this._rtcEngine?.sendStreamMessage(streamId!, this.state.comment);
      this.setState({
        message:
          [...this.state.message, {
            name: "you",
            message: this.state.comment
          }],
        comment: ""
      }
      )
    }
  };
  _update = async (channelName, countMember: number, status: boolean) => {
    let val = this.state.data.find((id) => id.channel === channelName)
    let params = { ...val, users: countMember, status: status };
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

  initRTC = async () => {

    const { appId, role, inCall, inLobby } = this.state;
    console.log(inLobby, "init");

    this._rtcEngine = await RtcEngine.createWithConfig(
      new RtcEngineConfig(appId)
    )
    await role ? this._rtcEngine.enableVideo() : this._rtcEngine.disableVideo();

    this._rtcEngine.addListener('Error', (err) => {
      console.log('Error', err);
    });
    await this._rtcEngine.setChannelProfile(ChannelProfile.LiveBroadcasting)
    await this._rtcEngine.setDefaultAudioRoutetoSpeakerphone(true);
    await this._rtcEngine.setClientRole(!role ? ClientRole.Audience : ClientRole.Broadcaster)
    this._rtcEngine.addListener('UserJoined', (uid) => {
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
    this._rtcEngine.addListener('UserOffline', (uid) => {
      const { peerIds } = this.state;
      this.setState({
        peerIds: peerIds.filter((id) => id !== uid),
      });
    });
    console.log(role);
    this._rtcEngine.addListener(
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
  };

  /**
   * @name initRTM
   * @description Function to initialize the Rtm Engine, attach event listeners and use them to sync usernames
   */
  initRTM = async () => {
    console.log(this.state.message);

    let { appId, myUsername } = this.state;
    this._rtmEngine = new RtmEngine();

    this._rtmEngine.on('error', (evt) => {
      console.log(evt);
    });

    this._rtmEngine.on('channelMessageReceived', (evt) => {
      let { text } = evt;
      let data = text.split(':');
      this.setState({ rooms: { ...this.state.rooms, [data[0]]: data[1] } });
    });

    this._rtmEngine.on('messageReceived', (evt) => {
      let { text } = evt;
      let data = text.split(':');
      this.setState({ rooms: { ...this.state.rooms, [data[0]]: data[1] } });
    });


    this._rtmEngine.on('channelMemberJoined', (evt) => {
      let { channelName, seniors, peerIds, inCall } = this.state;
      let { channelId, uid } = evt;
      if (inCall && channelId === 'lobby' && seniors.length < 2) {
        this._rtmEngine
          ?.sendMessageToPeer({
            peerId: uid,
            text: channelName + ':' + (peerIds.length + 1),
            offline: false,
          })
          .catch((e) => console.log(e));
        this._update(channelName, peerIds.length + 1, true)
      }

    });

    this._rtmEngine.on('channelMemberLeft', (evt) => {
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
  joinCall = async (channelName: any) => {
    this.setState({ channelName });
    let { token } = this.state;
    await this._rtcEngine?.joinChannel(token, channelName, null, 0);
    await this._rtmEngine?.joinChannel(channelName)
      .catch((e) => console.log(e));
    let { members } = await this._rtmEngine?.getChannelMembersBychannelId(
      channelName,
    );
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

    if (role) {
      this._update(channelName, 0, false)
      // let val = data.find((e) => e.channel === channelName)
      // await axios.delete(`${ApiURL.Live}/${val?.id}`).then((res) => {
      //   this.setState({ data: data.filter((id) => id.id !== res.data.id) })
      //   console.log(res.data);
      // }).catch((e) => {
      //   console.log(e);
      // })
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

  _renderRooms = () => {
    const { inLobby, rooms, input, data, comment } = this.state;
    return inLobby ? (
      <View style={styles.fullView}>
        {data?.filter((e) => e.status).length != 0 &&
          <>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "red", marginVertical: 20 }}>Đang live stream</Text>
            <ScrollView horizontal={true}>
              {data?.filter((e) => e.status).map((value: Live, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={async () => {
                      this.setState({ role: false })
                      await this.joinCall(value.channel)
                    }}
                    style={{
                      width: 180,
                      height: 180,
                      backgroundColor: "white",
                      padding: 5
                    }}>
                    <ImageBackground source={Icon_Image.image_live_example} style={{ width: "100%", height: "100%" }} >
                      <View style={{
                        height: 25,
                        width: "60%",
                        alignItems: "center",
                        flexDirection: "row",
                        margin: 10
                      }}>
                        <ViewLeftBtnRender >
                          <View style={{ width: 5, height: 5, backgroundColor: "white", borderRadius: 3 }} />
                          <Text style={{ color: "white", fontWeight: "bold", marginLeft: 5, fontSize: 12 }}>Live</Text>
                        </ViewLeftBtnRender>
                        <View style={{ width: "50%" }}>
                          <ViewRightBtnRender />
                          <Text style={{
                            color: "white",
                            marginLeft: 5,
                            fontSize: 12,
                            position: "absolute",
                            marginVertical: 5,
                            marginHorizontal: 5
                          }}>
                            <Image source={Icon_Image.eye_ic}
                              style={{ width: 10, height: 10 }} /> {value.users}</Text>
                        </View>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                );
              })}

            </ScrollView>
          </>}
        {data?.filter((e) => !e.status).length != 0 &&
          <>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "gray", marginVertical: 20 }}>Đã phát live</Text>
            <ScrollView horizontal={true}>
              {data?.filter((e) => !e.status).map((value: Live, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={async () => {
                      this.setState({ role: false })
                      await this.joinCall(value.channel)
                    }}
                    style={{
                      width: 180,
                      height: 180,
                      backgroundColor: "white",
                      padding: 5
                    }}>
                    <ImageBackground source={Icon_Image.image_live_example} style={{ width: "100%", height: "100%" }} >
                      <View style={{
                        height: 25,
                        width: "60%",
                        alignItems: "center",
                        flexDirection: "row",
                        margin: 10
                      }}>
                        <ViewLeftBtnRender style={{ backgroundColor: "gray" }}>
                          <View style={{ width: 5, height: 5, backgroundColor: "white", borderRadius: 3 }} />
                          <Text style={{ color: "white", fontWeight: "bold", marginLeft: 5, fontSize: 12 }}>Lived</Text>
                        </ViewLeftBtnRender>
                        <View style={{ width: "50%" }}>
                          <ViewRightBtnRender />
                          <Text style={{
                            color: "white",
                            marginLeft: 5,
                            fontSize: 12,
                            position: "absolute",
                            marginVertical: 5,
                            marginHorizontal: 5
                          }}>
                            <Image source={Icon_Image.eye_ic}
                              style={{ width: 10, height: 10 }} /> {value.users}</Text>
                        </View>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                );
              })}
              <Text>
                {data?.length === 0
                  ? 'No active rooms, please create new room'
                  : null}
              </Text>
            </ScrollView>
          </>}
        {data?.length === 0 && <ScrollView horizontal={true}>
          <Text>
            {data?.length === 0
              ? 'No active rooms, please create new room'
              : null}
          </Text>
        </ScrollView>}
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity
            onPress={async () => {
              let value = data?.filter((e) => e.channel === input)
              if (value?.length == 0) {
                await this.setState({ role: true })
                await this.joinCall(input)
              } else {
                Alert.alert("Message", "Error")
              }
            }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: 'red',
              marginBottom: 16,
              borderRadius: 30,
              width: 60,
              height: 60,
              justifyContent: "center",
              alignItems: "center"
            }}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 13 }}>Live</Text>
          </TouchableOpacity>
        </View>
      </View>
    ) : null;
  };

  _renderCall = () => {
    const { inCall, peerIds, channelName, data, comment, role } = this.state;
    return inCall ? (
      <View style={{}}>
        {role ? <RtcLocalView.SurfaceView
          style={styles.video}
          channelId={channelName}
          renderMode={VideoRenderMode.Hidden}
        /> : <ScrollView>
          {data?.filter((e) => e.channel === channelName).length != 0 ? <>
            {data?.filter((e) => e.channel === channelName).map((val, index) => {
              return (
                <RtcRemoteView.SurfaceView
                  channelId={channelName}
                  renderMode={VideoRenderMode.Hidden}
                  key={index}
                  uid={val.uid}
                  style={styles.video}
                />
              );
            })}
          </> : <Text >Đã tắt</Text>}
        </ScrollView>}
        {data?.filter((e) => e.channel === channelName).length != 0 && <View style={{
          position: "absolute",
          justifyContent: "space-between",
          height: Height - 80,
          paddingBottom: Platform.OS === "ios" ? 50 : 0,
        }}>
          <View style={{
            paddingVertical: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 10,
            alignItems: "center",
            width: width,
            height: 50,
          }}>
            <View style={{ flexDirection: "row" }}>
              <View style={{
                height: 32,
                width: 32,
                borderRadius: 16,
                backgroundColor: "white",
                alignItems: "center",
                justifyContent: "center"
              }}
              >
                <Image source={Icon_Image.image_boy_profile} style={{ height: 30, width: 30, borderRadius: 15 }} />
              </View>
              <View>
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {"   " + channelName}
                </Text>
                <Text style={{
                  color: "white",
                  marginLeft: 10,
                  fontSize: 12,
                }}>
                  <Image source={Icon_Image.eye_ic}
                    style={{ width: 10, height: 10 }} />  10</Text>
              </View>
            </View>
            <TouchableOpacity onPress={async () => {

              await this.endCall()
            }} style={{
              // margin:10
            }}>
              <Image source={Icon_Image.close_ic} style={{ height: 20, width: 20, borderRadius: 15 }} />
            </TouchableOpacity>
          </View>
          <View style={{
            width: "100%",
            justifyContent: "space-between",
          }}>
            <ScrollView
              style={{
                paddingHorizontal: 20,
                marginVertical: 15,
                width: "70%",
                height: 250,
              }}>
              {message.map((v, ind) => {
                return (
                  <View key={ind} style={{ marginVertical: 5, flexDirection: "row", alignItems: "center" }}>
                    <Image source={Icon_Image.image_boy_profile} style={{ height: 25, width: 25, borderRadius: 13 }} />
                    <View style={{
                      backgroundColor: 'rgba(52, 52, 52, 0.5)',
                      borderRadius: 15,
                      marginLeft: 10,
                      justifyContent: "center",
                      paddingHorizontal: 15,
                      paddingVertical: 10
                    }}>
                      <Text style={{ color: "white" }}>{v.Name}:{v.message}</Text>
                    </View>
                  </View>
                )
              })}
            </ScrollView>
            <View style={{
              height: 40,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
            }}>
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 25,
                  backgroundColor: 'rgba(52, 52, 52, 0.5)',
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => { }}>
                <Image source={Icon_Image.shopping_bag} style={{ width: 20, height: 20 }} />
              </TouchableOpacity>
              <View style={{
                width: "50%",
                height: 40,
                borderRadius: 25,
                backgroundColor: 'rgba(52, 52, 52, 0.6)',
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-around"
              }}>
                <TextInput
                  value={comment}
                  onChangeText={(t) => { this.setState({ comment: t }) }}
                  placeholder="comment..."
                  placeholderTextColor="white"
                  style={{
                    width: "75%",
                    height: 40,
                    borderRadius: 25,
                    color: "white",
                    padding: 5,
                  }}
                />
                <TouchableOpacity
                  onPress={async () => {
                    comment ? await this._onPressSend() : null;
                  }}
                >
                  <Image source={Icon_Image.send_ic} style={{ width: 20, height: 20 }} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 25,
                  backgroundColor: 'rgba(52, 52, 52, 0.5)',
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => { }}>
                <Image source={Icon_Image.share} style={{ width: 20, height: 20 }} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 25,
                  backgroundColor: 'rgba(52, 52, 52, 0.5)',
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => { }}>
                <Image source={Icon_Image.heart_ic} style={{ width: 25, height: 25, borderRadius: 13 }} />
              </TouchableOpacity>
            </View>
            <View />
          </View>
        </View>}
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
