import React, {useState, useEffect, useCallback, useRef} from 'react';
import { Modal, TouchableOpacity, Text, View } from 'react-native';
import Constants from 'expo-constants';

import {color, styles, itemHeight, TRACK_DIR, itemFontSize, flatlist_getItemLayout} from './styleConst';
import { Button, Icon, Slider } from 'react-native-elements';
import * as Progress from 'react-native-progress';


export function IconText(props){

  const Comp = props.Component ? props.Component : TouchableOpacity

  return (
    <Comp
      style={{...styles.containerRow, ...props.containerStyle}}
      onPress = {props.onItemClick}
    >
      <View style = {{flex:1}}>
        <Icon
          name={props.iconName}
          type={props.iconType? props.iconType: 'material'}
          color ={props.iconColor? props.iconColor: color.dark_pup}
          size={itemFontSize*2}
        />
      </View>
      <View style = {{flex: 3, justifyContent: 'center'}}>
        <Text
          numberOfLines={1}
          style={{fontSize:itemFontSize+2, ...props.titlStyle}}
        >
          {props.title}
        </Text>
      </View>
    </Comp>
  )
}

export function WaitingModal(props){

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={props.show}
    >
      <View style={{...styles.modalBack, justifyContent: 'center'}}>
        <View style={{
          ...styles.modalInCenter,
          height: null,
          width: null,
          padding: 20,
          backgroundColor: 'white'
        }}>
          <Progress.CircleSnail size={50} color={color.light_pup} thickness={4}/>
          <View style = {{height:5}}/>
          <Text style = {{fontSize:itemFontSize, color:color.dark_pup}}>{props.title}</Text>
        </View>
      </View>
    </Modal>
  )
}
