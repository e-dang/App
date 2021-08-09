import React, {FC} from 'react';
import {Center, Modal, Spinner} from 'native-base';

export interface LoadingModalProps {
    isLoading: boolean;
    onClose: () => void;
}

export const LoadingModal: FC<LoadingModalProps> = ({isLoading, onClose}) => {
    return (
        <Center>
            <Modal isOpen={isLoading} onClose={onClose}>
                <Modal.CloseButton mt={3} />
                <Spinner animating={isLoading} accessibilityLabel="Loading indicator" />
            </Modal>
        </Center>
    );
};
