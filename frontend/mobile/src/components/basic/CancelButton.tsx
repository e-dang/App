import React, {FC} from "react";
import {Icon as NBIcon, IButtonProps} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome5";
import {HeaderButton} from "@components";

export const CancelButton: FC<IButtonProps> = ({...props}) => {
  return (
    <HeaderButton
      testID="cancelBtn"
      {...props}
      startIcon={<NBIcon as={Icon} name="times" size={5} color="black" mr={-2} />}
      _text={{color: "black"}}
      variant="unstyled"
      px={0}
    >
      Cancel
    </HeaderButton>
  );
};
