import React from "react";
import {App as AppBase} from "@src/App";
import {Box, Button} from "native-base";
import {selectAuthToken} from "@selectors";
import {useDispatch, useSelector} from "@hooks";
import {signOut} from "@store";
import {useSignOutMutation} from "@api";

export const App = () => {
  const authToken = useSelector(selectAuthToken);
  const dispatch = useDispatch();
  const [callSignOut] = useSignOutMutation();

  const handleSignOut = async () => {
    if (authToken) {
      await callSignOut();
      dispatch(signOut());
    }
  };

  return (
    <Box flex={1}>
      <AppBase />
      <Button
        testID="masterSignOut"
        position="absolute"
        top={10}
        left={200}
        bg="black"
        size="xs"
        onPress={handleSignOut}
        color="black">
        SignOut
      </Button>
    </Box>
  );
};
