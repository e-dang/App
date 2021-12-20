import React, {FC, useState} from 'react';
import {Header, HeaderButton, Screen} from '@components';
import {
    Box,
    Center,
    Icon,
    Heading,
    SectionList,
    FlatList,
    Spinner,
    Text,
    VStack,
    HStack,
    Pressable,
    Divider,
} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useListExercisesQuery} from '@api';
import {WorkoutStackParamList} from '.';
import {CancelButton} from '@components/basic/CancelButton';
import {AppStackParamList} from '@screens/AppStack';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome5';
import {Exercise} from '@src/types';

type AddExercisesNavProps = StackNavigationProp<WorkoutStackParamList & AppStackParamList, 'workoutAddExercises'>;

interface ListItemProps {
    isSelected?: boolean;
    onPress: () => void;
}

const ListItem: FC<ListItemProps> = ({children, onPress, isSelected = true}) => {
    return (
        <Pressable onPress={onPress} accessibilityLabel={isSelected ? 'selectedListItem' : 'deselectedListItem'}>
            <Box py={2} bgColor={isSelected ? 'green.600:alpha.30' : undefined}>
                <HStack justifyContent="space-between">
                    <Box
                        _text={{
                            fontSize: 'md',
                            fontWeight: 'medium',
                            color: 'black',
                            letterSpacing: 'lg',
                        }}>
                        {children}
                    </Box>
                    <Box>
                        {isSelected ? (
                            <Center>
                                <Icon as={FontAwesomeIcon} name="check" size={5} color="green.600" />
                            </Center>
                        ) : null}
                    </Box>
                </HStack>
            </Box>
        </Pressable>
    );
};

const ExerciseScreen: FC = ({children}) => {
    const navigation = useNavigation<AddExercisesNavProps>();

    const handleBack = () => {
        navigation.pop();
    };

    const handleAddExercises = () => {
        //     navigation.navigate('createExercise');
    };

    return (
        <Screen testID="addExerciseScreen">
            <Header
                leftContent={<CancelButton onPress={handleBack} />}
                rightContent={<HeaderButton onPress={handleAddExercises}>Add</HeaderButton>}
            />
            <VStack space={2}>
                <Center justifyContent="flex-start">
                    <Heading>Add Exercises</Heading>
                </Center>
                <Center px={0}>{children}</Center>
            </VStack>
        </Screen>
    );
};

interface SelectionProps {
    isSelected: boolean;
}

type ExerciseListItem = Exercise & SelectionProps;

function addSelectionProps(data: Exercise[]): ExerciseListItem[] {
    return data.map((val) => ({...val, isSelected: false}));
}

function makeSelection(data: ExerciseListItem[], itemId: string) {
    return data.map((val) => (itemId === val.id ? {...val, isSelected: !val.isSelected} : val));
}

export function AddExercisesScreen() {
    const {data = {data: []}, isLoading} = useListExercisesQuery();
    const [formattedData, setFormattedData] = useState<ExerciseListItem[]>(addSelectionProps(data.data));

    React.useEffect(() => {
        setFormattedData(addSelectionProps(data.data));
    }, [data]);

    if (isLoading) {
        return (
            <ExerciseScreen>
                <Spinner animating={isLoading} accessibilityLabel="Loading indicator" />
            </ExerciseScreen>
        );
    }

    return (
        <ExerciseScreen>
            <FlatList
                width="100%"
                testID="exerciseList"
                data={formattedData}
                ListEmptyComponent={<Text>You Don't Have Any Exercises...</Text>}
                keyExtractor={(item) => item.id}
                extraData={formattedData}
                renderItem={({item, separators}) => (
                    <ListItem
                        onPress={() => {
                            setFormattedData(makeSelection(formattedData, item.id));
                            item.isSelected ? separators.unhighlight() : separators.highlight();
                        }}
                        isSelected={item.isSelected}>
                        {item.name}
                    </ListItem>
                )}
                ItemSeparatorComponent={({highlighted}) => (
                    <Divider bg={highlighted ? 'green.600:alpha.30' : undefined} />
                )}
            />
        </ExerciseScreen>
    );
}
