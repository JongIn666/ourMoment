import { Colors } from '@/constants/theme';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

export function BackButtonView() {
    const router = useRouter();

    function handleBack() {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/');
        }
    }

    return (
        <View style={ styles.backButtonView }>
            <Pressable onPress={handleBack}>
                <FontAwesomeIcon icon={faChevronLeft} size={32} color={Colors.icon.darkLime} />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    backButtonView: {
        alignSelf: 'flex-start'
    }
});
