import { HouseholdContext } from "@/components/household-provider";
import { colors, radius, spacing, ui } from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useContext, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

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

type TaskFormProps = {
  initialTask: TaskInput;
  activeHouseholdId: string;
  taskId?: string;
};

const days = Array.from({ length: 31 }, (_, index) => index + 1);
const worthOptions = [1, 2, 4, 6, 8];

export default function TaskModal() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const { activeHouseholdId } = useContext(HouseholdContext);

  const {
    data: existingTask,
    isPending,
    isError,
  } = useQuery<TaskInput>({
    queryKey: ["task", activeHouseholdId, id],
    queryFn: () => apiFetch(`/api/households/${activeHouseholdId}/tasks/${id}`),
    enabled: isEdit && !!activeHouseholdId,
  });

  if (!activeHouseholdId) {
    return <Text>Du måste välja ett hushåll först.</Text>;
  }

  if (isEdit && isPending) {
    return <Text>Hämtar sysslan...</Text>;
  }

  if (isEdit && isError) {
    return <Text>Kunde inte hämta sysslan.</Text>;
  }

  if (isEdit && !existingTask) {
    return <Text>Sysslan kunde inte hittas.</Text>;
  }

  return (
    <TaskForm
      key={`${activeHouseholdId}-${id ?? "create"}`}
      initialTask={isEdit ? existingTask! : emptyTask}
      activeHouseholdId={activeHouseholdId}
      taskId={id}
    />
  );
}

function TaskForm({ initialTask, activeHouseholdId, taskId }: TaskFormProps) {
  const [task, setTask] = useState<TaskInput>(initialTask);
  const [showDays, setShowDays] = useState(false);
  const [showWorth, setShowWorth] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

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
        onChangeText={(text) => {
          setTask({ ...task, title: text });
          if (text.trim()) {
            setTitleError("");
          }
        }}
      />

      {titleError !== "" && (
        <Text style={{ color: colors.error }}>{titleError}</Text>
      )}

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
        submitBehavior="blurAndSubmit"
      />

      <View
        style={[
          ui.card,
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: showDays ? 1 : 0,
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

          <View style={{ position: "relative" }}>
            <Pressable
              style={{
                backgroundColor: colors.primary,
                borderRadius: radius.pill,
                width: 28,
                height: 28,
                alignItems: "center",
                justifyContent: "center",
              }}
              accessibilityRole="button"
              accessibilityLabel="Välj antal dagar"
              accessibilityState={{ expanded: showDays }}
              onPress={() => {
                setShowWorth(false);
                setShowDays(!showDays);
              }}
            >
              <Text style={{ color: colors.onPrimary }}>
                {task.reoccurInDays}
              </Text>
            </Pressable>

            {showDays && (
              <View style={[ui.card, styles.dropdown]}>
                <ScrollView
                  style={{ maxHeight: 200 }}
                  keyboardShouldPersistTaps="handled"
                >
                  {days.map((day) => (
                    <Pressable
                      key={day}
                      accessibilityRole="button"
                      accessibilityState={{
                        selected: task.reoccurInDays === day,
                      }}
                      onPress={() => {
                        setTask({ ...task, reoccurInDays: day });
                        setShowDays(false);
                      }}
                      style={({ pressed }) => [
                        styles.dropdownOption,
                        (pressed || task.reoccurInDays === day) &&
                          styles.dropdownOptionActive,
                      ]}
                    >
                      <Text style={styles.dropdownText}>{day}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

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
            zIndex: showWorth ? 1 : 0,
          },
        ]}
      >
        <View style={{ gap: spacing.xs }}>
          <Text style={{ fontWeight: "600" }}>Värde:</Text>
          <Text style={{ color: colors.textMuted }}>
            Hur energikrävande är sysslan?
          </Text>
        </View>

        <View style={{ position: "relative" }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Välj värde"
            accessibilityState={{ expanded: showWorth }}
            onPress={() => {
              setShowDays(false);
              setShowWorth(!showWorth);
            }}
          >
            <Text
              style={[
                ui.dayCount,
                { color: colors.text, fontWeight: "600", fontSize: 14 },
              ]}
            >
              {task.worth}
            </Text>
          </Pressable>

          {showWorth && (
            <View style={[ui.card, styles.dropdown]}>
              {worthOptions.map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: task.worth === value }}
                  onPress={() => {
                    setTask({ ...task, worth: value });
                    setShowWorth(false);
                  }}
                  style={({ pressed }) => [
                    styles.dropdownOption,
                    (pressed || task.worth === value) &&
                      styles.dropdownOptionActive,
                  ]}
                >
                  <Text style={styles.dropdownText}>{value}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      {saveError !== "" && (
        <Text style={{ color: colors.error }}>{saveError}</Text>
      )}

      <Pressable
        disabled={isSaving}
        onPress={async () => {
          if (!task.title.trim()) {
            setTitleError("Du måste ange en titel");
            return;
          }

          if (!activeHouseholdId) {
            setSaveError("Du måste välja ett hushåll först.");
            return;
          }

          setSaveError("");
          setIsSaving(true);

          try {
            await apiFetch(
              `/api/households/${activeHouseholdId}/tasks${taskId ? `/${taskId}` : ""}`,
              {
                method: taskId ? "PATCH" : "POST",
                body: JSON.stringify(task),
              },
            );

            await queryClient.invalidateQueries({
              queryKey: ["tasks"],
            });

            if (taskId) {
              await queryClient.invalidateQueries({
                queryKey: ["task"],
              });
            }
            router.back();
          } catch (error) {
            console.error("Kunde inte spara sysslan:", error);
            setSaveError("Kunde inte spara sysslan. Försök igen.");
          } finally {
            setIsSaving(false);
          }
        }}
        style={{
          backgroundColor: colors.primary,
          padding: spacing.md,
          borderRadius: radius.pill,
          alignItems: "center",
          marginTop: spacing.sm,
        }}
      >
        <Text style={{ color: colors.onPrimary, fontWeight: "600" }}>
          {isSaving ? "Sparar..." : "Spara"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/");
          }
        }}
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.primary,
          borderRadius: radius.pill,
          padding: spacing.md,
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.text, fontWeight: "600" }}>Avbryt</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    position: "absolute",
    top: "100%",
    marginTop: spacing.xs,
    right: 0,
    width: 64,
    padding: spacing.sm,
    gap: 0,
    zIndex: 1,
  },
  dropdownOption: {
    minHeight: 44,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownOptionActive: {
    backgroundColor: colors.background,
  },
  dropdownText: {
    color: colors.text,
    fontSize: 14,
    textAlign: "center",
  },
});
