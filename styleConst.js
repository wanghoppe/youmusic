import React, { useCallback } from 'react';
import {Platform, StyleSheet} from 'react-native';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import {SQLite} from 'expo-sqlite';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

export const itemHeight = Platform.OS === 'ios' ? 55: 51;
export const itemFontSize = Platform.OS === 'ios' ? 16: 14;
export const itemOffset = Platform.OS === 'ios' ? 8: 6;

export const global_debug = false;

export const TRACK_DIR = FileSystem.documentDirectory + 'tracks/';
export const db = SQLite.openDatabase("db.db");

export const color = {light_pup: '#cc7a9b',
                      dark_pup: '#c91860',
                      light_gre: '#9fd6bf',
                      light_pup2: 'rgba(204, 122, 155, 0.5)',
                      light_pup3: 'rgba(204, 122, 155, 0.2)',
                      light_grey: 'rgb(227, 227, 227)',
                      primary: 'rgb(67,136,214)',
                      primary2: 'rgba(67,136,214,0.3)',
                      light_pup_header: '#d993af',
                    }
export const flatlist_getItemLayout = (data, index) => (
  {length: itemHeight, offset: itemHeight * index, index}
)

const en = {
  ok_butt: 'OK',
  cancel_butt: 'Cancel',
  cloud: 'Cloud',
  explore: 'Explore',
  local: 'Local',
  play: 'Play',
  ladder: 'Ladder',
  youtube: 'YouTube',
  comfirm: 'Comfirm',
  stream_music: 'Streaming Music',
  check: 'Check',
  success: 'Success',
  download: 'Download',
  delete: 'Delete',
  add_success: 'Add Success',
  delete_success: 'Delete Success',
  header_back: 'Back',
  signin: 'Sign In',
  signingin: 'Signing In',
  signin_success: 'Sign In Success',
  set_new_pw: 'Set New Password',
  username: 'Username',
  password: 'Password',
  new_password: 'New Password',
  email: 'Email',
  failed: 'Failed',
  homeView_yh: 'Youtube Home',
  homeView_so: 'Sign Out',
  homeView_alr1: 'Download to Cloud?',
  homeView_alr2_1: 'Invalid URL',
  homeView_alr2_2: 'Cannot parse video ID',
  homeView2_sy: 'Search Youtube',
  homeView2_alr1: 'Empty Input!',
  homeView2_alr2: 'Download"{{title}}"to Cloud?',
  list_sr: 'Search Here...',
  list_all: '  All  ',
  list_un: 'Undownload',
  list_lo: 'Loading',
  list_do: 'Downloaded',
  list_date: 'Date↓',
  list_size: 'Size↓',
  list_name: 'Name↓',
  list_alr1_1: 'Comfirm Download',
  list_alr1_2: 'Download {{size}} track from cloud?',
  list_alr2_1: 'Comfirm Delete',
  list_alr2_2: 'Delete {{size}} track from cloud?',
  list_alt4: 'Delete "{{title}}" from cloud?',
  localView_at: 'All Tracks...',
  localView_pl: 'Playlist:',
  localView_dp: 'Delete Playlist',
  localModal_ap: 'Add Playlist',
  localModal_ap_ph: 'PlayList Name',
  localModal_ap_alt1: 'Duplicate Playlist',
  localModal_ap_mes: 'Playlist Added',
  localModal_dp: 'Delete Playlist:',
  localModal_dp_ck: 'Delete {{count}} tracks inside playlist',
  localModal_dp_mes: 'Delete Success',
  localList_atp: 'Add to Playlist',
  localList_dt: 'Delete Track',
  localList_at: 'Add To',
  localList_alt: 'No track was selected!',
  localModal_dt: 'Delete {{count}} Track(s)',
  localModal_dt_ck: 'Delete tracks from local storage',
  localModal_at_alt: 'No Playlist was selected!',
  playing_ph: 'Please Select Songs from',
  playing_music: 'Local Music',
  utils_ds: '"{{song}}" is downloaded to cloud',
  utils_df: 'Download Failed',
  utils_df_mes1: '"{{song}}" is longer than 90 minutes',
  utils_df_mes2: '"{{song}}" is already in the cloud',
  utils_df_mes3: 'Maximum limit reached in the cloud, please try to delete some non-important tracks',
  offline_use: 'Use Offline'
};
const zh = {
  ok_butt: '确定',
  cancel_butt: '取消',
  cloud: '云端',
  explore: '探索',
  local: '本地',
  play: '播放',
  ladder: '梯子',
  youtube: '油管',
  comfirm: '确认',
  stream_music: '在线播放',
  check: '确认',
  success: '成功',
  download: '下载',
  delete: '删除',
  add_success: '添加成功',
  delete_success: '删除成功',
  header_back: '返回',
  signin: '登入',
  signingin: '登入中',
  signin_success: '登入成功',
  set_new_pw: '设置新密码',
  username: '用户名',
  password: '密码',
  new_password: '新密码',
  email: '邮箱',
  failed: '失败',
  homeView_yh: '回到首页',
  homeView_so: '退出账号',
  homeView_alr1: '下载到云端？',
  homeView_alr2_1: '无效网址',
  homeView_alr2_2: '无法获取视频信息',
  homeView2_sy: '搜索 YouTube',
  homeView2_alr1: '没有输入！',
  homeView2_alr2: '下载“{{title}}”到云端？',
  list_sr: '搜索...',
  list_all: '全部',
  list_un: '未下载',
  list_lo: '下载中',
  list_do: '已下载',
  list_date: '日期↓',
  list_size: '大小↓',
  list_name: '名称↓',
  list_alr1_1: '确认下载',
  list_alr1_2: '从云端下载 {{size}} 首歌到本地？',
  list_alr2_1: '确认删除',
  list_alr2_2: '从云端删除 {{size}} 首歌？',
  list_alt4: '从云端删除“{{title}}”?',
  localView_at: '全部歌曲...',
  localView_pl: '播放列表:',
  localView_dp: '删除播放列表',
  localModal_ap: '添加播放列表',
  localModal_ap_ph: '列表名称',
  localModal_ap_alt1: '播放列表重名',
  localModal_ap_mes: '播放列表已添加',
  localModal_dp: '删除播放列表：',
  localModal_dp_ck: '删除播放列表中的 {{count}} 首歌',
  localModal_dp_mes: '删除成功',
  localList_atp: '添加到播放列表',
  localList_dt: '删除歌曲',
  localList_at: '添加到',
  localList_alt: '无已选歌曲！',
  localModal_dt: '删除 {{count}} 首歌',
  localModal_dt_ck: '同时从本地删除歌曲',
  localModal_at_alt: '没有选择播放列表！',
  playing_ph: '请从这里选歌：',
  playing_music: '播放',
  utils_ds: '“{{song}}”成功下载到云端',
  utils_df: '下载失败',
  utils_df_mes1: '“{{song}}”长于90分钟',
  utils_df_mes2: '“{{song}}”已经在云端',
  utils_df_mes3: '云端存储已满，请尝试删除一些不需要的歌曲',
  offline_use: '离线使用'
};

i18n.fallbacks = true;
i18n.translations = { zh, en };
i18n.locale = Localization.locale;

export const my_i18n = i18n

export const styles = StyleSheet.create({
  allView: {
    flex:1
  },

  statusBar: {
    backgroundColor: color.light_pup_header,
    height: Constants.statusBarHeight + 35,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 7
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

  whiteTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    height: itemHeight - itemFontSize,
    borderRadius:4,
    padding: 5
  },

  grayControl: {
    flex: 1,
    height: itemHeight,
    padding: (itemFontSize)/2,
    backgroundColor: color.light_grey,
  },

  graySeparator: {
    alignSelf: 'stretch',
    borderTopWidth:1,
    borderColor: color.light_grey
  },

  pupContainer: {
    flex: 1,
    height:itemHeight-itemFontSize,
    borderRadius:4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginLeft:itemFontSize-10,
  },

  pupSeparator: {
    borderTopWidth: 1,
    borderColor: color.light_pup,
    alignSelf: 'stretch'
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
    flex:1,
    justifyContent: 'center',
    alignSelf: 'stretch'
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
