import React, {FC} from "react";
import {FormControl, Icon as NBIcon, Input} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome5";
import {InputProps} from "./types";

export const PasswordInput: FC<InputProps> = ({error, ...props}) => {
  return (
    <FormControl isRequired isInvalid={!!error}>
      <Input
        {...props}
        testID="passwordInput"
        variant="rounded"
        placeholder="Password"
        keyboardType="default"
        secureTextEntry
        InputLeftElement={
          <NBIcon
            as={<Icon name="lock" />}
            size="sm"
            ml={4}
            _light={{
              color: "gray.400",
            }}
            _dark={{
              color: "gray.300",
            }}
          />
        }
      />
      {/* {isPasswordError(error) && (
        <FormControl.ErrorMessage pl={4}>{error.data.password1.join("\n")}</FormControl.ErrorMessage>
      )} */}
    </FormControl>
  );
};
