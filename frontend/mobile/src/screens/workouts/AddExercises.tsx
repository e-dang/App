import React, {FC} from "react";
import {Header, ChildrenProps, HeaderButton, Screen} from "@components";
import {Box, Center, Icon, Heading, SectionList, Spinner, Text, VStack, HStack, Pressable, Divider} from "native-base";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {useListExerciseTypesQuery} from "@api";
import {CancelButton} from "@components/basic/CancelButton";
import {AppStackParamList} from "@screens/AppStack";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome5";
import {ExerciseType} from "@entities";
import {ListRenderItem} from "react-native";
import {useAlphabeticalSections, useSelectable} from "@hooks";
import _ from "lodash";
import type {WorkoutStackParamList} from "./WorkoutStack";

type AddExercisesNavProps = StackNavigationProp<WorkoutStackParamList & AppStackParamList, "workoutAddExercises">;

interface ListItemProps extends ChildrenProps {
  isSelected?: boolean;
  onPress: () => void;
}

const ListItem = ({children, onPress, isSelected = true}: ListItemProps) => {
  return (
    <Pressable onPress={onPress} accessibilityLabel={isSelected ? "selectedListItem" : "deselectedListItem"}>
      <Box py={2} bgColor={isSelected ? "green.600:alpha.30" : undefined}>
        <HStack justifyContent="space-between">
          <Box
            _text={{
              fontSize: "md",
              fontWeight: "medium",
              color: "black",
              letterSpacing: "lg",
            }}
          >
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

interface ExerciseScreenProps {
  getSelected: () => ExerciseType[];
}

const ExerciseScreen: FC<ExerciseScreenProps> = ({children, getSelected}) => {
  const navigation = useNavigation<AddExercisesNavProps>();

  const handleBack = () => {
    navigation.pop();
  };

  const handleAddExercises = () => {
    navigation.navigate("createWorkout", {selectedExercises: getSelected()});
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

export const AddExercisesScreen = () => {
  const query = useListExerciseTypesQuery();
  const sections = useAlphabeticalSections(query.data?.data, "name");
  const {selections, select, isSelected, getSelected} = useSelectable(query.data?.data);

  if (query.isLoading) {
    return (
      <ExerciseScreen getSelected={getSelected}>
        <Spinner animating={query.isLoading} accessibilityLabel="Loading indicator" />
      </ExerciseScreen>
    );
  }

  const renderItem: ListRenderItem<ExerciseType> = ({item, separators}) => (
    <ListItem
      onPress={() => {
        select(item);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        isSelected(item) ? separators.unhighlight() : separators.highlight();
      }}
      isSelected={isSelected(item)}
    >
      {item.name}
    </ListItem>
  );

  return (
    <ExerciseScreen getSelected={getSelected}>
      <SectionList
        width="100%"
        testID="exerciseList"
        sections={sections}
        ListEmptyComponent={<Text>You Don&apos;t Have Any Exercises...</Text>}
        keyExtractor={(item) => item.id as string}
        extraData={selections}
        renderItem={renderItem}
        renderSectionHeader={({section: {title}}) => (
          <Box>
            <Heading fontSize="lg" mt="8" pb="4">
              {title}
            </Heading>
          </Box>
        )}
        ItemSeparatorComponent={({highlighted}) => <Divider bg={highlighted ? "green.600:alpha.30" : undefined} />}
      />
    </ExerciseScreen>
  );
};
