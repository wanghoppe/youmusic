import React, {useState, useEffect, useCallback, useRef } from 'react';
import { TouchableHighlight, TouchableOpacity, Alert,  Text, View, TextInput,
  ScrollView, KeyboardAvoidingView, StatusBar, FlatList, Modal, AppState } from 'react-native';
import { showMessage, hideMessage } from "react-native-flash-message";
import Constants from 'expo-constants';
import ModalDropdown from 'react-native-modal-dropdown';
import { Audio } from 'expo-av';

import {color, styles, itemHeight, TRACK_DIR, itemFontSize, flatlist_getItemLayout} from './styleConst';
import { Button, Icon, Slider } from 'react-native-elements';


export function PlayingComp(props){

  const [loaded, setLoaded] = useState(false);
  const initdata_ref = useRef();

  var MainView;

  const [play_index, _setPlayIndex] = useState();
  const play_index_ref = useRef()
  const [play_list, setPlayList] =  useState();

  const [playing, setPlaying] = useState(true);
  const playing_override_ref = useRef(true);
  const [init_created, setInitCreated] = useState(false);
  const sound_ref = useRef();
  const flatlist_ref = useRef();

  const play_mode_ref = useRef(0);
  const play_history_ref = useRef([]);

  // const [appStatus, setAppStatus] = useState(AppState.currentState)

  const updatePlayHistory = (pre_index) => {
    if (play_history_ref.current.length > 50){
      play_history_ref.current.shift();
    }
    play_history_ref.current.push(pre_index);
  }

  const setPlayIndex = useCallback((index) => {
    _setPlayIndex(index);
    play_index_ref.current = index;
    let wait = new Promise((resolve) => setTimeout(resolve, 100));  // Smaller number should work
    wait.then( () => {
      flatlist_ref.current.scrollToIndex({index:index});
    });
  })

  const getNextIndex = () => {
    if (play_mode_ref.current == 0){
      return (play_index_ref.current + 1) % initdata_ref.current.playlst.length;
    }else if(play_mode_ref.current == 1){
      return Math.floor(Math.random() * initdata_ref.current.playlst.length);
    }else if(play_mode_ref.current == 2){
      return play_index_ref.current;
    }
  }

  const loadSoundIndex = async (index) => {
    await sound_ref.current.unloadAsync();
    const source = {
      uri: TRACK_DIR + encodeURIComponent(initdata_ref.current.playlst[index])
    };
    const init_status = {
      shouldPlay: playing
    };
    await sound_ref.current.loadAsync(source, init_status);
    // await sound_ref.current.playAsync()
    setPlayIndex(index);
  }

  const nextTrack = () => {
    updatePlayHistory(play_index_ref.current);
    const index = getNextIndex();
    loadSoundIndex(index);
  }

  const previousTrack = () => {
    var index;
    const pre_index = play_history_ref.current.pop();
    if (pre_index){
      index = pre_index;
    }else{
      index = initdata_ref.current.init_index;
    }
    loadSoundIndex(index);
  }

  const onItemClick = async (index) => {
    loadSoundIndex(index);
  }

  const changeLoadSound =  async (init_data) => {
    await sound_ref.current.unloadAsync();

    const source = {
      uri: TRACK_DIR + encodeURIComponent(init_data.playlst[init_data.init_index])
    };
    const init_status = {
      shouldPlay: playing
    };
    await sound_ref.current.loadAsync(source, init_status);
    play_history_ref.current = [];
    setPlayList(init_data.playlst.map((it) => ({key: it})));
    setPlayIndex(init_data.init_index);
  }

  const initLoadSound = async (init_data) => {
    let track_name = init_data.playlst[init_data.init_index];

    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      allowsRecordingIOS: false,
      interruptionModeIOS : Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
      playsInSilentModeIOS : true,
      interruptionModeAndroid : Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      shouldDuckAndroid : true,
      playThroughEarpieceAndroid : false,
    });
    // console.log(`sound_ref: `)
    // console.log(sound_ref.current)
    // if (sound_ref.current){
    //   await sound_ref.current.unloadAsync();
    // }

    const soundObject = new Audio.Sound();

    const source = {
      uri: TRACK_DIR + encodeURIComponent(track_name)
    };
    await soundObject.loadAsync(source);

    sound_ref.current = soundObject;

    setPlayList(init_data.playlst.map((it) => ({key: it})));
    setInitCreated(true);
    setPlayIndex(init_data.init_index);
  }

  const cleanUpFunc = async() => {
    if (sound_ref.current){
      await sound_ref.current.unloadAsync();
    }
  }

  useEffect(() => {

    // console.log('[INFO] running here')
    // console.log(init_created)
    const init_data = props.navigation.getParam('init_data', false);

    if (init_data){
      if (! initdata_ref.current){
        initdata_ref.current = init_data;
        initLoadSound(init_data);
      } else if (JSON.stringify(init_data) != JSON.stringify(initdata_ref.current)) {
        initdata_ref.current = init_data;
        changeLoadSound(init_data);
      }
    }

    return cleanUpFunc;
    // console.log(initdata);
  }, [JSON.stringify(props.navigation.getParam('init_data', false))])

  // useEffect(() => {
  //   AppState.addEventListener('change', _handleAppStateChange);
  //   console.log(AppState.currentState);
  // }, [])

  const _handleAppStateChange = (nextAppState) => {
    console.log(`nextAppState: ${nextAppState}`)
  }

  if (init_created){
    MainView = (
      <View style={styles.allView} behavior={'padding'}>
        <View style = {styles.statusBar}>
          <Text style={{fontWeight: "bold", fontSize: itemFontSize+2}}>MUSIC</Text>
        </View>
        <View style={styles.afterStatus}>
          <View style = {{
            flex: 4,
            alignSelf: 'stretch',
            // borderBottomWidth: 1,
            // borderColor: color.light_pup
          }}>
            <FlatList
              ref = {flatlist_ref}
              extraData = {[play_index]}
              data={play_list}
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
              title = {(play_list[play_index]) ? play_list[play_index].key : ''}
              sound_ref = {sound_ref}
              init_created = {init_created}
              nextTrack = {nextTrack}
              previousTrack = {previousTrack}
              play_mode_ref = {play_mode_ref}
              playing_override_ref = {playing_override_ref}
            />
          </View>
        </View>
      </View>
    )
  }else{
    MainView = (
      <Text> nothing got loaded </Text>
    )
  }

  return MainView
}


function PlayControl(props){

  const [mode_id, _setModeId] = useState(0);
  const [play_back_status, setPlayBackStatus] = useState({});
  const [seeking, setSeeking] = useState(false);
  const [seek_value, setSeekValue] = useState(0);

  const setModeId = (mode) => {
    _setModeId(mode);
    props.play_mode_ref.current = mode;
  }

  const onPlayClick = async () => {
    props.playing_override_ref.current = true;
    props.setPlaying(!props.playing);
    if (props.playing){
      await props.sound_ref.current.pauseAsync();
    }else{
      await props.sound_ref.current.playAsync();
    }
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
      // console.log(`shoud play: ${status.shouldPlay}`)
      // console.log(`playing: ${status.isPlaying}`)
      // console.log(`isBuffering: ${status.isBuffering}`)
      if (!status.isPlaying && status.shouldPlay && !status.isBuffering ){
        props.setPlaying(false);
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
      // await props.sound_ref.current.playAsync()
    }
  }

  useEffect(() => {
    initSetStatus();
  },[props.init_created])

  return(
    <View style = {{
      flex:1,
      alignSelf:'stretch',
      backgroundColor: 'rgba(0,0,0,0.15)',
      // backgroundColor: color.light_grey,
      // borderBottomWidth: 1,
      // borderColor: 'white'
    }}>
      <View style={{flex:1, alignSelf:'center', justifyContent:'flex-end', paddingLeft:10, paddingRight:10}}>
        <Text numberOfLines={1} style={{fontSize:itemFontSize}}>{props.title}</Text>
      </View>
      <View style={{flex:3,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 45,
        paddingRight: 45,
        // justifyContent:'space-around',
        // backgroundColor:color.light_gre
      }}>
        <View style = {{flex:1, alignItems:'center'}}>
          <Icon
            reverse
            name='step-backward'
            type='font-awesome'
            color = {color.primary}
            size={20}
            Component={TouchableOpacity}
            onPress = {props.previousTrack}
          />
        </View>
        <View style = {{flex:3, alignItems:'center'}}>
          <Icon
            reverse
            name={(props.playing)? 'pause': 'play'}
            type='font-awesome'
            color ={color.primary}
            size={30}
            Component={TouchableOpacity}
            onPress = {onPlayClick}
          />
        </View>
        <View style = {{flex:1, alignItems:'center'}}>
          <Icon
            reverse
            name='step-forward'
            type='font-awesome'
            color ={color.primary}
            size={20}
            Component={TouchableOpacity}
            onPress = {props.nextTrack}
          />
        </View>
        <View
          style = {{
            position: 'absolute',
            top:0,
            right:0,
            width: 45,
            // alignItems:'center',
            alignSelf:'flex-end',
            // backgroundColor:color.light_gre
          }}
        >
          <Icon
            reverse
            name={['list', 'shuffle', 'loop'][mode_id]}
            type={(mode_id == 3)? 'material-community': 'fundation'}
            color = {color.primary}
            size={15}
            Component={TouchableOpacity}
            onPress = {() => setModeId((mode_id+1)% 3)}
          />
        </View>
      </View>
      <View style={{flex:2, justifyContent:'center',
        // backgroundColor:color.light_grey,
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
            thumbTintColor = {color.primary}
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
        borderColor: color.primary,
        backgroundColor: (props.select) ? color.primary2 : 'rgba(0,0,0,0)'
      }}
      onPress = {() =>{
        props.onItemClick(props.index)
      }}
    >
      <View style = {{flex:2}}>
        <Icon
          name='music'
          type='font-awesome'
          color ={(props.select) ? color.primary: 'rgba(0,0,0,0.7)'}
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
