
import React, { Component, useEffect, useState } from 'react';
import {
  Alert,
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
import { flatMap } from 'lodash';
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
  const [input, setInput] = useState(myPro.userLogin?.email??"")
  const [inLobby, setInLobby] = useState(false)
  const [peerIds, setPeerIds] = useState([])
  const [seniors, setSeniors] = useState([])
  const [myUsername, setMyUsername] = useState("" + new Date().getTime())
  const [rooms, setRooms] = useState({})
  const [data, setData] = useState([])
  const [role, setRole] = useState(true)

  const checkFlatForm = () => {
    if (Platform.OS === 'android') {
      requestCameraAndAudioPermission().then(() => {
        console.log('requested!');
      });
    }
  }
  
  const getListMyProduct = () => {
    appDispatch(requestLiveThunk())
  }
  useEffect(() => {
    initRTC();
    initRTM();
  })

  useEffect(() => {
    checkFlatForm()
    // getListMyProduct()
  }, [])

  useEffect(() => {
    return (() => {
      _rtmEngine?.destroyClient();
      _rtcEngine?.destroy();
    })
  }, [])

  const _onCreate = (value?: Live) => {

  }

  const initRTC = async () => {
    _rtcEngine = await RtcEngine.create(appId);
    await _rtcEngine.enableVideo();

    _rtcEngine.addListener('Error', (err) => {
      console.log('Error', err);
    });
    // await _rtcEngine.setChannelProfile(ChannelProfile.LiveBroadcasting)
    // await _rtcEngine.setDefaultAudioRoutetoSpeakerphone(true);
    // await _rtcEngine.setClientRole(!role ? ClientRole.Audience : ClientRole.Broadcaster)
    _rtcEngine.addListener('UserJoined', (uid) => {
      if (peerIds.indexOf(uid) === -1) {
        if (inCall && seniors.length < 2) {
          _rtmEngine?.sendMessageByChannelId(
            'lobby',
            channelName + ':' + (peerIds.length + 2),
          );
        }
        setPeerIds([...peerIds, uid]);
      }
    });


    _rtcEngine.addListener('UserOffline', (uid) => {
      setPeerIds(peerIds.filter((id) => id !== uid))

    });
    _rtcEngine.addListener(
      'JoinChannelSuccess',
      (channel, uid, elapsed) => {
        console.log('JoinChannelSuccess', channel, uid, elapsed);
        setInCall(true);
      },
    );
  };

  const initRTM = async () => {
    _rtmEngine = new RtmEngine();

    _rtmEngine.on('error', (evt) => {
      console.log(evt);
    });

    _rtmEngine.on('channelMessageReceived', (evt) => {
      let { text } = evt;
      let data = text.split(':');
      setRooms({ ...rooms, [data[0]]: data[1] });
    });

    _rtmEngine.on('messageReceived', (evt) => {
      let { text } = evt;
      let data = text.split(':');
      setRooms({ ...rooms, [data[0]]: data[1] });
    });

    _rtmEngine.on('channelMemberJoined', (evt) => {
      let { channelId, uid } = evt;
      if (inCall && channelId === 'lobby' && seniors.length < 2) {
        _rtmEngine
          ?.sendMessageToPeer({
            peerId: uid,
            text: channelName + ':' + (peerIds.length + 1),
            offline: false,
          })
          .catch((e) => console.log(e));
      }
    });

    _rtmEngine.on('channelMemberLeft', (evt) => {
      let { channelId, uid } = evt;
      if (channelName === channelId) {
        setSeniors(seniors.filter((id) => id !== uid));
        setRooms({ ...rooms, [channelName]: peerIds.length });
        if (inCall && seniors.length < 2) {
          _rtmEngine
            ?.sendMessageByChannelId(
              'lobby',
              channelName + ':' + (peerIds.length + 1),
            )
            .catch((e) => console.log(e));
        }
      }
    });

    await _rtmEngine.createClient(appId).catch((e) => console.log(e));
    await _rtmEngine
      ?.login({ uid: myUsername })
      .catch((e) => console.log(e));

    await _rtmEngine?.joinChannel('lobby').catch((e) => console.log(e));
    if (!inCall) {
      setInLobby(true);
    } else setInLobby(false)
  };

  const joinCall = async (channelName: string) => {
    setChannelName(channelName)
    // setState({ channelName:channelName});

    await _rtcEngine?.joinChannel(token, channelName, null, 0);
    await _rtmEngine?.joinChannel(channelName)
      .catch((e) => console.log(e));
    let { members } = await _rtmEngine?.getChannelMembersBychannelId(
      channelName,
    );
    if (members.length === 1) {
      await _rtmEngine
        ?.sendMessageByChannelId('lobby', channelName + ':' + 1)
        .catch((e) => console.log(e));
    }
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
      Alert.alert("Message","đã thoát stream")
      await _rtcEngine?.leaveChannel();
      await _rtmEngine?.logout();
      await _rtmEngine?.login({ uid: myUsername });
      await _rtmEngine?.joinChannel('lobby');
      setPeerIds([]);
      setInCall(false);
      setInLobby(true);
      setSeniors([]);
      setChannelName('');
    } catch (error) {
    }
  };
  const _renderRooms = () => {
    return inLobby ? (
      <View style={styles.fullView}>
        <Text style={styles.subHeading}>Room List</Text>
        <ScrollView>
          {Object.keys(rooms).map((key, index) => {
            if (rooms[key] != 0) {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => joinCall(key)}
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
          onChangeText={(val) => setInput(val)}
          style={styles.input}
          placeholder={myPro.userLogin?.name}
        />
        <TouchableOpacity
          onPress={async () => {
            input? await joinCall(input):null;
          }}
          style={styles.button}>
          <Text style={styles.buttonText}>Create Room</Text>
        </TouchableOpacity>
      </View>
    ) : null;
  };

  const _renderCall = () => {
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
        <TouchableOpacity onPress={endCall} style={styles.button}>
          <Text style={styles.buttonText}>Leave Room</Text>
        </TouchableOpacity>
      </View>
    ) : null;
  };

  return (
    <SafeAreaView style={styles.max}>
      <GoBackLayout title="Live Room"
        onClickIcon={() => {
          navigation.goBack();
        }} />
      <View style={styles.spacer}>
        <Text style={styles.roleText}>
          {inCall ? "You're in " + channelName : 'Lobby: Join/Create a room'}
        </Text>
      </View>
      {_renderRooms()}
      {_renderCall()}
      {!inLobby && !inCall ? (
        <Text style={styles.waitText}>Please wait, joining room...</Text>
      ) : null}
    </SafeAreaView>
  );
}
const mapStateToProps = (state: GenericListInitialState<Live>) => ({
  data: state.data
});
const mapDispatchToProps = {
  requestLiveThunk
};
export default connect(mapStateToProps, mapDispatchToProps)(LiveRoomLayout);