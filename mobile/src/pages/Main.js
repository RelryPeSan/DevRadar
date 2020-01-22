import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Image, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Keyboard
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps'
import { requestPermissionsAsync, getCurrentPositionAsync } from 'expo-location';
import {MaterialIcons} from '@expo/vector-icons';

import api from '../services/api';
import {connect, disconnect, subscribeToNewDevs} from '../services/socket';

function Main({ navigation }){
  const [devs, setDevs] = useState([]);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [heightKeyboard, setHeightKeyboard] = useState(20);
  const [techs, setTechs] = useState('');

	useEffect(()=>{
		async function loadInitialPosition() {
			const { granted } = await requestPermissionsAsync();

			if (granted) {
				const { coords } = await getCurrentPositionAsync({
					enableHighAccuracy: true,
				});

				const {latitude, longitude} = coords;

				setCurrentRegion({
					latitude, 
					longitude,
					latitudeDelta: 0.03,
					longitudeDelta: 0.03,
				});
			}
		}

		loadInitialPosition();
  }, []);

  useEffect(() => {
  }, [heightKeyboard]);

  useEffect(() => {
    subscribeToNewDevs(dev => setDevs([...devs, dev]));
  }, [devs]);

  function setupWebSocket(){
    disconnect();

    const {latitude, longitude} = currentRegion;
    
    connect(
      latitude,
      longitude,
      techs
    );
  }

  async function loadDevs(){
    const { latitude, longitude } = currentRegion;
    console.log(currentRegion);

    const response = await api.get('/search', {
      params: {
        latitude,
        longitude,
        techs
      }
    });

    setDevs(response.data.devs);
    setupWebSocket();
  }

  function handleRegionChanged(region){
    setCurrentRegion(region);
  }

  Keyboard.addListener('keyboardDidShow', (e) => {
    setHeightKeyboard(e.endCoordinates.height + 20);
  });

  Keyboard.addListener('keyboardDidHide', () => {
    setHeightKeyboard(20);
  })

	if(!currentRegion) {
		return null;
	}

	return (
    <>
      <MapView 
        initialRegion={currentRegion} 
        style={styles.map} 
        toolbarEnabled={false}
        onRegionChangeComplete={handleRegionChanged}
      >
        {devs.map(dev => (
          <Marker 
            key={dev._id}
            coordinate={{ 
              longitude: dev.location.coordinates[0],
              latitude: dev.location.coordinates[1],
            }}
          >
            <Image style={styles.avatar} source={{uri: dev.avatar_url}}/>
            <Callout onPress={() => {
              navigation.navigate('Profile', { github_username: dev.github_username });
            }}>
              <View style={styles.callout}>
                <Text style={styles.devName}>{dev.name}</Text>
                <Text style={styles.devBio}>{dev.bio}</Text>
                <Text style={styles.devTechs}>{dev.techs.join(', ')}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <View style={[styles.searchForm, {bottom: heightKeyboard}]}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Buscar devs por techs..."
          placeholderTextColor="#888"
          autoCapitalize="words"
          autoCorrect={false}
          onChangeText={setTechs}
        />
        <TouchableOpacity onPress={loadDevs} style={styles.loadButton} activeOpacity={0.75}>
          <MaterialIcons name="my-location" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </>
	);
}

const styles = StyleSheet.create({
  container: {
		flex: 1
  },
	map: {
		flex: 1
  },
  avatar: {
    width: 33,
    height: 33,
    borderRadius: 3,
    borderWidth: 3,
    borderColor: '#CCC'
  },
  callout: {
    width: 260,
  },
  devName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  devBio: {
    color: '#444',
    marginTop: 5,
  },
  devTechs: {
    marginTop: 5,
  },
  searchForm: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 5,
    flexDirection: 'row',
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFF',
    color: '#333',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 4,
      height: 4,
    },
    elevation: 6
  },
  loadButton: {
    width: 50,
    height: 50,
    backgroundColor: '#8E4DFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  }
});

export default Main;