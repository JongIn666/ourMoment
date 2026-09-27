import { Colors } from '@/constants/theme';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

export function BackButtonView() {
    const router = useRouter();

    return (
        <View style={ styles.backButtonView }>
            <Pressable onPress={ () => router.back() }>
                <FontAwesomeIcon icon={faChevronLeft} size={24} color={Colors.icon.darkLime} />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    backButtonView: {
        alignSelf: 'flex-start'
    }
});