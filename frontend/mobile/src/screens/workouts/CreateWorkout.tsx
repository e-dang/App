import React, {useEffect, useState} from "react";
import {BackButton, BasicButton, Header, HeaderButton, NameInput, Screen} from "@components";
import {Box, Center, FlatList, Heading, VStack, Icon as NBIcon, TextArea, Text} from "native-base";
import {useNavigation, useRoute, RouteProp} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {useCreateWorkoutTemplateMutation} from "@api";
import Icon from "react-native-vector-icons/FontAwesome5";
import {AppStackParamList} from "@screens/AppStack";
import {ListRenderItem} from "react-native";
import {logAsyncError} from "@utils";
import {
  CreateExerciseGroupTemplateForm,
  CreateWorkoutTemplateForm,
  ExerciseGroupTemplate,
  ExerciseType,
} from "@entities";
import type {WorkoutStackParamList} from "./WorkoutStack";

export type CreateWorkoutNavProps = StackNavigationProp<WorkoutStackParamList & AppStackParamList, "createWorkout">;
export type CreateWorkoutRouteProps = RouteProp<WorkoutStackParamList, "createWorkout">;

export const CreateWorkoutScreen = () => {
  const route = useRoute<CreateWorkoutRouteProps>();
  const navigation = useNavigation<CreateWorkoutNavProps>();
  const [createWorkout] = useCreateWorkoutTemplateMutation();
  const [workoutForm, setWorkoutForm] = useState<CreateWorkoutTemplateForm>({name: "", notes: "", exerciseGroups: []});

  useEffect(() => {
    const addExerciseGroups = (exerciseTypes: ExerciseType[]) => {
      setWorkoutForm((prev) => ({
        ...prev,
        exerciseGroups: [
          ...prev.exerciseGroups,
          ...exerciseTypes.map((type, idx) => ({
            index: prev.exerciseGroups.length + idx,
            exercises: [{targetReps: 0, targetSets: 0, targetWeight: 0, type}],
          })),
        ],
      }));
    };

    if (route.params?.selectedExercises) {
      addExerciseGroups(route.params.selectedExercises);
    }
  }, [route.params?.selectedExercises]);

  const handleBack = () => {
    navigation.navigate("listWorkouts");
  };

  const handleDone = () => {
    createWorkout(workoutForm).catch((err) => logAsyncError("createWorkout", err as Error));
    navigation.navigate("listWorkouts");
  };

  const handleAddExercises = () => {
    navigation.push("workoutAddExercises");
  };

  const renderItem: ListRenderItem<CreateExerciseGroupTemplateForm> = ({item}) => (
    <Box>
      <Text>{item.exercises.map((exercise) => exercise.type.name)}</Text>
    </Box>
  );

  return (
    <Screen testID="createWorkoutScreen">
      <Header
        leftContent={<BackButton onPress={handleBack}>Back</BackButton>}
        rightContent={
          <HeaderButton testID="doneBtn" onPress={handleDone}>
            Done
          </HeaderButton>
        }
      />
      <VStack space={2}>
        <Box>
          <Heading>New Workout</Heading>
        </Box>
        <Center>
          <NameInput onChangeText={(value) => setWorkoutForm({...workoutForm, name: value})} value={workoutForm.name} />
        </Center>
        <Box>
          <TextArea
            testID="noteInput"
            onChangeText={(value) => setWorkoutForm({...workoutForm, notes: value})}
            placeholder="Notes..."
            value={workoutForm.notes}
          />
        </Box>
        <Box>
          <Text>Exercises</Text>
        </Box>
        <Center>
          <FlatList
            width="100%"
            ListEmptyComponent={<Text>You Don&apos;t Have Any Exercises...</Text>}
            keyExtractor={(item: ExerciseGroupTemplate) => `${item.index}`}
            data={workoutForm.exerciseGroups}
            extraData={workoutForm.exerciseGroups}
            renderItem={renderItem}
          />
        </Center>
        <Center>
          <BasicButton startIcon={<NBIcon as={Icon} name="plus" size={5} />} onPress={handleAddExercises}>
            Add Exercise
          </BasicButton>
        </Center>
      </VStack>
    </Screen>
  );
};
