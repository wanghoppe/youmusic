import React, {useState, useEffect, useCallback, useRef } from 'react';
import { TouchableHighlight, TouchableOpacity, Alert,  Text, View, TextInput,
  ScrollView, KeyboardAvoidingView, StatusBar, FlatList, Modal, AppState } from 'react-native';
import { showMessage, hideMessage } from "react-native-flash-message";
import Constants from 'expo-constants';
import ModalDropdown from 'react-native-modal-dropdown';
import { Audio } from 'expo-av';

import {color, styles, itemHeight, TRACK_DIR, itemFontSize, flatlist_getItemLayout} from './styleConst';
import { Button, Icon, Slider } from 'react-native-elements';
import { Storage } from 'aws-amplify';
import * as FileSystem from 'expo-file-system';


export function PlayingComp(props){
  // console.log('updating play all');
  const initdata_ref = useRef({});

  var MainView;

  const [play_index, _setPlayIndex] = useState();
  const play_index_ref = useRef()
  const [play_list, setPlayList] =  useState();

  const [playing, setPlaying] = useState(true);
  const [init_created, setInitCreated] = useState(false);
  const sound_ref = useRef();
  const flatlist_ref = useRef();

  const play_mode_ref = useRef(0);
  const play_history_ref = useRef([]);

  const [loading_id, _setLoadingId] = useState(0);
  const loading_id_ref = useRef(loading_id);

  // const [appStatus, setAppStatus] = useState(AppState.currentState)
  const setLoadingId = useCallback((id)=>{
    _setLoadingId(id);
    loading_id_ref.current = id;
  }, [])

  const updatePlayHistory = useCallback((pre_index) => {
    if (play_history_ref.current.length > 50){
      play_history_ref.current.shift();
    }
    play_history_ref.current.push(pre_index);
  }, []);

  const setPlayIndex = useCallback((index) => {
    _setPlayIndex(index);
    setLoadingId(1);
    play_index_ref.current = index;
    let wait = new Promise((resolve) => setTimeout(resolve, 100));  // Smaller number should work
    wait.then( () => {
      flatlist_ref.current.scrollToIndex({index:index});
    });
  }, []);

  const getNextIndex = useCallback(() => {
    if (play_mode_ref.current == 0){
      return (play_index_ref.current + 1) % initdata_ref.current.playlst.length;
    }else if(play_mode_ref.current == 1){
      return Math.floor(Math.random() * initdata_ref.current.playlst.length);
    }else if(play_mode_ref.current == 2){
      return play_index_ref.current;
    }
  }, [])

  const _getTrackUriAsync = useCallback(async (track_name)=>{

    const local_uri = TRACK_DIR + encodeURIComponent(track_name);
    const file_info = await FileSystem.getInfoAsync(local_uri);
    if (initdata_ref.current.streaming){
      if (file_info.exists){
        return local_uri
      }else{
        try{
          return await Storage.get(track_name, { level: 'private'})
        }catch{
          return null;
        }
      }
    }else{
      return local_uri
    }
  }, [])

  const loadSoundIndex = useCallback(async (index) => {
    setPlayIndex(index);

    const track_name = initdata_ref.current.playlst[index];
    const track_uri = await _getTrackUriAsync(track_name);

    await sound_ref.current.unloadAsync();
    const source = {uri: track_uri};
    const init_status = {
      shouldPlay: playing
    };
    // console.log({playing: playing});
    try{
      await sound_ref.current.loadAsync(source, init_status, downloadFirst = false);
    }catch{
      nextTrack()
    }
    // await sound_ref.current.playAsync()
  }, [playing]);

  const nextTrack = useCallback(() => {
    updatePlayHistory(play_index_ref.current);
    const index = getNextIndex();
    loadSoundIndex(index);
  }, []);

  const previousTrack = useCallback(() => {
    var index;
    const pre_index = play_history_ref.current.pop();
    if (pre_index){
      index = pre_index;
    }else{
      index = initdata_ref.current.init_index;
    }
    loadSoundIndex(index);
  }, [])

  const onItemClick = useCallback(async (index) => {
    // if (loading_id_ref.current == 2){
    updatePlayHistory(play_index_ref.current);
    loadSoundIndex(index);
    // }
  }, []);

  const changeLoadSound = useCallback(async (init_data) => {
    setPlayList(init_data.playlst.map((it) => ({key: it})));
    loadSoundIndex(init_data.init_index);
    play_history_ref.current = [];

  }, [playing])

  const initLoadSound = useCallback(async (init_data) => {

    setPlayIndex(init_data.init_index);
    setPlayList(init_data.playlst.map((it) => ({key: it})));


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

    const soundObject = new Audio.Sound();

    const source = {uri: await _getTrackUriAsync(track_name)};
    await soundObject.loadAsync(source, {}, downloadFirst = false);

    sound_ref.current = soundObject;
    setInitCreated(true);

  }, []);

  const cleanUpFunc = useCallback(async() => {
    if (sound_ref.current){
      await sound_ref.current.unloadAsync();
    }
  }, []);

  useEffect(() => {

    console.log('[INFO] running here')
    // console.log(init_created)
    const init_data = props.navigation.getParam('init_data', false);

    if (init_data){
      if (JSON.stringify(initdata_ref.current) == JSON.stringify({})) {
        initdata_ref.current = init_data;
        initLoadSound(init_data);
      } else if (JSON.stringify(init_data) != JSON.stringify(
        {
          playlst: initdata_ref.current.playlst,
          init_index: play_index_ref.current,
          streaming: initdata_ref.current.streaming
        }
      )){
        initdata_ref.current = init_data;
        changeLoadSound(init_data);
      }
    }
    // console.log(initdata);
  }, [props.navigation.getParam('init_data', {})])

  useEffect(() => {
    return cleanUpFunc;
  }, [])

  // useEffect(() => {
  //   AppState.addEventListener('change', _handleAppStateChange);
  //   console.log(AppState.currentState);
  // }, [])

  // const _handleAppStateChange = (nextAppState) => {
  //   console.log(`nextAppState: ${nextAppState}`)
  // }

  if (loading_id != 0){
    MainView = (
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
            title = {(loading_id == 2) ? play_list[play_index].key : 'Loading...'}
            sound_ref = {sound_ref}
            init_created = {init_created}
            nextTrack = {nextTrack}
            previousTrack = {previousTrack}
            play_mode_ref = {play_mode_ref}
            loading_id = {loading_id}
            setLoadingId ={setLoadingId}
          />
        </View>
      </View>
    )
  }else{
    MainView = (
      <View style={{...styles.afterStatus, justifyContent: 'center'}}>
        <View style={{padding: 20}}>
          <Text style = {{fontSize:itemFontSize+4}}> Please Select Songs from</Text>
        </View>
        <TouchableOpacity
          style={{padding: 20, backgroundColor:color.light_grey}}
          onPress={() => props.navigation.navigate('Local')}
        >
          <Icon name={'library-music'} size={25} color={color.dark_pup}/>
          <View style = {{height:5}}/>
          <Text style = {{fontSize:12, color:color.dark_pup}}>LOCAL</Text>
        </TouchableOpacity>
        <View style={{padding: 20}}>
          <Text style = {{fontSize:itemFontSize+4}}>{'(ﾉ>ω<)ﾉ'}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.allView} behavior={'padding'}>
      <View style = {styles.statusBar}>
        <Text style={{fontWeight: "bold", fontSize: itemFontSize+2}}>
          {initdata_ref.current.streaming? 'STREAMING MUSIC':'MUSIC'}
        </Text>
      </View>
      {MainView}
    </View>
  )
}


function PlayControl(props){
  // console.log('updating control');
  const [mode_id, _setModeId] = useState(0);
  const [play_back_status, setPlayBackStatus] = useState({});
  const [seeking, setSeeking] = useState(false);
  const [seek_value, setSeekValue] = useState(0);

  const setModeId = useCallback((mode) => {
    _setModeId(mode);
    props.play_mode_ref.current = mode;
  }, []);

  const onPlayClick = useCallback(async () => {
    props.setPlaying(!props.playing);
    if (props.playing){
      await props.sound_ref.current.pauseAsync();
    }else{
      await props.sound_ref.current.playAsync();
    }
  }, [props.playing]);

  const onPlaybackStatusUpdate = useCallback((status) => {
    if (status.error){
      console.log(`FATAL PLAYER ERROR: ${status.error}`);
    }else{
      setPlayBackStatus({
        position: status.positionMillis,
				duration: status.durationMillis,
        isBuffering: status.isBuffering
      });
      props.setLoadingId(status.isLoaded? 2:1);
      if (status.didJustFinish) {
        props.nextTrack()
      }
      if (!status.isPlaying && status.shouldPlay && !status.isBuffering && !status.didJustFinish && status.isLoaded){
        props.setPlaying(false);
      }
    }
  }, [])

  const _getMMSSFromMillis = useCallback((millis) => {
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
	}, [])

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
			play_back_status.duration != null &&
      play_back_status.duration != 0
		) {
			return (
				(seeking? (seek_value * play_back_status.duration): (play_back_status.position)) /
				play_back_status.duration
			);
		}
		return 0;
	}

  const _onSlidingComplete = useCallback(async (value) => {
    const seekPosition = value * play_back_status.duration;
    await props.sound_ref.current.setPositionAsync(seekPosition);
    setSeeking(false);
  }, [play_back_status.duration]);

  const _onValueChange = useCallback((value) => {
    setPlayBackStatus({
      position: value * play_back_status.duration,
      duration: play_back_status.duration
    })
  }, [play_back_status.duration])

  const initSetStatus = useCallback(async () => {

    if (props.sound_ref.current){
      console.log('Running init')
      await props.sound_ref.current.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      await props.sound_ref.current.setStatusAsync({shouldPlay: props.playing})
      // await props.sound_ref.current.playAsync()
    }
  }, [])

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
        <View style = {{position: 'absolute', left:20, bottom:2}}>
          <Text style={{color:color.primary}}>{play_back_status.isBuffering? 'Buffering...': ''}</Text>
        </View>
        <View style = {{flex:1, alignItems:'center'}}>
          <Icon
            reverse
            name='step-backward'
            type='font-awesome'
            color = {color.primary}
            size={itemFontSize+6}
            Component={TouchableOpacity}
            onPress = {props.previousTrack}
            disabled = {(props.loading_id != 2)}
          />
        </View>
        <View style = {{flex:3, alignItems:'center'}}>
          <Icon
            reverse
            name={(props.playing)? 'pause': 'play'}
            type='font-awesome'
            color ={color.primary}
            size={itemFontSize*2}
            Component={TouchableOpacity}
            onPress = {onPlayClick}
            disabled = {(props.loading_id != 2)}
          />
        </View>
        <View style = {{flex:1, alignItems:'center'}}>
          <Icon
            reverse
            name='step-forward'
            type='font-awesome'
            color ={color.primary}
            size={itemFontSize+6}
            Component={TouchableOpacity}
            onPress = {props.nextTrack}
            disabled = {(props.loading_id != 2)}
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
            size={itemFontSize}
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
            disabled = {(props.loading_id != 2 || play_back_status.duration == 0)}
          />
        </View>
      </View>
    </View>
  )
}

const Item = React.memo(_Item);

function _Item(props){
  // if(props.title=='Photograph - Ed Sheeran (Lyrics)-qgmXPCX4VzU.mp3'){
  //   console.log(props.title);
  // }
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
