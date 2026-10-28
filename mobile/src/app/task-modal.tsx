import { AuthContext } from "@/components/auth-provider";
import { HouseholdContext } from "@/components/household-provider";
import { colors, radius, spacing, typography, ui } from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, Stack, useLocalSearchParams } from "expo-router";
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

type TaskDetails = TaskInput & { id: string };

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

function closeModal(taskId?: string) {
  if (router.canGoBack()) {
    router.back();
  } else if (taskId) {
    router.replace({ pathname: "/task", params: { id: taskId } });
  } else {
    router.replace("/");
  }
}

export default function TaskModal() {
  const { id: paramId } = useLocalSearchParams<{ id?: string }>();
  const taskId = Array.isArray(paramId) ? paramId[0] : paramId;
  const isEdit = Boolean(taskId);
  const { activeHouseholdId } = useContext(HouseholdContext);
  const { userId, sessionId } = useContext(AuthContext);

  const {
    data: existingTask,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery<TaskDetails>({
    queryKey: ["task", userId, sessionId, activeHouseholdId, taskId],
    queryFn: ({ signal }) =>
      apiFetch<TaskDetails>(
        `/api/households/${activeHouseholdId}/tasks/${taskId}`,
        { signal },
      ),
    enabled: !!userId && !!sessionId && !!activeHouseholdId && isEdit,
  });

  if (!activeHouseholdId) {
    return <Text>Du måste välja ett hushåll först.</Text>;
  }

  if (isEdit && isPending) {
    return <Text>Hämtar sysslan...</Text>;
  }

  if (isEdit && isError && !existingTask) {
    return (
      <View style={styles.form}>
        <Text>{error.message || "Kunde inte hämta sysslan."}</Text>
        <Pressable style={ui.button} onPress={() => refetch()}>
          <Text style={ui.buttonText}>Försök igen</Text>
        </Pressable>
      </View>
    );
  }

  if (isEdit && !existingTask) {
    return <Text>Sysslan kunde inte hittas.</Text>;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: isEdit ? "Ändra syssla" : "Lägg Till",
          headerTitleAlign: "center",
          headerTitleStyle: typography.title,
        }}
      />
      <TaskForm
        key={`${userId}-${sessionId}-${activeHouseholdId}-${taskId ?? "create"}`}
        initialTask={isEdit && existingTask ? existingTask : emptyTask}
        activeHouseholdId={activeHouseholdId}
        taskId={taskId}
      />
    </>
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
    <ScrollView
      contentContainerStyle={styles.form}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput
        style={[ui.input, ui.card, styles.input]}
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
          ui.card,
          styles.input,
          {
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
          styles.repeatCard,
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: showDays ? 1 : 0,
          },
        ]}
      >
        <Text style={styles.label}>Återkommer:</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <Text style={styles.valueText}>var</Text>

          <View style={{ position: "relative" }}>
            <Pressable
              style={{
                backgroundColor: colors.primary,
                borderRadius: radius.pill,
                width: 24,
                height: 24,
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
                  nestedScrollEnabled
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

          <Text style={styles.valueText}>dag</Text>
        </View>
      </View>

      <View
        style={[
          ui.card,
          styles.worthCard,
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: showWorth ? 1 : 0,
          },
        ]}
      >
        <View>
          <Text style={styles.label}>Värde:</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
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

            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ["tasks"] }),
              queryClient.invalidateQueries({ queryKey: ["task"] }),
              queryClient.invalidateQueries({ queryKey: ["stats"] }),
            ]);

            closeModal(taskId);
          } catch (error) {
            console.error("Kunde inte spara sysslan:", error);
            setSaveError(
              error instanceof Error
                ? error.message
                : "Kunde inte spara sysslan. Försök igen.",
            );
          } finally {
            setIsSaving(false);
          }
        }}
        style={ui.button}
      >
        <Text style={ui.buttonText}>{isSaving ? "Sparar..." : "Spara"}</Text>
      </Pressable>

      <Pressable
        disabled={isSaving}
        onPress={() => closeModal(taskId)}
        style={[ui.button, ui.buttonSecondary]}
      >
        <Text style={[ui.buttonText, ui.buttonSecondaryText]}>Avbryt</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: spacing.sm + spacing.xs,
    gap: spacing.md,
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  input: {
    minHeight: 55,
    fontSize: 18,
  },
  label: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  valueText: {
    color: colors.text,
    fontSize: 18,
  },
  repeatCard: {
    minHeight: 55,
    paddingVertical: spacing.sm + spacing.xs,
  },
  worthCard: {
    minHeight: 70,
    paddingVertical: spacing.sm + spacing.xs,
  },
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
