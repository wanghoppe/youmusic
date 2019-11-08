import React, {useState, useEffect, useCallback, useRef } from 'react';
import { TouchableHighlight, TouchableOpacity, Alert,  Text, View, TextInput,
  ScrollView, KeyboardAvoidingView, StatusBar, FlatList, Modal } from 'react-native';
import { showMessage, hideMessage } from "react-native-flash-message";
import Constants from 'expo-constants';
import ModalDropdown from 'react-native-modal-dropdown';
import { Audio } from 'expo-av';

import {color, styles, itemHeight, TRACK_DIR, itemFontSize, flatlist_getItemLayout} from './styleConst';
import { Button, Icon, Slider } from 'react-native-elements';

const data_lst = [
  "馮提莫 - 佛系少女「我的愛不過氣 」♪Karendaidai♪-VArUc-bCanQ.mp3",
  "13 Year Old Singing Like a Lion Earns Howie's Golden Buzzer America's Got Talent-d59H0UxhyaY.mp3",
  "陈一发儿－白山茶-qZ5U7s8T5oI.mp3",
  "Taylor Swift - Lover--BjZmE2gtdo.mp3",
  "牽絲戲 by 銀臨 & Aki阿杰 QIAN SI XI-C6YobfNjeqc.mp3",
  "音闕詩聽 - 白露 (feat.王梓鈺)【動態歌詞Lyrics】-NSwQ0OlwUn0.mp3",
  "4位去外国“砸场子”的女歌手，她们一开口，台下老外沸腾了 超清 254299796-C-u30Mdlj4Y.mp3",
  "音闕詩聽 - 芒種 (feat.趙方婧)【動態歌詞Lyrics】-ZHFgk8Eo0FE.mp3",
  "HITA - 赤伶「情字難落墨，她唱須以血來和。」[ High Quality Lyrics ][ Chinese Style ] tk推薦-4ROBQMlh3Ew.mp3",
  "《芒種》音闕詩聽，（芒种 录音室版），一想到你我就~-eoar4WDRSHk.mp3",
  "【蕭憶情】不謂俠【《蕭音瀰漫》專輯收錄曲】-cb2hVNAhPJ4.mp3",
  "Despacito - Luis Fonsi, Daddy Yankee ft. Justin Bieber (Madilyn Bailey & Leroy Sanchez Cover)-ASAzwmORUJk.mp3",
  "汪小敏《笑看風雲》挑戰主打歌 2018-07-27-36h0-Z6KbL0.mp3",
  "陳粒 - 奇妙能力歌-p0GPJbdKhCw.mp3"
]

export function PlayingComp(props){

  const initdata_ref = useRef({playlst: data_lst, init_index: 0});

  const [play_index, _setPlayIndex] = useState(0);
  const play_index_ref = useRef(play_index);
  const [playing, setPlaying] = useState(true);
  const [init_created, setInitCreated] = useState(false);
  const sound_ref = useRef();
  const flatlist_ref = useRef();

  const setPlayIndex = useCallback((index) => {
    _setPlayIndex(index);
    play_index_ref.current = index;
  })

  const getNextIndex = () => {
    return (play_index_ref.current + 1) % data_lst.length
  }

  const loadSoundIndex = async (index) => {
    // console.log(index)
    await sound_ref.current.unloadAsync();
    const source = {
      uri: TRACK_DIR + encodeURIComponent(initdata_ref.current.playlst[index])
    };
    const init_status = {
      shouldPlay: playing
    };
    await sound_ref.current.loadAsync(source, init_status);
    setPlayIndex(index);
    // flatlist_ref.current.scrollToIndex(play_index_ref.current);
  }

  const nextTrack = () => {
    const index = getNextIndex();
    loadSoundIndex(index);
    console.log(index);
    flatlist_ref.current.scrollToIndex({index:index});
  }

  const onItemClick = async (index) => {
    setPlayIndex(index);

    await sound_ref.current.unloadAsync();

    const source = {
      uri: TRACK_DIR + encodeURIComponent(initdata_ref.current.playlst[index])
    };
    const init_status = {
      shouldPlay: playing
    };
    await sound_ref.current.loadAsync(source, init_status);
  }

  const initLoadSound = async () => {
    let track_name = initdata_ref.current.playlst[initdata_ref.current.init_index]

    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      allowsRecordingIOS: false,
      interruptionModeIOS : Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
      playsInSilentModeIOS : true,
      interruptionModeAndroid : Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      shouldDuckAndroid : true,
      playThroughEarpieceAndroid : false,
    });

    const soundObject = new Audio.Sound();
    sound_ref.current = soundObject;

    const source = {
      uri: TRACK_DIR + encodeURIComponent(track_name)
    };
    await soundObject.loadAsync(source);
    setInitCreated(true);
  }

  useEffect(() => {
    if (initdata_ref.current){
      console.log('here');
      initLoadSound();
      console.log(sound_ref.current);
    }
  }, [])

  return(
    <View style={styles.allView} behavior={'padding'}>
      <View style = {styles.statusBar}>
        <Text fontSize={itemFontSize+4}>Music</Text>
      </View>
      <View style={styles.afterStatus}>
        <View style = {{
          flex: 3,
          alignSelf: 'stretch',
          borderBottomWidth: 1,
          borderColor: color.light_pup
        }}>
          <FlatList
            ref = {flatlist_ref}
            data={data_lst.map((it) => ({key: it}))}
            getItemLayout={flatlist_getItemLayout}
            renderItem={({item, index}) => <Item
                                      title={item.key}
                                      select = {(index == play_index)}
                                      index = {index}
                                      onItemClick = {onItemClick}
                                    />}
          />
        </View>
        <View style = {{
          flex: 2,
          alignSelf:'stretch'
        }}>
          <PlayControl
            playing = {playing}
            setPlaying = {setPlaying}
            title = {data_lst[play_index]}
            sound_ref = {sound_ref}
            init_created = {init_created}
            nextTrack = {nextTrack}
          />
        </View>
      </View>
      <View style={{height:25, alignSelf:'stretch'}}/>
    </View>
  )
}


function PlayControl(props){

  const [mode_id, setModeId] = useState(0);
  const [play_back_status, setPlayBackStatus] = useState({});
  const [seeking, setSeeking] = useState(false);
  const [seek_value, setSeekValue] = useState(0);

  const onPlayClick = ()=> {
    if (props.playing){
      props.sound_ref.current.pauseAsync();
    }else{
      props.sound_ref.current.playAsync();
    }
    props.setPlaying(!props.playing);
  }

  const onPlaybackStatusUpdate = (status) => {
    if (status.error){
      console.log(`FATAL PLAYER ERROR: ${status.error}`);
    }else{
      setPlayBackStatus({
        position: status.positionMillis,
				duration: status.durationMillis,
      });
      if (status.didJustFinish) {
        props.nextTrack()
      }
    }
  }

  const _getMMSSFromMillis = (millis) => {
		const totalSeconds = millis / 1000;
		const seconds = Math.floor(totalSeconds % 60);
		const minutes = Math.floor(totalSeconds / 60);

		const padWithZero = number => {
			const string = number.toString();
			if (number < 10) {
				return '0' + string;
			}
			return string;
		};
		return padWithZero(minutes) + ':' + padWithZero(seconds);
	}

  const _getTimestamp = () => {
		if (
			play_back_status.position != null &&
			play_back_status.duration != null
		) {
			return `${_getMMSSFromMillis(
        seeking? (seek_value * play_back_status.duration): (play_back_status.position)
			)} / ${_getMMSSFromMillis(
				play_back_status.duration
			)}`;
		}
		return '';
	}

  const _getSeekSliderPosition = () => {
		if (
      play_back_status.position != null &&
			play_back_status.duration != null
		) {
			return (
				(seeking? (seek_value * play_back_status.duration): (play_back_status.position)) /
				play_back_status.duration
			);
		}
		return 0;
	}

  const _onSlidingComplete = async (value) => {
    const seekPosition = value * play_back_status.duration;
    await props.sound_ref.current.setPositionAsync(seekPosition);
    setSeeking(false);
  }

  const _onValueChange = (value) => {
    setPlayBackStatus({
      position: value * play_back_status.duration,
      duration: play_back_status.duration
    })
  }

  const initSetStatus = async () => {
    console.log('Running init')
    if (props.sound_ref.current){
      await props.sound_ref.current.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      await props.sound_ref.current.setStatusAsync({shouldPlay: props.playing})
    }
  }

  useEffect(() => {
    initSetStatus()
  },[props.init_created])

  return(
    <View style = {{flex:1, alignSelf:'stretch'}}>
      <View style={{flex:2, alignSelf:'stretch', justifyContent:'flex-end'}}>
        <View style={{flex:1, alignSelf:'flex-end', justifyContent:'center'}}>
          <Icon
            reverse
            name={['list', 'shuffle', 'loop'][mode_id]}
            type={(mode_id == 3)? 'material-community': 'fundation'}
            color = {color.light_pup}
            size={20}
            Component={TouchableOpacity}
            onPress = {() => setModeId((mode_id+1)% 3)}
          />
        </View>
        <View style={{flex:1, alignSelf:'center', justifyContent:'flex-end', paddingLeft:10, paddingRight:10}}>
          <Text numberOfLines={1} style={{fontSize:itemFontSize}}>{props.title}</Text>
        </View>
      </View>
      <View style={{flex:3,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 30,
        paddingRight: 30,
        justifyContent:'space-between',
        backgroundColor:color.light_gre
      }}>
        <Icon
          reverse
          name='step-backward'
          type='font-awesome'
          color = {color.light_pup}
          size={26}
          Component={TouchableOpacity}
          onPress = {()=>{}}
        />
        <Icon
          reverse
          name={(props.playing)? 'pause': 'play'}
          type='font-awesome'
          color ={color.light_pup}
          size={40}
          Component={TouchableOpacity}
          onPress = {onPlayClick}
        />
        <Icon
          reverse
          name='step-forward'
          type='font-awesome'
          color ={color.light_pup}
          size={26}
          Component={TouchableOpacity}
          onPress = {props.nextTrack}
        />
      </View>
      <View style={{flex:2, justifyContent:'center',
        backgroundColor:color.light_grey,
        alignItems: 'center',
        paddingLeft:15,
        paddingRight:15
      }}>
        <Text>{_getTimestamp()}</Text>
        <View style = {{alignSelf: 'stretch'}}>
          <Slider
            value={_getSeekSliderPosition()}
            onValueChange = {(value) => setSeekValue(value)}
            onSlidingComplete = {_onSlidingComplete}
            onSlidingStart = {() => setSeeking(true)}
          />
        </View>
      </View>
    </View>
  )
}

function Item(props){
  return (
    <TouchableOpacity
      style={{...styles.containerRow,
        borderBottomWidth: 1,
        borderColor: color.light_pup,
        backgroundColor: (props.select) ? color.light_pup2 : 'rgba(0,0,0,0.1)'
      }}
      onPress = {() =>{
        props.onItemClick(props.index)
      }}
    >
      <View style = {{flex:2}}>
        <Icon
          name='music'
          type='font-awesome'
          color ={(props.select) ? color.light_pup: 'rgba(0,0,0,0.7)'}
          size={itemFontSize+5}
        />
      </View>
      <View
        style = {{flex: 10,
          height:'100%'
        }}
      >
        <View style = {{justifyContent: 'center',flex: 1}}>
          <Text numberOfLines={1} style={{fontSize:itemFontSize}}>{props.title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}
