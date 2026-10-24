import { Text } from "expo-router/build/react-navigation";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

type TaskInput = {
  title: string;
  description: string;
  reoccurInDays: number;
  worth: number;
};

const emptyTask: TaskInput = {
  title: "",
  description: "",
  reoccurInDays: 7,
  worth: 2,
};

export default function TaskModal() {
  const [task, setTask] = useState<TaskInput>(emptyTask);

  return (
    <View>
      <TextInput
        placeholder="Ange Titel"
        value={task.title}
        onChangeText={(text) => setTask({ ...task, title: text })}
      />

      <TextInput
        placeholder="Ange beskrivning"
        value={task.description}
        onChangeText={(text) => setTask({ ...task, description: text })}
        multiline
      />

      <Text>Återkommer: var {task.reoccurInDays} dag</Text>

      <Pressable onPress={() => setTask({ ...task, reoccurInDays: 1 })}>
        <Text>1</Text>
      </Pressable>
    </View>
  );
}
