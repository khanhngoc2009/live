
import React, { Component, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  View,
  Dimensions,
  ImageBackground
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
import styled from 'styled-components/native'
import { Icon_Image } from '@assets/image';
import { Icon } from 'react-native-vector-icons/Icon';
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
  role?: boolean;
  _rtcEngine?: RtcEngine;
  _rtmEngine?: RtmEngine;
  live?: Live
}
const LiveRoomLayout = ({ navigation }, props: State) => {
  let { _rtcEngine, _rtmEngine } = props
  const appDispatch = useAppDispatch()
  const myLive = useAppSelector(state => state.LiveRoomReducer)
  const myPro = useAppSelector(state => state.loginUserReducer)
  const [appId, setAppId] = useState("9f7cb444e3c84a788609a98dd123e75a");
  const [token, setToken] = useState(null)
  const [channelName, setChannelName] = useState("")
  const [inCall, setInCall] = useState(false)
  const [input, setInput] = useState("thailan livestream")
  const [inLobby, setInLobby] = useState(false)
  const [peerIds, setPeerIds] = useState([])
  const [seniors, setSeniors] = useState([])
  const [myUsername, setMyUsername] = useState("" + new Date().getTime())
  const [rooms, setRooms] = useState({})
  const [data, setData] = useState(props.data ?? [])
  const [role, setRole] = useState(true)
  const width = Dimensions.get('window').width;
  const Height = Dimensions.get('window').height;
  const [comment, setComment] = useState("")
  const [count, setCount] = useState(0);
  const [v, setV] = useState(props.live)

  const checkFlatForm = () => {
    if (Platform.OS === 'android') {
      requestCameraAndAudioPermission().then(() => {
        console.log('requested!');
      });
    }
  }
  const CreateLiveRoom = async (params: Live) => {
    setCount(2)
    await axios.post(ApiURL.Live, params).then((res) => {
      setData([...data, res.data]);
      setV(null);

    }).catch((e) => {
    })
  }
  const getAllLiveStreaming = async () => {
    await axios.get(ApiURL.Live).then((res) => {
      if (res.status === 200) {
        setData(res.data)
        console.log(res.data);

      }
    }).catch((e) => {
      console.log(e);

    })
  }
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

  useEffect(() => {
    checkFlatForm();
    getAllLiveStreaming()
    return (() => {
      _rtmEngine?.destroyClient();
      _rtcEngine?.destroy();
    })
  }, [])

  useEffect(() => {
    initRTC();
    if (count === 0 && v && role) {
      CreateLiveRoom(v);
    }
  })
  const initRTC = async () => {
    _rtcEngine = await RtcEngine.create(appId);
    role ? await _rtcEngine.enableVideo() : _rtcEngine.disableVideo();
    await _rtcEngine.addListener('Error', (err) => {
      // console.log('Error', err);
    });
    await _rtcEngine.setChannelProfile(ChannelProfile.LiveBroadcasting)
    await _rtcEngine.setDefaultAudioRoutetoSpeakerphone(true);
    await _rtcEngine.setClientRole(!role ? ClientRole.Audience : ClientRole.Broadcaster)
    _rtcEngine.addListener('UserJoined', (uid) => {
      console.log(uid);
      
    });
    await _rtcEngine.addListener('UserOffline', (uid) => {
      console.log(uid);
      
      // let val=data.find((e)=>e.channel===channelName)
      // console.log(val);
      
      // if(val.uid===uid){
      //   setInCall(false);
      //   setInLobby(true);
      // }
    });

    await _rtcEngine.addListener(
      'JoinChannelSuccess',
      (channel, uid, elapsed) => {
        console.log('JoinChannelSuccess', channel, uid, elapsed);
        if (count === 0) {
          let v = {
            ...props.live,
            uid: uid,
            channel: channel,
            token: token,
            users: 0,
            appId: appId,
          };
          setV(v)
        }
        setInCall(true);
      },
    );
    initRTM();
  };
  const initRTM = async () => {
    _rtmEngine = new RtmEngine();
    await _rtmEngine.on('error', (evt) => {
      // console.log(evt);
    });
    await _rtmEngine.on('channelMessageReceived', (evt) => {
      let { text } = evt;
      let data = text.split(':');
      setRooms({ ...rooms, [data[0]]: data[1] });
    });
    await _rtmEngine.on('messageReceived', (evt) => {

      let { text } = evt;
      let data = text.split(':');
      setRooms({ ...rooms, [data[0]]: data[1] });
    });
    await _rtmEngine.on('channelMemberJoined', (evt) => {
      let { channelId, uid } = evt;
      if (inCall && channelId === 'lobby' && seniors.length < 2) {
        _rtmEngine
          ?.sendMessageToPeer({
            peerId: uid,
            text: channelName + ':' + (peerIds.length + 1),
            offline: false,
          }).catch((e) => {});
      }
    });
    await _rtmEngine.on('channelMemberLeft', (evt) => {
      let { channelId, uid } = evt;
      if (channelName === channelId) {
        setSeniors(seniors.filter((id) => id !== uid));
        setRooms({ ...rooms, [channelName]: peerIds.length });
        if (inCall && seniors.length < 2) {
          _rtmEngine
            ?.sendMessageByChannelId(
              'lobby',
              channelName + ':' + (peerIds.length + 1),
            ).catch((e) => {});
        }
      }
    });
    await _rtmEngine.createClient(appId).catch((e) => {});
    await _rtmEngine
      ?.login({ uid: myUsername })
      .catch((e) => {});

    await _rtmEngine?.joinChannel('lobby').catch((e) => {});
    if (!inCall) {
      setInLobby(true);
    }
  };
  const joinCall = async (channelName: string) => {
    setChannelName(channelName)
    await _rtcEngine?.joinChannel(token, channelName, null, 0);
    await _rtmEngine?.joinChannel(channelName)
      .catch((e) => {});
    let { members } = await _rtmEngine?.getChannelMembersBychannelId(
      channelName,
    );
    if (members.length === 1) {
      await _rtmEngine
        ?.sendMessageByChannelId('lobby', channelName + ':' + 1)
        .catch((e) => {});
    }
    setInCall(true)
    setInLobby(false);
    setSeniors(members.map((m: any) => m.uid))
  };
  const endCall = async () => {
    try {
      if (seniors.length < 2) {
        await _rtmEngine
          ?.sendMessageByChannelId('lobby', channelName + ':' + peerIds.length)
          .catch((e) => console.log(e));
      }
      Alert.alert("Message", "đã thoát stream")
      await _rtcEngine?.leaveChannel();
      await _rtmEngine?.logout();
      await _rtmEngine?.login({ uid: myUsername });
      await _rtmEngine?.joinChannel('lobby');
      if (role) {
        let val = data.find((e) => e.channel === channelName)
        await axios.delete(`${ApiURL.Live}/${val.id}`).then((res) => {
          setData(data.filter((id) => id.id !== res.data.id))
        }).catch((e) => {
          console.log(e);
        })
      }
      setPeerIds([]);
      setInCall(false);
      setInLobby(true);
      setSeniors([]);
      setChannelName('');
      setRole(false)
    } catch (error) {
    }
  };
  const _renderRooms = () => {
    return inLobby ? (
      <View style={styles.fullView}>
        <ScrollView horizontal={true}>
          {data?.map((value, index) => {
            return (
              <TouchableOpacity
                key={index}
                onPress={async () => {
                  await setRole(false)
                  await joinCall(value.channel)
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
          <Text>
            {data.length === 0
              ? 'No active rooms, please create new room'
              : null}
          </Text>
        </ScrollView>
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity
            onPress={async () => {
              let value = data?.filter((e) => e.channel === input)
              if (value?.length == 0) {
                setRole(true)
                setCount(0);
                await joinCall(input)
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
  const switchCamera = async () => {
    await _rtcEngine?.switchCamera()
  }
  const _renderCall = () => {
    return inCall ? (
      <View style={{}}>
        {role ? <RtcLocalView.SurfaceView
          style={styles.video}
          channelId={channelName}
          renderMode={VideoRenderMode.Hidden}
        /> : <ScrollView>
          {data.length != 0 ? <>
            {data.map((val, index) => {
              if (val.channel === channelName) {
                return (
                  <RtcRemoteView.SurfaceView
                    channelId={channelName}
                    renderMode={VideoRenderMode.Hidden}
                    key={index}
                    uid={val.uid}
                    style={styles.video}
                  />
                );
              }
            })}
          </> : <Text>Đã tắt</Text>}
        </ScrollView>}
        <View style={{
          position: "absolute",
          justifyContent: "space-between",
          height: Height - 80,
          paddingBottom: Platform.OS === "ios" ? 50 : 0,
          // backgroundColor:"red"
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
              await endCall()
            }} style={{
              // margin:10
            }}>
              <Image source={Icon_Image.x_ic} style={{ height: 20, width: 20, borderRadius: 15 }} />
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
              // backgroundColor:"red"
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
                  onChangeText={(t) => { setComment(t) }}
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
                <TouchableOpacity><Image source={Icon_Image.send_ic} style={{ width: 20, height: 20 }} /></TouchableOpacity>
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
        </View>
      </View>
    ) : null;
  };
  return (
    <SafeAreaView style={styles.max}>
      {!inCall && <GoBackLayout title="Live Room"
        onClickIcon={() => {
          navigation.goBack();
        }} />}
      {_renderRooms()}
      {_renderCall()}
      {!inLobby && !inCall ? (
        <Text style={styles.waitText}>Please wait, joining room...</Text>
      ) : null}
    </SafeAreaView>
  );
}

export default LiveRoomLayout

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