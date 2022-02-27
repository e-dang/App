import React from "react";
import {Center, Button, Icon as NativeIcon, Box, Heading, Text, Divider, VStack, Spacer} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome5";
import {Screen} from "@components";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {AuthStackParamList} from "@src/App";

export type WelcomeNavProps = StackNavigationProp<AuthStackParamList, "welcome">;

export const Welcome = () => {
  const navigation = useNavigation<WelcomeNavProps>();

  const handleSignUpWithEmail = () => {
    navigation.navigate("signUp");
  };

  const handleSignIn = () => {
    navigation.navigate("signIn");
  };

  return (
    <Screen testID="welcomeScreen">
      <Spacer />
      <Box justifyContent="flex-start" flex={4}>
        <Center>
          <Heading>Welcome!</Heading>
        </Center>
      </Box>
      <Center flex={3}>
        <VStack space={2} width="90%">
          <Button
            borderRadius={100}
            testID="emailSignUpBtn"
            onPress={handleSignUpWithEmail}
            startIcon={<NativeIcon as={Icon} name="envelope" size={5} />}
          >
            Sign Up With Email
          </Button>
          <Button
            borderRadius={100}
            testID="appleSignUpBtn"
            variant="outline"
            colorScheme="secondary"
            // eslint-disable-next-line no-console
            onPress={() => console.log("Apple")}
            startIcon={<NativeIcon as={Icon} name="apple" size={5} color="black" />}
          >
            Sign Up With Apple
          </Button>
          <Button
            borderRadius={100}
            testID="fbSignUpBtn"
            variant="outline"
            colorScheme="secondary"
            // eslint-disable-next-line no-console
            onPress={() => console.log("Facebook")}
            startIcon={<NativeIcon as={Icon} name="facebook" size={5} color="black" />}
          >
            Sign Up With Facebook
          </Button>
          <Button
            borderRadius={100}
            testID="googleSignUpBtn"
            variant="outline"
            colorScheme="secondary"
            // eslint-disable-next-line no-console
            onPress={() => console.log("Google")}
            startIcon={<NativeIcon as={Icon} name="google" size={5} color="black" />}
          >
            Sign Up With Google
          </Button>
          <Divider my={3} />
          <Box>
            <Text alignSelf="center">Already have an account?</Text>
            <Button
              testID="signInBtn"
              bgColor="transparent"
              variant="ghost"
              colorScheme="primary"
              onPress={handleSignIn}
            >
              Sign In
            </Button>
          </Box>
        </VStack>
      </Center>
    </Screen>
  );
};
