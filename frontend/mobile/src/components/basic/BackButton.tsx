import React, {FC} from 'react';
import {Icon as NBIcon, IButtonProps} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {HeaderButton} from '@components';

export const BackButton: FC<IButtonProps> = ({children, ...props}) => {
    return (
        <HeaderButton
            testID="backBtn"
            {...props}
            startIcon={<NBIcon as={Icon} name="chevron-left" size={5} color="black" mr={-2} />}
            _text={{color: 'black'}}
            variant="unstyled"
            px={0}>
            {children}
        </HeaderButton>
    );
};
