import { useState } from "react";
import { Text, View } from "react-native";

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
      <Text>
        Här har vi form för att antingen redigera eller skapa ny task, beroende
        på om länken som tog dig hit skickade med task id eller inte
      </Text>
    </View>
  );
}
