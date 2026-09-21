import { API_URL } from '@/constants/api';
import { useEffect } from 'react';
import { Image, View } from 'react-native';

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