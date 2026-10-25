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
    <View
      style={{
        padding: spacing.md,
        gap: spacing.sm,
        maxWidth: 400,
        alignSelf: "center",
        width: "100%",
      }}
    >
      <TextInput
        style={[
          ui.input,
          { backgroundColor: colors.card, borderRadius: radius.md },
        ]}
        placeholder="Titel"
        placeholderTextColor={colors.textMuted}
        value={task.title}
        onChangeText={(text) => setTask({ ...task, title: text })}
      />

      <TextInput
        style={[
          ui.input,
          {
            backgroundColor: colors.card,
            borderRadius: radius.md,
            minHeight: 130,
            textAlignVertical: "top",
          },
        ]}
        placeholder="Beskrivning"
        placeholderTextColor={colors.textMuted}
        value={task.description}
        onChangeText={(text) => setTask({ ...task, description: text })}
        multiline
      />

      <View
        style={[
          ui.card,
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          },
        ]}
      >
        <Text>Återkommer:</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <Text>var</Text>

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
            <Text style={{ color: colors.onPrimary }}>
              {task.reoccurInDays}
            </Text>
          </Pressable>

          <Text>dag</Text>
        </View>
      </View>

      <View
        style={[
          ui.card,
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          },
        ]}
      >
        <View style={{ gap: spacing.xs }}>
          <Text style={{ fontWeight: "600" }}>Värde:</Text>
          <Text style={{ color: colors.textMuted }}>
            Hur energikrävande är sysslan?
          </Text>
        </View>

        <Pressable>
          <Text
            style={[
              ui.dayCount,
              { color: colors.text, fontWeight: "600", fontSize: 14 },
            ]}
          >
            {task.worth}
          </Text>
        </Pressable>
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
