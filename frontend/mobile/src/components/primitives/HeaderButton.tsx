import React, {FC} from 'react';
import {Button, IButtonProps} from 'native-base';

export const HeaderButton: FC<IButtonProps> = ({children, ...props}) => {
    return (
        <Button {...props} px={0}>
            {children}
        </Button>
    );
};
