import { Image, View } from 'react-native';

const App = () => {
  return (
    <View
        style={{
            backgroundColor: '#E6F0D0',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        <Image
            source={require('@/assets/images/logo.png')}
            style={{width: 282, height: 333}}
        />
    </View>
  );
};

export default App;