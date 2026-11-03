import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

import { BackButtonView } from '@/components/back-button-view';
import { DateField } from '@/components/date-field';
import { DangerButton, LoginButton } from '@/components/login-button';
import { TextInputThemed } from '@/components/text-input-themed';
import { WhiteBox } from '@/components/white-box';

export default function EditGroup() {
    const [displayName, setDisplayName] = useState('Sonic the Hedgehog');
    const [username, setUsername] = useState('Example');
    const [bio, setBio] = useState('');
    const [birthdate, setBirthdate] = useState(new Date("2022-03-25"));
    const [showAge, setShowAge] = useState(false);
    const [showBirthdate, setShowBirthdate] = useState(false);
    const [email, setEmail] = useState('');

    function PreferenceRow({
        label,
        value,
        onValueChange,
        }: {
        label: string;
        value: boolean;
        onValueChange: (value: boolean) => void;
        }) {
        return (
            <View style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>{label}</Text>
                <Switch
                    accessibilityLabel={label}
                    onValueChange={onValueChange}
                    trackColor={{ false: Colors.interface.box, true: Colors.button.primary.color }}
                    value={value}
                />
            </View>
        );
        }

    return (
        <SafeAreaProvider>
            <SafeAreaViewThemed style={styles.container}>
                <BackButtonView/>

                <ScrollView contentContainerStyle={[styles.container, styles.scrollView]}>
                    <WhiteBox style={styles.userHeader}>
                        <Image
                            source={require('@/assets/images/placeholder/jet-the-hmmmawk.png')}
                            style={styles.userIcon}
                        />
                        <View style={styles.userNames}>
                            <TextInputThemed
                                autoCapitalize="none"
                                onChangeText={setDisplayName}
                                placeholder="Enter display name..."
                                value={displayName}
                                style={styles.displayNameInput}
                            />
                            <TextInputThemed
                                autoCapitalize="none"
                                onChangeText={setUsername}
                                placeholder="Enter username..."
                                value={username}
                                style={styles.usernameInput}
                            />
                        </View>
                    </WhiteBox>

                    <WhiteBox style={styles.bioBox}>
                        <TextInputThemed
                            autoCapitalize="none"
                            onChangeText={setBio}
                            placeholder="Tell a little about yourself..."
                            value={bio}
                            style={styles.bioInput}
                            multiline
                        />
                    </WhiteBox>

                    <View style={[styles.container, styles.section]}>
                        <Text style={styles.heading}>Birthdate and age</Text>
                        <DateField value={birthdate} onChange={setBirthdate} />
                        <PreferenceRow
                            label="Show my age"
                            value={showAge ?? false}
                        />
                        <PreferenceRow
                            label="Show my birthday"
                            value={showBirthdate ?? false}
                        />
                    </View>

                    <View style={[styles.container, styles.section]}>
                        <Text style={styles.heading}>Email</Text>
                        <WhiteBox style={styles.bioBox}>
                            <TextInputThemed
                                autoCapitalize="none"
                                onChangeText={setBio}
                                placeholder="Email address"
                                value={bio}
                                style={styles.emailInput}
                            />
                        </WhiteBox>
                    </View>

                    <LoginButton
                        text="Log out"
                        type="secondary"
                    />

                    <DangerButton
                        text="Delete account"
                    />
                </ScrollView>
            </SafeAreaViewThemed>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
  container: {
    gap: 16
  },
  scrollView: {
    alignItems: 'center'
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 360,
    padding: 11,
    gap: 10
  },
  userIcon: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: Colors.box.border
  },
  userNames: {
    flex: 1,
    gap: 3
  },
  displayNameInput: {
    height: 30,
    fontSize: 18,
    padding: 3
  },
  usernameInput: {
    height: 25,
    color: Colors.interface.text,
    fontSize: 14,
    padding: 2
  },
  bioBox: {
    padding: 11,
    gap: 7
  },
  bioInput: {
    height: 100,
    fontSize: 14,
    textAlignVertical: 'top'
  },
  section: {
    alignSelf: 'stretch'
  },
  heading: {
    color: Colors.heading,
    fontSize: 24
  },
  preferenceRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  preferenceLabel: {
    color: Colors.heading,
    fontSize: 16,
  },
  emailInput: {
    fontSize: 15
  }
})