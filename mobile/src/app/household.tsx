import { AuthContext } from "@/components/auth-provider";
import Avatar from "@/components/avatar";
import CopyCodeButton from "@/components/copy-code-button";
import { HouseholdContext } from "@/components/household-provider";
import { colors, radius, spacing, typography, ui } from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useContext, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type HouseholdDetail = {
  id: string;
  name: string;
  inviteCode: string;
};

type HouseholdListItem = {
  id: string;
  name: string;
  status: string;
  isOwner: boolean;
};

type HouseholdMember = {
  id: string;
  nickname: string;
  avatarId: number;
  isOwner: boolean;
};
type HouseholdRequest = {
  id: string;
  nickname: string;
  avatarId: number;
  createdAt: string;
};

export default function Household() {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);

  const { activeHouseholdId, setActiveHouseholdId } =
    useContext(HouseholdContext);

  const { userId, sessionId } = useContext(AuthContext);
  const [memberToBeOwner, setMemberToBeOwner] =
    useState<HouseholdMember | null>(null);

  const {
    data: household,
    isPending: householdPending,
    error: householdError,
  } = useQuery({
    queryKey: ["households", activeHouseholdId],
    queryFn: () =>
      apiFetch<HouseholdDetail>(`/api/households/${activeHouseholdId}`),
    enabled: activeHouseholdId !== null,
  });

  const { data: households } = useQuery({
    queryKey: ["households", userId, sessionId],
    queryFn: ({ signal }) =>
      apiFetch<HouseholdListItem[]>("/api/households", { signal }),
  });

  const {
    data: members,
    isPending: memberPending,
    error: memberError,
  } = useQuery({
    queryKey: ["members", activeHouseholdId],
    queryFn: ({ signal }) =>
      apiFetch<HouseholdMember[]>(
        `/api/households/${activeHouseholdId}/members`,
        { signal },
      ),
    enabled: activeHouseholdId !== null,
  });

  const isOwner =
    households?.find((h) => h.id === activeHouseholdId)?.isOwner ?? false;

  const {
    data: requests,
    isPending: requestsPending,
    error: requestsError,
  } = useQuery({
    queryKey: ["requests", activeHouseholdId],
    queryFn: ({ signal }) =>
      apiFetch<HouseholdRequest[]>(
        `/api/households/${activeHouseholdId}/requests`,
        { signal },
      ),
    enabled: activeHouseholdId !== null && isOwner,
  });
  const approveMutation = useMutation({
    mutationFn: (memberId: string) =>
      apiFetch(
        `/api/households/${activeHouseholdId}/requests/${memberId}/approve`,
        { method: "POST" },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["requests", activeHouseholdId],
      });
      await queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (memberId: string) =>
      apiFetch<void>(
        `/api/households/${activeHouseholdId}/requests/${memberId}`,
        { method: "DELETE" },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["requests", activeHouseholdId],
      });
      await queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  function startEdit() {
    setName(household?.name ?? "");
    setIsEditing(true);
  }
  const renameMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/households/${activeHouseholdId}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["households"] });
    },
  });
  const leaveMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/households/${activeHouseholdId}/leave`, {
        method: "POST",
      }),
    onSuccess: () => {
      setShowLeaveConfirmation(false);
      setActiveHouseholdId(null);
      router.replace("/select-household");
      queryClient.invalidateQueries({
        queryKey: ["households", userId, sessionId],
      });
    },
  });

  function closeLeaveConfirmation() {
    leaveMutation.reset();
    setShowLeaveConfirmation(false);
  }

  const updateMemberToOwner = useMutation({
    mutationFn: (memberId: string) =>
      apiFetch(
        `/api/households/${activeHouseholdId}/members/${memberId}/owner`,
        {
          method: "POST",
        },
      ),
    onSuccess: () => {
      setMemberToBeOwner(null);
      queryClient.invalidateQueries({
        queryKey: ["members"],
      });
    },
  });

  if (householdPending) return <Text>Laddar...</Text>;
  if (householdError) return <Text>{householdError.message}</Text>;

  return (
    <View style={{ gap: spacing.md, padding: spacing.md }}>
      <View style={ui.card}>
        <View style={[ui.iconCircle, styles.center]}>
          <Ionicons name="home-outline" size={32} color={colors.onPrimary} />
        </View>
        <View>
          {isEditing ? (
            <View style={styles.edit}>
              <TextInput value={name} onChangeText={setName} style={ui.input} />
              <View style={styles.actions}>
                <Pressable
                  style={[ui.button, styles.action]}
                  onPress={() => renameMutation.mutate()}
                  disabled={renameMutation.isPending}
                >
                  <Text style={ui.buttonText}>Spara</Text>
                </Pressable>
                <Pressable
                  style={[ui.button, ui.buttonSecondary, styles.action]}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={[ui.buttonText, ui.buttonSecondaryText]}>
                    Avbryt
                  </Text>
                </Pressable>
              </View>
              {renameMutation.error && (
                <Text style={[typography.caption, { color: colors.primary }]}>
                  {renameMutation.error.message}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.nameRow}>
              <Text style={typography.title}>{household?.name}</Text>
              {isOwner && (
                <Pressable
                  onPress={startEdit}
                  hitSlop={12}
                  accessibilityLabel="Ändra namn"
                >
                  <Ionicons
                    name="pencil-outline"
                    size={20}
                    color={colors.primary}
                  />
                </Pressable>
              )}
            </View>
          )}
          {members && (
            <Text style={[typography.caption, styles.memberCount]}>
              {members.length === 1
                ? "1 medlem"
                : `${members.length} medlemmar`}
            </Text>
          )}
        </View>
      </View>

      {isOwner && (
        <View style={ui.card}>
          <Text style={typography.label}>Anslutningskod</Text>
          <View style={ui.householdInviteCode}>
            <Text style={typography.title}>{household?.inviteCode}</Text>
            <CopyCodeButton code={household.inviteCode} />
          </View>
          <Text style={typography.caption}>
            Dela koden för att bjuda in andra till hushållet
          </Text>
        </View>
      )}

      <View style={ui.card}>
        <Text style={typography.label}>Medlemmar</Text>
        {memberPending && <Text>Medlemmar laddar...</Text>}
        {memberError ? (
          <Text>{memberError.message}</Text>
        ) : (
          <FlatList
            data={members}
            contentContainerStyle={{ gap: spacing.sm }}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item: member }) => (
              <View style={styles.memberCard}>
                <Avatar avatarId={member.avatarId} />
                <Text style={[typography.body, styles.memberNickname]}>
                  {member.nickname}
                </Text>
                <Text
                  style={[
                    ui.badge,
                    member.isOwner ? ui.badgeOwner : ui.badgeMember,
                  ]}
                >
                  {member.isOwner ? "Ägare" : "Medlem"}
                </Text>
                {isOwner && !member.isOwner && (
                  <Pressable
                    onPress={() => {
                      updateMemberToOwner.reset();
                      setMemberToBeOwner(member);
                    }}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Gör ${member.nickname} till ägare`}
                  >
                    <Text style={styles.ownerLink}>Gör till ägare</Text>
                  </Pressable>
                )}
              </View>
            )}
          />
        )}
        {memberToBeOwner !== null && (
          <View style={styles.confirm}>
            <Text style={typography.body}>
              Gör {memberToBeOwner.nickname} till ägare?
            </Text>
            <View style={styles.actions}>
              <Pressable
                style={[ui.button, styles.action]}
                onPress={() => updateMemberToOwner.mutate(memberToBeOwner.id)}
                disabled={updateMemberToOwner.isPending}
              >
                <Text style={ui.buttonText}>
                  {updateMemberToOwner.isPending ? "Sparar..." : "Ja"}
                </Text>
              </Pressable>
              <Pressable
                style={[ui.button, ui.buttonSecondary, styles.action]}
                onPress={() => {
                  updateMemberToOwner.reset();
                  setMemberToBeOwner(null);
                }}
              >
                <Text style={[ui.buttonText, ui.buttonSecondaryText]}>
                  Avbryt
                </Text>
              </Pressable>
            </View>
            {updateMemberToOwner.error && (
              <Text style={[typography.caption, { color: colors.primary }]}>
                {updateMemberToOwner.error.message}
              </Text>
            )}
          </View>
        )}
      </View>

      {isOwner &&
        (requestsPending || requestsError || (requests?.length ?? 0) > 0) && (
          <View style={ui.card}>
            <Text style={typography.label}>Ansökningar</Text>

            {requests?.map((request) => (
              <View key={request.id} style={styles.memberCard}>
                <Avatar avatarId={request.avatarId} />

                <Text style={[typography.body, styles.memberNickname]}>
                  {request.nickname}
                </Text>

                <Text style={[ui.badge, ui.badgePending]}>Väntar</Text>

                <View style={styles.actions}>
                  <Pressable
                    style={[styles.iconButton, styles.rejectButton]}
                    onPress={() => rejectMutation.mutate(request.id)}
                    disabled={
                      approveMutation.isPending || rejectMutation.isPending
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Neka ${request.nickname}`}
                  >
                    <Ionicons name="close" size={18} color={colors.textMuted} />
                  </Pressable>

                  <Pressable
                    style={[styles.iconButton, styles.approveButton]}
                    onPress={() => approveMutation.mutate(request.id)}
                    disabled={
                      approveMutation.isPending || rejectMutation.isPending
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Godkänn ${request.nickname}`}
                  >
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={colors.onPrimary}
                    />
                  </Pressable>
                </View>
              </View>
            ))}

            {requestsPending && <Text>Laddar ansökningar...</Text>}

            {requestsError && (
              <Text style={[typography.caption, { color: colors.primary }]}>
                {requestsError.message}
              </Text>
            )}

            {(approveMutation.error || rejectMutation.error) && (
              <Text style={[typography.caption, { color: colors.primary }]}>
                {(approveMutation.error || rejectMutation.error)?.message}
              </Text>
            )}
          </View>
        )}

      <View style={ui.card}>
        <Pressable
          style={ui.button}
          onPress={() => {
            leaveMutation.reset();
            setShowLeaveConfirmation(true);
          }}
        >
          <Text style={ui.buttonText}>Lämna hushåll</Text>
        </Pressable>
      </View>

      <Modal
        visible={showLeaveConfirmation}
        transparent
        animationType="fade"
        onRequestClose={closeLeaveConfirmation}
      >
        <View style={styles.modalOverlay}>
          <View style={[ui.card, styles.modalCard]}>
            <Text style={typography.title}>Lämna hushåll?</Text>

            <Text style={typography.body}>
              Vill du lämna {household?.name}? Dina gjorda sysslor finns kvar i
              statistiken.
            </Text>

            <View style={styles.actions}>
              <Pressable
                style={[ui.button, ui.buttonSecondary, styles.action]}
                onPress={closeLeaveConfirmation}
              >
                <Text style={[ui.buttonText, ui.buttonSecondaryText]}>
                  Avbryt
                </Text>
              </Pressable>

              <Pressable
                style={[ui.button, styles.action]}
                onPress={() => leaveMutation.mutate()}
                disabled={leaveMutation.isPending}
              >
                <Text style={ui.buttonText}>
                  {leaveMutation.isPending ? "Lämnar..." : "Ja, lämna"}
                </Text>
              </Pressable>
            </View>

            {leaveMutation.error && (
              <Text style={[typography.caption, { color: colors.primary }]}>
                {leaveMutation.error.message}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: {
    backgroundColor: colors.input,
  },
  approveButton: {
    backgroundColor: colors.primary,
  },
  center: {
    alignSelf: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  memberCount: {
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
  edit: {
    gap: spacing.sm,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  memberNickname: {
    flex: 1,
  },
  ownerLink: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "600",
  },
  confirm: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    gap: spacing.md,
  },
});
