import { View, Text } from 'react-native'
import { Slot, Stack } from 'expo-router'
import React from 'react'

const _layout = () => {
    return (
        <Stack>
            <Stack.Screen name='index' options={{ headerShown: false, }} />
            <Stack.Screen name='login' options={{ headerShown: false, }} />
            <Stack.Screen name='register' options={{ headerShown: false, }} />
            <Stack.Screen name='forgot_password' options={{ headerShown: false, }} />
        </Stack>
    )
}

export default _layout