import React, {FC} from "react";
import {FormControl, Icon as NBIcon, Input} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome5";
import {InputProps} from "./types";

export const NameInput: FC<InputProps> = ({error, ...props}) => {
  return (
    <FormControl isRequired isInvalid={!!error}>
      <Input
        {...props}
        testID="nameInput"
        variant="rounded"
        placeholder="Name"
        keyboardType="default"
        autoCorrect={false}
        InputLeftElement={
          <NBIcon
            as={<Icon name="user-alt" />}
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
      {/* {isNameError(error) && <FormControl.ErrorMessage pl={4}>{error.data.name.join("\n")}</FormControl.ErrorMessage>} */}
    </FormControl>
  );
};
