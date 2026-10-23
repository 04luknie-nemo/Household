import { AuthContext } from "@/components/auth-provider";
import { HouseholdContext } from "@/components/household-provider";
import { avatars } from "@/constants/avatars";
import { colors, radius, spacing, typography, ui } from "@/constants/theme";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type UserProfile = {
  nickname: string;
  avatarId: number;
  takenAvatarIds: number[];
};

export default function Profile() {
  const queryClient = useQueryClient();
  const handleLogout = async () => {
    await authClient.signOut();
  };
  const { data: session } = authClient.useSession();

  const { activeHouseholdId } = useContext(HouseholdContext);
  const { userId, sessionId } = useContext(AuthContext);
  const {
    data: profile,
    isPending: profilePending,
    error: profileError,
  } = useQuery({
    queryKey: ["profile", activeHouseholdId, userId, sessionId],
    queryFn: () =>
      apiFetch<UserProfile>(`/api/households/${activeHouseholdId}/members/me`),
    enabled: activeHouseholdId !== null && userId !== null,
  });
  const [nickname, setNickname] = useState("");
  const [avatarId, setAvatarId] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  function startEdit() {
    setNickname(profile?.nickname ?? "");
    setAvatarId(profile?.avatarId ?? 0);
    setIsEditing(true);
  }

  const renameMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/households/${activeHouseholdId}/members/me`, {
        method: "PATCH",
        body: JSON.stringify({ nickname, avatarId }),
      }),
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  if (profilePending) {
    return (
      <View style={ui.card}>
        <Text>Laddar Profil...</Text>
      </View>
    );
  }
  if (profileError) {
    return (
      <View style={ui.card}>
        <Text>{profileError.message}</Text>
      </View>
    );
  }
  // Medan man redigerar visar cirkeln avataren man valt, annars den sparade.
  const shownAvatar =
    avatars.find(
      (avatar) => avatar.id === (isEditing ? avatarId : profile.avatarId),
    ) ?? avatars[0];

  return (
    <View style={styles.screen}>
      <View style={[ui.card, styles.center]}>
        <View
          style={[styles.profileCircle, { backgroundColor: shownAvatar.color }]}
        >
          <Text style={styles.profile}>{shownAvatar.name}</Text>
        </View>
      </View>

      {isEditing ? (
        <>
          <View style={ui.card}>
            <Text style={typography.caption}>Välj avatar</Text>
            <FlatList
              data={avatars}
              keyExtractor={(item) => item.id.toString()}
              numColumns={6}
              scrollEnabled={false}
              columnWrapperStyle={styles.avatarRow}
              contentContainerStyle={styles.avatarGrid}
              renderItem={({ item: avatar }) => {
                const isTaken = profile.takenAvatarIds.includes(avatar.id);
                return (
                  <Pressable
                    style={[
                      styles.avatar,
                      avatar.id === avatarId && styles.chosenAvatar,
                      isTaken && styles.takenAvatar,
                      { backgroundColor: avatar.color },
                    ]}
                    onPress={() => setAvatarId(avatar.id)}
                    disabled={isTaken}
                  >
                    <Text style={styles.avatarEmoji}>{avatar.name}</Text>
                  </Pressable>
                );
              }}
            />
          </View>

          <View style={ui.card}>
            <Text style={typography.caption}>Smeknamn i hushållet</Text>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              style={ui.input}
            />
          </View>

          {renameMutation.error && (
            <Text style={[typography.caption, { color: colors.primary }]}>
              {renameMutation.error.message}
            </Text>
          )}
          <Pressable
            style={ui.button}
            onPress={() => renameMutation.mutate()}
            disabled={renameMutation.isPending}
          >
            <Text style={ui.buttonText}>Spara</Text>
          </Pressable>
          <Pressable
            style={[ui.button, ui.buttonSecondary]}
            onPress={() => setIsEditing(false)}
          >
            <Text style={[ui.buttonText, ui.buttonSecondaryText]}>Avbryt</Text>
          </Pressable>
        </>
      ) : (
        <>
          <View style={ui.card}>
            <Text style={[typography.caption, styles.sectionTitle]}>
              Hushåll
            </Text>
            <View style={styles.row}>
              <Ionicons
                name="home-outline"
                size={22}
                color={colors.textMuted}
              />
              <View style={styles.rowText}>
                <Text style={typography.caption}>Smeknamn</Text>
                <Text style={typography.body}>{profile.nickname}</Text>
              </View>
              <Pressable onPress={() => startEdit()} hitSlop={spacing.sm}>
                <Ionicons name="pencil-outline" size={22} color={colors.text} />
              </Pressable>
            </View>
          </View>

          <View style={ui.card}>
            <Text style={[typography.caption, styles.sectionTitle]}>Konto</Text>
            <View style={styles.row}>
              <Ionicons
                name="person-outline"
                size={22}
                color={colors.textMuted}
              />
              <View style={styles.rowText}>
                <Text style={typography.caption}>Namn</Text>
                <Text style={typography.body}>{session?.user.name}</Text>
              </View>
            </View>
            <View style={[styles.row, styles.rowDivider]}>
              <Ionicons
                name="mail-outline"
                size={22}
                color={colors.textMuted}
              />
              <View style={styles.rowText}>
                <Text style={typography.caption}>E-post</Text>
                <Text style={typography.body}>{session?.user.email}</Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={handleLogout}
            style={[ui.button, ui.buttonSecondary]}
          >
            <Text style={[ui.buttonText, ui.buttonSecondaryText]}>
              Logga ut
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  screen: {
    padding: spacing.md,
    gap: spacing.md,
  },
  center: {
    alignItems: "center",
  },
  profileCircle: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  profile: {
    fontSize: 56,
  },
  avatarGrid: {
    gap: spacing.sm,
  },
  avatarRow: {
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  chosenAvatar: {
    borderColor: colors.text,
  },
  takenAvatar: {
    opacity: 0.3,
  },
  avatarEmoji: {
    fontSize: 26,
  },
  // Rubriken i kortet med en tunn linje under, som Kontaktuppgifter i Figma.
  sectionTitle: {
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  rowDivider: {
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowText: {
    flex: 1,
  },
});
