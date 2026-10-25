import { colors, radius, spacing, ui } from "@/constants/theme";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

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

const days = Array.from({ length: 31 }, (_, index) => index + 1);

export default function TaskModal() {
  const [task, setTask] = useState<TaskInput>(emptyTask);
  const [showDays, setShowDays] = useState(false);

  return (
    <View style={{ padding: spacing.md, gap: spacing.sm }}>
      <TextInput
        style={[ui.input, { backgroundColor: colors.card }]}
        placeholder="Titel"
        value={task.title}
        onChangeText={(text) => setTask({ ...task, title: text })}
      />

      <TextInput
        style={[
          ui.input,
          {
            backgroundColor: colors.card,
            minHeight: 130,
            textAlignVertical: "top",
          },
        ]}
        placeholder="Beskrivning"
        value={task.description}
        onChangeText={(text) => setTask({ ...task, description: text })}
        multiline
      />
      <View
        style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center" }}
      >
        <Text>Återkommer: var</Text>

        <Pressable
          style={{
            backgroundColor: colors.primary,
            borderRadius: radius.pill,
            width: 28,
            height: 28,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => setShowDays(!showDays)}
        >
          <Text style={{ color: colors.onPrimary }}>{task.reoccurInDays}</Text>
        </Pressable>

        <Text>dag</Text>
      </View>

      {showDays && (
        <ScrollView style={{ maxHeight: 200 }}>
          {days.map((day) => (
            <Pressable
              key={day}
              onPress={() => {
                setTask({ ...task, reoccurInDays: day });
                setShowDays(false);
              }}
            >
              <Text>{day}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
