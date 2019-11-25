import React, { useCallback } from 'react';
import {StyleSheet} from 'react-native';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import {SQLite} from 'expo-sqlite';

export const itemHeight = 55;
export const itemFontSize = 16;
export const itemOffset = 8;

export const global_debug = false;

export const TRACK_DIR = FileSystem.documentDirectory + 'tracks/';
export const db = SQLite.openDatabase("db.db");

export const color = {light_pup: '#cc7a9b',
                      dark_pup: '#c91860',
                      light_gre: '#9fd6bf',
                      light_pup2: 'rgba(204, 122, 155, 0.5)',
                      light_grey: 'rgb(227, 227, 227)',
                      primary: 'rgb(67,136,214)',
                      light_pup_header: '#d993af',
                    }
export const flatlist_getItemLayout = (data, index) => (
  {length: itemHeight, offset: itemHeight * index, index}
)

export const styles = StyleSheet.create({
  allView: {
    flex:1
  },

  statusBar: {
    backgroundColor: color.light_pup_header,
    height: Constants.statusBarHeight + 35,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 5
  },

  afterStatus: {
    flexGrow : 1,
    alignItems: 'center',
    alignSelf: 'stretch'
  },

  grayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: color.light_grey,
    padding: 5
  },

  container: {
    // borderTopWidth: 1,
    // borderLeftWidth: 1,
    // borderRightWidth: 1,
    // borderBottomWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10
  },

  containerRow: {
    // borderBottomWidth:1,
    // borderTopWidth:1,
    // borderLeftWidth:1,
    // borderRightWidth:1,
    height: itemHeight,
    // backgroundColor: 'powderblue',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch'
  },

  wrapText:{
    justifyContent: 'center',
  },

  grayRow:{
    alignSelf: 'stretch',
    height: 30,
    backgroundColor: color.light_grey
  },

  touchableRow:{
    flexDirection: 'row',
    height: itemHeight,
    alignSelf:'stretch',
    alignItems:'center',
    paddingLeft:30
  },

  modalBack:{
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },

  modalInCenter:{
    height: 250,
    width:'80%',
    backgroundColor:'white',
    alignItems: 'center',
    borderRadius: 10
  },

  modalTouchClose:{
    width: '100%',
    height: '100%',
    position: 'absolute',
  }
})
