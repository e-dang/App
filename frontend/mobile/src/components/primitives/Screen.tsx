import React, {FC} from 'react';
import {Box, IBoxProps} from 'native-base';

export const Screen: FC<IBoxProps> = ({children, ...props}) => {
    return (
        <Box flex={1} px={1} safeArea {...props}>
            {children}
        </Box>
    );
};
