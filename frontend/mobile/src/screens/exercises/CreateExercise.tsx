import {CreateExerciseRequest, useCreateExerciseTypeMutation} from "@api";
import {BackButton, Header, HeaderButton, NameInput, Screen} from "@components";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {logAsyncError} from "@utils";
import {Center} from "native-base";
import React, {useState} from "react";
import type {ExerciseStackParamList} from "./ExerciseStack";

type CreateExerciseNavProps = StackNavigationProp<ExerciseStackParamList, "createExercise">;

export const CreateExerciseScreen = () => {
  const navigation = useNavigation<CreateExerciseNavProps>();
  const [createExercise] = useCreateExerciseTypeMutation();
  const [exerciseForm, setExerciseForm] = useState<CreateExerciseRequest>({name: ""});

  const handleBack = () => {
    navigation.navigate("listExercises");
  };

  const handleDone = () => {
    createExercise(exerciseForm).catch((err) => logAsyncError("createExercise", err as Error));
    navigation.navigate("listExercises");
  };

  return (
    <Screen testID="createExerciseScreen">
      <Header
        leftContent={<BackButton onPress={handleBack}>Back</BackButton>}
        rightContent={
          <HeaderButton testID="doneBtn" colorScheme="primary" variant="ghost" onPress={handleDone}>
            Done
          </HeaderButton>
        }
      />
      <Center>
        <NameInput
          onChangeText={(value) => setExerciseForm({...exerciseForm, name: value})}
          value={exerciseForm.name}
        />
      </Center>
    </Screen>
  );
};
