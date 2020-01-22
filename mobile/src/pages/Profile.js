import React from 'react';
import {View, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';

function Profile({navigation}){
  const gitubUsername = navigation.getParam('github_username');
	return <WebView style={StyleSheet.webview} source={{uri: `https://github.com/${gitubUsername}`}}/>
}

const styles = StyleSheet.create({
	webview: {
		flex: 1
	}
})

export default Profile;