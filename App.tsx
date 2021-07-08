
import React from 'react';
// import type {Node} from 'react';
import store from './src/app/store'
import { Provider } from 'react-redux'

import NavigationHome from './src/app/navigation/NavigationHome';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  LogBox
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context'
import {
  Colors,
  
} from 'react-native/Libraries/NewAppScreen';
import Navigation from '@navigation/NavigationAll'

const App= () => {
  const isDarkMode = useColorScheme() === 'dark';
  LogBox.ignoreAllLogs()
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <Provider store={store}>
      <SafeAreaProvider style={backgroundStyle}>
        <Navigation/>
      </SafeAreaProvider>
    </Provider>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
