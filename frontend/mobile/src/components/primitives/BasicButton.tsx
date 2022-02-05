import React, {FC} from "react";
import {Button as NBButton, IButtonProps} from "native-base";

export const BasicButton: FC<IButtonProps> = ({children, ...props}) => {
  return (
    <NBButton borderRadius={100} {...props}>
      {children}
    </NBButton>
  );
};
