import React, {FC} from 'react';
import {FormControl, Icon as NBIcon, IInputProps, Input} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome5';

export const EmailInput: FC<IInputProps> = ({isInvalid, ...props}) => {
    return (
        <FormControl isRequired isInvalid={isInvalid}>
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
                            color: 'gray.400',
                        }}
                        _dark={{
                            color: 'gray.300',
                        }}
                    />
                }
            />
        </FormControl>
    );
};
