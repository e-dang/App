import React, {FC} from 'react';
import {FormControl, Icon as NBIcon, Input} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {FetchBaseQueryError} from '@reduxjs/toolkit/dist/query/react';
import {isFetchBaseQueryError, isObj} from '@src/types';
import {InputProps} from './types';

type NameError = Omit<FetchBaseQueryError, 'data'> & {
    data: {name: string[]};
};

const isNameError = (error: any): error is NameError =>
    isFetchBaseQueryError(error) && isObj(error.data) && 'name' in error.data;

export const NameInput: FC<InputProps> = ({error, ...props}) => {
    return (
        <FormControl isRequired isInvalid={isNameError(error)}>
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
            {isNameError(error) && (
                <FormControl.ErrorMessage pl={4}>{error.data.name.join('\n')}</FormControl.ErrorMessage>
            )}
        </FormControl>
    );
};
