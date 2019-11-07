import React, {useState, useEffect, useCallback, useRef } from 'react';
import { TouchableHighlight, TouchableOpacity, Alert,  Text, View, TextInput,
  ScrollView, KeyboardAvoidingView, StatusBar, FlatList, Modal } from 'react-native';
import { showMessage, hideMessage } from "react-native-flash-message";
import Constants from 'expo-constants';
import ModalDropdown from 'react-native-modal-dropdown';

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
            data={data_lst.map((it) => ({key: it}))}
            getItemLayout={flatlist_getItemLayout}
            renderItem={({item, index}) => <Item
                                      title={item.key}
                                      date = {'111'}
                                      select = {(index == 5)}
                                    />}
          />
        </View>
        <View style = {{
          flex: 2,
          alignSelf:'stretch'
        }}>
          <PlayControl
          />
        </View>
      </View>
      <View style={{height:25, alignSelf:'stretch'}}/>
    </View>
  )
}


function PlayControl(props){

  const [mode_id, setModeId] = useState(0);
  const [should_play, setShouldPlay] = useState(true);
  const [value, setValue] = useState(0);


  return(
    <View style = {{flex:1, alignSelf:'stretch'}}>
      <View style={{flex:2, alignSelf:'stretch', justifyContent:'flex-end'}}>
        <View style={{flex:1, alignSelf:'flex-end', justifyContent:'center'}}>
          <Icon
            reverse
            name={['list', 'shuffle', 'loop'][mode_id]}
            type={'fundation'}
            color = {color.light_pup}
            size={20}
            Component={TouchableOpacity}
            onPress = {() => setModeId((mode_id+1)% 3)}
          />
        </View>
        <View style={{flex:1, alignSelf:'center', justifyContent:'flex-end', paddingLeft:10, paddingRight:10}}>
          <Text numberOfLines={1} style={{fontSize:itemFontSize}}>{data_lst[5]}</Text>
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
          name={(should_play)? 'play': 'pause'}
          type='font-awesome'
          color ={color.light_pup}
          size={40}
          Component={TouchableOpacity}
          onPress = {()=>{setShouldPlay(!should_play)}}
        />
        <Icon
          reverse
          name='step-forward'
          type='font-awesome'
          color ={color.light_pup}
          size={26}
          Component={TouchableOpacity}
          onPress = {()=>{}}
        />
      </View>
      <View style={{flex:2, justifyContent:'center',
        backgroundColor:color.light_grey,
        paddingLeft:15,
        paddingRight:15
      }}>
        <Text>Value: {value}</Text>
        <Slider
          value={value}
          onValueChange={value => setValue(value)}
        />
      </View>
    </View>
  )
}

function Item(props){
  return (
    <TouchableOpacity style={{...styles.containerRow,
      borderBottomWidth: 1,
      borderColor: color.light_pup,
      backgroundColor: (props.select) ? color.light_pup2 : 'rgba(0,0,0,0.1)'
    }}>
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
