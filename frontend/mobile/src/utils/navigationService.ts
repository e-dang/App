import {createNavigationContainerRef} from '@react-navigation/native';
import {RootStackParamList} from '@src/App';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(name: keyof RootStackParamList) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name);
    } else {
        // You can decide what to do if the app hasn't mounted
        // You can ignore this, or add these actions to a queue you can call later
    }
}
