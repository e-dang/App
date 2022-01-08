import React from "react";
import {useListWorkoutsQuery} from "@api/workoutApi";
import {Screen, ChildrenProps} from "@components";
import {Box, Button, Center, FlatList, Heading, Spinner, Text, VStack} from "native-base";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import type {WorkoutStackParamList} from "./WorkoutStack";

export type ListWorkoutNavProps = StackNavigationProp<WorkoutStackParamList, "listWorkouts">;

export const WorkoutScreen = ({children}: ChildrenProps) => {
  const navigation = useNavigation<ListWorkoutNavProps>();

  const handleCreateWorkout = () => {
    navigation.navigate("createWorkout");
  };

  return (
    <Screen testID="listWorkoutsScreen">
      <VStack space={2}>
        <Center justifyContent="flex-start">
          <Heading>Workouts</Heading>
        </Center>
        <Center>{children}</Center>
        <Button
          testID="createWorkoutBtn"
          variant="solid"
          colorScheme="primary"
          borderRadius={100}
          onPress={handleCreateWorkout}>
          Create Workout
        </Button>
      </VStack>
    </Screen>
  );
};

export const ListWorkoutsScreen = () => {
  const query = useListWorkoutsQuery();

  if (query.isUninitialized || query.isLoading) {
    return (
      <WorkoutScreen>
        <Spinner animating accessibilityLabel="Loading indicator" />
      </WorkoutScreen>
    );
  }

  if (query.isError) {
    return (
      <WorkoutScreen>
        <Text>There was an error.</Text>
      </WorkoutScreen>
    );
  }

  return (
    <WorkoutScreen>
      <FlatList
        testID="workoutList"
        data={query.data.data}
        ListEmptyComponent={<Text>You Don&apos;t Have Any Workouts...</Text>}
        renderItem={({item}) => (
          <Box>
            <Text>{item.name}</Text>
          </Box>
        )}
      />
    </WorkoutScreen>
  );
};
