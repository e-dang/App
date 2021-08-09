import React, {FC} from 'react';
import {FormControl, Icon as NBIcon, IInputProps, Input} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome5';

export const NameInput: FC<IInputProps> = ({isInvalid, ...props}) => {
    return (
        <FormControl isRequired isInvalid={isInvalid}>
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
