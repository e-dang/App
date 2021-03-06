import React, {FC} from "react";
import {Button, IButtonProps} from "native-base";

export const HeaderButton: FC<IButtonProps> = ({children, ...props}) => {
  return (
    <Button bgColor="transparent" variant="ghost" colorScheme="primary" {...props} px={0}>
      {children}
    </Button>
  );
};
