import { API_URL } from '@/constants/api';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoginButton } from '@/components/login-button';
import { SafeAreaViewThemed } from '@/components/safe-area-themed';

const App = () => {
    useEffect(() => {
        let isMounted = true;
    
        fetch(`${API_URL}/api/health/`, {
          "headers": {
            "ngrok-skip-browser-warning": "true"
          }
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
          })
          .then((data: { status?: string; service?: string; database?: string }) => {
            if (isMounted) {
              const database = data.database === 'postgresql' ? ' + PostgreSQL' : '';
              console.log(`${data.service ?? 'Django'}${database} is ${data.status ?? 'online'}`);
            }
          })
          .catch(() => {
            if (isMounted) {
              console.log(`waiting for Django at ${API_URL}`);
            }
          });
    
        return () => {
          isMounted = false;
        };
      }, []);

    return (
        <SafeAreaProvider>
            <SafeAreaViewThemed style={styles.container}>
                <View>
                    <Image
                        source={require('@/assets/images/logo.png')}
                        style={{width: 282, height: 333}}
                    />
                </View>

                <View style={styles.loginButtons}>
                    <LoginButton
                        text="Login"
                        type="primary"
                        labelStyle={{fontSize: 32}}
                    />

                    <LoginButton
                        text="Create account" 
                        type="secondary"
                    />
                </View>
            </SafeAreaViewThemed>
        </SafeAreaProvider>
    );
};

export default App;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 84
  },
  loginButtons: {
    gap: 24
  }
});