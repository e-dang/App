import React, {FC} from 'react';
import {FormControl, Icon as NBIcon, Input} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {FetchBaseQueryError} from '@reduxjs/toolkit/dist/query/react';
import {isFetchBaseQueryError, isObj} from '@src/types';
import {InputProps} from './types';

type EmailError = Omit<FetchBaseQueryError, 'data'> & {
    data: {email: string[]};
};

const isEmailError = (error: any): error is EmailError =>
    isFetchBaseQueryError(error) && isObj(error.data) && 'email' in error.data;

export const EmailInput: FC<InputProps> = ({error, ...props}) => {
    return (
        <FormControl isRequired isInvalid={isEmailError(error)}>
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
            {isEmailError(error) && (
                <FormControl.ErrorMessage pl={4}>{error.data.email.join('\n')}</FormControl.ErrorMessage>
            )}
        </FormControl>
    );
};
