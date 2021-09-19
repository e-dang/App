import React, {FC} from 'react';
import {FormControl, Icon as NBIcon, Input} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {isFetchBaseQueryError, isObj} from '@src/types';
import {FetchBaseQueryError} from '@reduxjs/toolkit/dist/query/react';
import {InputProps} from './types';

type PasswordError = Omit<FetchBaseQueryError, 'data'> & {
    data: {password1: string[]};
};

const isPasswordError = (error: any): error is PasswordError =>
    isFetchBaseQueryError(error) && isObj(error.data) && 'password1' in error.data;

export const PasswordInput: FC<InputProps> = ({error, ...props}) => {
    return (
        <FormControl isRequired isInvalid={isPasswordError(error)}>
            <Input
                {...props}
                testID="passwordInput"
                variant="rounded"
                placeholder="Password"
                keyboardType="default"
                secureTextEntry={true}
                InputLeftElement={
                    <NBIcon
                        as={<Icon name="lock" />}
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
            {isPasswordError(error) && (
                <FormControl.ErrorMessage pl={4}>{error.data.password1.join('\n')}</FormControl.ErrorMessage>
            )}
        </FormControl>
    );
};
