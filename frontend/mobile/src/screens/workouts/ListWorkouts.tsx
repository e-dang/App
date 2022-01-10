import React from "react";
import {useListWorkoutTemplatesQuery} from "@api/workoutApi";
import {Screen} from "@components";
import {Box, Button, Center, FlatList, Heading, Spinner, Text, VStack} from "native-base";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import type {WorkoutStackParamList} from "./WorkoutStack";

export type ListWorkoutNavProps = StackNavigationProp<WorkoutStackParamList, "listWorkouts">;

export const ListWorkoutsScreen = () => {
  const navigation = useNavigation<ListWorkoutNavProps>();
  const query = useListWorkoutTemplatesQuery();

  const handleCreateWorkout = () => {
    navigation.navigate("createWorkout");
  };

  let content: React.ReactNode;
  if (query.isUninitialized || query.isLoading) {
    content = <Spinner animating accessibilityLabel="Loading indicator" />;
  } else if (query.isError) {
    content = <Text>There was an error.</Text>;
  } else {
    content = (
      <FlatList
        testID="workoutList"
        data={query.data.data}
        ListEmptyComponent={<Text>You Don&apos;t Have Any Workouts...</Text>}
        renderItem={({item}) => (
          <Box>
            <Text>{item.name}</Text>
          </Box>
        )}
        onRefresh={query.refetch}
        refreshing={query.isFetching}
      />
    );
  }

  return (
    <Screen testID="listWorkoutsScreen">
      <VStack space={2}>
        <Center justifyContent="flex-start">
          <Heading>Workouts</Heading>
        </Center>
        <Center>{content}</Center>
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
