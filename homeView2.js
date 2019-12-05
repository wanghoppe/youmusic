import React, {useState, useRef, useEffect, useCallback} from 'react';
import { TouchableWithoutFeedback, Modal, TouchableOpacity,
  Alert, StyleSheet, Text, View, TextInput, ScrollView,
  KeyboardAvoidingView, StatusBar, FlatList, RefreshControl } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { showMessage, hideMessage } from "react-native-flash-message";
import { Auth } from 'aws-amplify';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator, createMaterialTopTabNavigator  } from 'react-navigation-tabs';
import {color, styles, global_debug, itemFontSize, itemHeight} from './styleConst';
import { Button, Icon, Image, SearchBar } from 'react-native-elements';
import ModalDropdown from 'react-native-modal-dropdown';
import { withNavigationFocus } from 'react-navigation';
import { IconText } from './utilsComp';
import {process_upload_json} from './utils'


export function ExploreLambda(props){

  const query_ref = useRef('');
  const last_query_ref = useRef('')
  const [data_lst, setDataLst] = useState([]);
  const [refreshing, setRefresh] = useState(false);
  const flatlist_ref = useRef();
  const [loading, setLoading] = useState(false);

  const searchYtb = async (query) => {
    console.log('fetching youtube search list');

    if (query == ''){
      Alert.alert('Empty Input!')
      if (refreshing){
        setRefresh(false);
      }
      return null;
    }
    // setRefresh(true);
    last_query_ref.current = query;
    response = await fetch('https://vxmaikxa2m.execute-api.us-west-2.amazonaws.com/beta/trans/getlst-us-west', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query
      })
    });
    res_json = await response.json();
    setDataLst(res_json.result_lst.map(item => ({...item, key:item.you_id})));
    // setRefresh(false);
  }

  const onRefresh = async () => {
    setRefresh(true);
    await searchYtb(last_query_ref.current);
    setRefresh(false);
  }

  const onSearchClick = async () => {

    setLoading(true);
    await searchYtb(query_ref.current);
    setLoading(false);
  }

  const download2Cloud = async (you_id) => {
    const user_info = await Auth.currentUserInfo();
    const user_id = user_info.id;

    console.log('Downloading ' + you_id + ' for ' + user_id);
    response = await fetch('https://vxmaikxa2m.execute-api.us-west-2.amazonaws.com/beta/trans', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        you_id: you_id,
        user_id: user_id
      })
    });
    res_json = await response.json();
    console.log(you_id);
    process_upload_json(res_json);
  };

  const flatlist_getItemLayout = useCallback((data, index) => (
    {length: itemHeight * 2 + itemFontSize, offset: (itemHeight * 2 + itemFontSize) * index, index}
  ),[])

  return(
    <View style={styles.allView}>
      <View style = {styles.afterStatus}>
        <MySearchBar
          loading = {loading}
          onSearchClick = {onSearchClick}
          query_ref = {query_ref}
        />
        <View style = {{alignSelf: 'stretch', flex:1, justifyContent: 'flex-end'}}>
          <FlatList
            ref = {flatlist_ref}
            refreshControl = {
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={color.dark_pup}
                colors={[color.dark_pup]}
              />
            }
            tintColor = {color.dark_pup}
            data={data_lst}
            getItemLayout={flatlist_getItemLayout}
            initialNumToRender = {5}
            renderItem={({item}) => <Item
                                      title = {item.title}
                                      you_id = {item.you_id}
                                      img_src = {item.img_src}
                                      view_num = {item.view_num}
                                      duration = {item.duration}
                                      channel = {item.channel}
                                      upload_time = {item.upload_time}
                                      download2Cloud = {download2Cloud}
                                    />}
          />
        </View>
      </View>
    </View>
  )
}

function MySearchBar(props){

  const [query, setQuery] = useState();

  const onTextChange = (text) => {
    props.query_ref.current = text;
    setQuery(text);
  };

  const onSearchClick = () => {
    props.searchYtb(query);
  }

  return(
    <View style = {{
      alignSelf : "stretch",
      flexDirection: 'row',
      alignItems:'center',
      backgroundColor: color.light_grey
    }}>
      <SearchBar
        platform="ios"
        cancelButtonTitle={'Cancel'}
        cancelButtonProps={
        {
          buttonStyle:{
            ...styles.whiteTouchable,
            padding:0,
            marginRight:itemFontSize-5
          },
          buttonTextStyle:{fontSize: itemFontSize+2}
        }
        }
        showLoading = {props.loading}
        loadingProps={{color: color.dark_pup}}
        containerStyle = {{
          ...styles.grayControl,
          flex: 8,
          borderBottomWidth: 0,
          borderTopWidth:0
        }}
        inputContainerStyle = {{
          backgroundColor: 'white',
          height: itemHeight - itemFontSize,
          borderRadius: 4
        }}
        inputStyle = {{
          fontSize: itemFontSize + 2,
          color: 'black'
        }}
        placeholder="Search Youtube"
        onChangeText={onTextChange}
        onSubmitEditing={props.onSearchClick}
        value = {query}
      />
      {false && <TouchableOpacity
        style = {{
          ...styles.whiteTouchable,
          flex:2,
          marginRight:itemFontSize-10,
        }}
        onPress = {props.onSearchClick}
      >
        <Text style = {{
          color: color.primary,
          fontSize: itemFontSize+2,
        }}>Search</Text>
      </TouchableOpacity>}
    </View>
  )
}

const Item = React.memo((props) => {
  return _Item(props);
});

function _Item(props){

  const onItemClick = () => {
    Alert.alert(
      "Comfirm",
      `Download ${props.title} to Cloud?`,
      [
        {text: 'OK', onPress: () => props.download2Cloud(props.you_id)},
        {text: 'Cancel', onPress: () => {}, style: 'cancel'}
      ],
    )
  }

  return (
    <View style={{...styles.containerRow,
      height: itemHeight * 2 + itemFontSize,
      // backgroundColor:color.light_grey,
      padding: itemFontSize/2,
      // borderTopWidth: 1,
      // borderColor: color.light_pup
    }}>
      <TouchableOpacity
        style = {{
          flex:1,
          flexDirection:'row',
          height:'100%',
          // backgroundColor:color.light_gre,
        }}
        onPress = {onItemClick}>
        <View style = {{marginRight:itemFontSize/2}}>
          <Image
            style={{width: itemHeight*2*1.45, height: itemHeight*2}}
            source={{uri: props.img_src}}
          />
          <View style = {{
            position:'absolute',
            padding:3,
            right: 5,
            bottom:5,
            backgroundColor:'rgba(0,0,0,0.8)'}}
          >
            <Text style={{fontSize: itemFontSize-2, color:'white'}}>{props.duration}</Text>
          </View>
        </View>
        <View
          style = {{flex:1, alignSelf:'stretch'}}
        >
          <View style={{...styles.wrapText, flex:3}}>
            <Text numberOfLines={3} style={{fontSize:itemFontSize}}>{props.title}</Text>
          </View>
          <View style={styles.wrapText}>
            <Text numberOfLines={1} style={{fontSize:itemFontSize-2, color:'rgba(0,0,0,0.3)'}}>{props.channel}</Text>
          </View>
          <View style={styles.wrapText}>
            <Text numberOfLines={1} style={{fontSize:itemFontSize-3, color:'rgba(0,0,0,0.3)'}}>{`${props.view_num} • ${props.upload_time}`}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}
