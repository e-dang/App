import React, {FC} from 'react';
import {Button, Icon as NBIcon, IButtonProps} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome5';

export const BackButton: FC<IButtonProps> = ({children, ...props}) => {
    return (
        <Button
            {...props}
            position="absolute"
            startIcon={<NBIcon as={Icon} name="chevron-left" size={5} color="black" />}
            _text={{color: 'black', ml: -2}}
            variant="unstyled">
            {children}
        </Button>
    );
};
