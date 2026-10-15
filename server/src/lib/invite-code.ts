import { randomInt } from "node:crypto";

export function createInviteCode() {
  const allowedCharacters: string[] = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
  ];
  const codeLength = 6;

  let inviteCode: string = "";

  for (let i = 0; i < codeLength; i++) {
    const letterIndex: number = randomInt(allowedCharacters.length);
    inviteCode += allowedCharacters[letterIndex];
  }
  return inviteCode;
}
