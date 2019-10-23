import {StyleSheet} from 'react-native';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import {SQLite} from 'expo-sqlite';

export const itemHeight = 66;

export const TRACK_DIR = FileSystem.documentDirectory + 'tracks/';
export const db = SQLite.openDatabase("db.db");

export const color = {light_pup: '#cc7a9b',
                      dark_pup: '#c91860',
                      light_gre: '#9fd6bf',
                      light_grey: 'rgb(227, 227, 227)'}


export const styles = StyleSheet.create({
  allView: {
    flex:1
  },

  statusBar: {
    backgroundColor: color.light_pup,
    height: Constants.statusBarHeight + 35,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10
  },

  afterStatus: {
    flexGrow : 1,
    alignItems: 'center',
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
})
