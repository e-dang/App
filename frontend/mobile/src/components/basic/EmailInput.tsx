import React, {FC} from "react";
import {FormControl, Icon as NBIcon, Input} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome5";
import {InputProps} from "./types";

export const EmailInput: FC<InputProps> = ({error, ...props}) => {
  return (
    <FormControl isRequired isInvalid={!!error}>
      <Input
        {...props}
        testID="emailInput"
        variant="rounded"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        InputLeftElement={
          <NBIcon
            as={<Icon name="envelope" />}
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
      {/* <FormControl.ErrorMessage pl={4}>{error?.data?.email.join("\n")}</FormControl.ErrorMessage>} */}
    </FormControl>
  );
};
