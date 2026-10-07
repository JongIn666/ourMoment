import { StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';

export function Timeline() {
    return (
        <View style={styles.timeLine}/>
    )
}

const styles = StyleSheet.create({
  timeLine: {
    backgroundColor: Colors.timeLine,
    width: 30,
    height: 1000,
    borderRadius: 50,
    marginLeft: 50
  }
});