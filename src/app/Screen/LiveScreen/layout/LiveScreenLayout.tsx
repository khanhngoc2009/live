import React, { useState, useEffect } from "react";
import styled from 'styled-components/native'
import { requestCameraAndAudioPermission, Style, GoBackLayout as GoBack } from "@components";
import {
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    TextInput,
    ImageBackground
} from 'react-native';
import RtcEngine, {
    RtcLocalView,
    RtcRemoteView,
    VideoRenderMode, ChannelProfile, ClientRole, RtcEngineConfig, VideoFrameRate,
} from 'react-native-agora';
import { Icon_Image } from "@assets/image";
interface Message {
    url?: string,
    name?: string,
    message?: string,
}
interface State {
    appId: string;
    token: string;
    channelName: string;
    joinSucceed: boolean;
    peerIds: number[];
    _engine?: RtcEngine;
    listMessage?: Message[]
}
const config = require('../../../../agora.config.json');
const LiveScreenLayout = ({ navigation }, props: State) => {
    let { _engine } = props
    const [timeS, setTimeS] = useState(0)
    const [timeM, setTimeM] = useState(0)
    const [timeH, setTimeH] = useState(0)

    const [appId, setAppId] = useState("71f8c0878e08434caab1022f1abfc9dc");
    const [token, setToken] = useState("00671f8c0878e08434caab1022f1abfc9dcIABBcnhwOeSgp59uf+RVR4LWv3GZQqPZOpF1TtTz+aLtwL62AZkAAAAAEAAm+nFW2wnkYAEAAQDbCeRg");
    const [channelName, setChannelName] = useState('ex6');
    const [joinSucceed, setJoinSucceed] = useState(false);
    const [peerIds, setPeerIds] = useState([]);
    const [muteV, setMuteV] = useState(false);
    const [muteA, setMuteA] = useState(false);
    const [start, setStart] = useState(false);
    const [role, setRole] = useState(false);
    const [message, setMessage] = useState("");
    const [listMessage, setListMessage] = useState(props.listMessage ?? []);
    const [hideMessage, setHideMassage] = useState(false);
    const onPressSend = async () => {
        if (!message) {
            return;
        }
        const streamId = await _engine?.createDataStreamWithConfig({});
        await _engine?.sendStreamMessage(streamId!, message);
        setListMessage(
            [...listMessage, {
                name: "you",
                message: message
            }]
        )
        setMessage('');
    };
    const checkFlatForm = () => {
        if (Platform.OS === 'android') {
            requestCameraAndAudioPermission().then(() => {
                console.log('requested!');
            });
        }
    }
    useEffect(() => {
        checkFlatForm();
    }, [])
    useEffect(() => {
        init();
        if (start) {
            setTimeout(
                function () {
                    if (timeS < 60) { setTimeS(timeS + 1) }
                }, 1000);
            if (timeS == 60) {
                setTimeM(timeM + 1);
                setTimeS(0)
            }
            else if (timeM == 60) {
                setTimeH(timeH + 1);
                setTimeM(0);
                setTimeS(0)
            }
        }
    })
    useEffect(() => {
        return (() => {
            _engine?.destroy()
        })
    }, [])
    const init = async () => {
        _engine = await RtcEngine.createWithConfig(
            new RtcEngineConfig(config.appId)
        );
        _engine.addListener('UserJoined', (uid, elapsed,) => {
            if (peerIds.indexOf(uid) === -1) {
                setPeerIds([...peerIds, uid])
            }
        })
        _engine.addListener('UserOffline', (uid, reason) => {
            setPeerIds(peerIds.filter(id => id !== uid))
        })
        _engine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
            setJoinSucceed(true)
            setStart(true)
        })
        _engine?.addListener('StreamMessage', (uid, streamId, data) => {
            setListMessage([...listMessage, {
                name: `${uid}`,
                message: data,
            }])
        });
        _engine?.addListener(
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
        !muteV ? await _engine.enableVideo() : await _engine.disableVideo()
        await _engine.startPreview()
        await _engine.setChannelProfile(ChannelProfile.LiveBroadcasting)
        await _engine.setDefaultAudioRoutetoSpeakerphone(true);
        await _engine.setClientRole(!role ? ClientRole.Audience : ClientRole.Broadcaster)
    };
    const startCall = async () => {
        await _engine?.joinChannel(token, channelName, null, 0);
    };
    const endCall = async () => {
        await _engine?.leaveChannel();
        setJoinSucceed(false)
        setPeerIds([])
        setStart(false);
        setListMessage([]);
        setTimeH(0);
        setTimeM(0);
        setTimeS(0);
    };
    const onClickA = () => { !muteA ? _engine?.disableAudio() : _engine?.enableAudio(); }
    const width = Dimensions.get('window').width;
    const Height = Dimensions.get('window').height;
    
    const _renderVideos = () => {
        return joinSucceed ? (
            <View style={Style.fullView}>
                {!role ? <ScrollView style={Style.fullView}>
                    {peerIds.length != 0 && peerIds?.map((value, ind) => {
                        return (
                            <RtcRemoteView.SurfaceView
                                style={{
                                    width: width,
                                    height: Height - 100
                                }}
                                uid={value}
                                key={ind}
                                channelId={channelName}
                                renderMode={VideoRenderMode.Hidden}
                                zOrderMediaOverlay={true}
                            />
                        );
                    })}
                    {peerIds.length == 0 && <View style={{
                        width: width, height: Height - 100,
                        justifyContent: "center", alignItems: "center", padding: 40
                    }} >
                        <Text style={{ color: "red" }}>không có live nào đang hoạt động</Text>
                    </View>}
                </ScrollView>
                    : <View style={Style.fullView}>
                        <RtcLocalView.SurfaceView
                            style={Style.max}
                            channelId={channelName}
                            renderMode={VideoRenderMode.Hidden}
                        />
                        {_renderRemoteVideos()}
                    </View>}
            </View>
        ) : null;
    };
    const _renderToolBar = () => {
        return (
            <View>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: 10,
                    justifyContent: "space-around",
                    paddingHorizontal:5
                }}>
                    <TextInput
                        onChangeText={(text) => setMessage(text)}
                        placeholder={'Input Message'}
                        value={message}
                        style={{
                            borderColor: "gray",
                            borderWidth: 0.5,
                            marginHorizontal: 10,
                            height: 40,
                            borderRadius: 10,
                            width: "75%"
                        }}
                    />
                    <TouchableOpacity
                        style={{
                            backgroundColor: "blue",
                            padding: 12,
                            borderRadius: 10,
                        }}
                        onPress={() => onPressSend()} >
                        <Text style={{ color: "white" }}>Send</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };
    const _renderRemoteVideos = () => {
        return (
            <ScrollView
                style={Style.remoteContainer}
                contentContainerStyle={{ paddingHorizontal: 2.5 }}
                horizontal={true}>
                {peerIds?.map((value, ind) => {
                    return (
                        <RtcRemoteView.SurfaceView
                            style={Style.remote}
                            uid={value}
                            key={0}
                            channelId={channelName}
                            renderMode={VideoRenderMode.Hidden}
                            zOrderMediaOverlay={true}
                        />
                    );
                })}
            </ScrollView>
        );
    };
    return (
        <View style={Style.max}>
            <View style={Style.max}>
                <GoBack
                    title="Live Streaming"
                    style={{
                        marginTop: Platform.OS === "android" ? 0 : 40
                    }}
                    onClickIcon={() => { navigation.goBack() }}/>
                {!joinSucceed && <ViewContainer >
                    <ImageStyled
                     source={Icon_Image.live_image_live_stream_screen} 
                     style={{
                         width:"60%",
                         height:250
                    }}
                    />
                    <TextStyled style={{ marginTop: 10,fontSize:13 }}>{!role ? "Người xem LiveStream" : "Người LiveStream"}</TextStyled>
                    <TouchableOpacity
                        onPress={() => { setRole(!role) }}
                        style={{
                            borderRadius: 15,
                            height: 40,
                            width: 70,
                            backgroundColor: !role ? "green" : "red",
                            justifyContent: "center",
                            alignItems: "center",
                            marginTop:10
                        }}>
                        <Text style={{ color: "white", fontWeight: "bold" ,fontSize:13}}>Change</Text>
                    </TouchableOpacity>
                    <TextStyled style={{ marginTop: 10,fontSize:10 ,textAlign:"center",marginHorizontal:30}}>Hãy kết nối với mọi người bằng cách bắt đầu live stream hoặc thưởng thức live stream nào ...</TextStyled>
                </ViewContainer>}
                {_renderVideos()}
                <View>
                    <View style={Style.buttonHolder}>
                        <TouchableOpacity
                            onPress={joinSucceed ? endCall : startCall}
                            style={{
                                borderRadius: 25,
                                height: 50,
                                width: 50,
                                backgroundColor: !joinSucceed ? "green" : "red",
                                justifyContent: "center",
                                alignItems: "center",
                            }}>
                                <ImageStyled source={Icon_Image.phone_call_ic} />
                            {/* <Text style={{ color: "white", fontWeight: "bold" }}>{!joinSucceed ? "Start" : "End"}</Text> */}
                        </TouchableOpacity>
                        {(joinSucceed && role) && <TouchableOpacity
                            onPress={() => {
                                onClickA();
                                setMuteA(!muteA)
                            }}
                            style={{
                                borderRadius: 25,
                                height: 50,
                                width: 50,
                                backgroundColor: muteA ? "red" : "green",
                                justifyContent: "center",
                                alignItems: "center",
                            }}>
                            <ImageStyled source={!muteA ? Icon_Image.mic : Icon_Image.mute_mic} />
                        </TouchableOpacity>}
                        {(joinSucceed && role) && <TouchableOpacity
                            onPress={() => { setMuteV(!muteV) }}
                            style={{
                                borderRadius: 25,
                                height: 50,
                                width: 50,
                                backgroundColor: muteV ? "red" : "green",
                                justifyContent: "center",
                                alignItems: "center",
                            }}>
                            <ImageStyled source={!muteV ? Icon_Image.camera_on : Icon_Image.camera_off} />
                        </TouchableOpacity>}
                        {(joinSucceed && role) && <View
                            style={{
                                borderRadius: 25,
                                height: 50,
                                width: 80,
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                            <Text style={{ fontSize: 12, color: "red", fontWeight: "bold" }}>{timeH != 0 ? `${timeH}:` : null}{timeM != 0 ? `${timeM}:` : null}{timeS}s</Text>
                        </View>}
                    </View>

                    {joinSucceed && <View>{_renderToolBar()}</View>}
                    {joinSucceed && <ScrollView style={{ height: 300, position: "absolute", top: -200 }}>
                        {listMessage.map((e, ind) => {
                            return (
                                <View key={ind} style={{ padding: 2, flexDirection: "row", backgroundColor: "white" }}>
                                    <Text style={{ marginLeft: 3, color: "black" }}>{e.name}:</Text>
                                    <Text style={{ marginLeft: 3, color: "red" }}>{e.message}</Text>
                                </View>
                            )
                        })}</ScrollView>}
                </View>
            </View>
        </View>
    )
}
export default LiveScreenLayout;
const ViewContainer = styled.View`
flex:1;
justifyContent:center;
alignItems:center
`
const TextStyled = styled.Text`
color:black;
fontSize:18px
`
const ImageStyled = styled.Image`
width:30px;
height:30px;
`


