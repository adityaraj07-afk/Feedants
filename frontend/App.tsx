import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { CompetitionDetailsScreen } from './src/screens/CompetitionDetailsScreen';
import { colors } from './src/theme/colors';

export default function App() {
  return (
    <View style={styles.container}>
      <CompetitionDetailsScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web'
      ? {
          height: '100%',
          width: '100%',
          overflow: 'hidden',
        }
      : {}),
  },
});
