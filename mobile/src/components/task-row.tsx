import { ui } from "@/constants/theme";
import { Pressable, Text, View } from "react-native";



type Props = {
    title: string;
    doneTodayBy: number[];
    daysSinceLast: number;
    isOverdue: boolean;
    onPress?: () => void;
}

export default function TaskRow({ title, doneTodayBy, daysSinceLast, isOverdue, onPress }: Props) {
    return(
        <Pressable onPress={onPress} style={ui.card}>
            {doneTodayBy.length > 0 ? (
                <View>
                    {doneTodayBy.map((avatarId) => (
                        <Text key={avatarId}>{avatarId}</Text>
                    ))}
                </View>
            ) : (
                <View>
                    <Text>{daysSinceLast}</Text>
                </View>
            )}
            <View>
                <Text>{title}</Text>
            </View>
        </Pressable>
    );
}