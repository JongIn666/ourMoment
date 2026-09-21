import { API_URL } from '@/constants/api';
import { useEffect } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

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
        <View
            style={{
                backgroundColor: '#E6F0D0',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                gap: 84
            }}
        >
            <View>
                <Image
                    source={require('@/assets/images/logo.png')}
                    style={{width: 282, height: 333}}
                />
            </View>

            <View
                style={{
                    gap: 24
                }}
            >
                <Pressable
                    style={{
                        backgroundColor: '#90C400',
                        borderColor: '#5E8000',
                        borderWidth: 2,
                        padding: 10,
                        width: 248
                    }}
                >
                    <Text
                        style={{
                            color: '#fff',
                            fontSize: 32,
                            textAlign: 'center',
                            fontFamily: 'Noto Sans'
                        }}
                    >
                        Login
                    </Text>
                </Pressable>

                <Pressable
                    style={{
                        borderColor: '#90C400',
                        borderWidth: 2,
                        padding: 14,
                        width: 248
                    }}
                >
                    <Text
                        style={{
                            color: '#90C400',
                            fontSize: 24,
                            textAlign: 'center',
                            fontFamily: 'Noto Sans'
                        }}
                    >
                        Create account
                    </Text>
                </Pressable>
            </View>
        </View>
    );
};

export default App;