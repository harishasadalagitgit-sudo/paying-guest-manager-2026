import { Room } from "./types";

export const ALL_ROOM_NUMBERS = [
  // Floor 1 (101-110)
  "101", "102", "103", "104", "105", "106", "107", "108", "109", "110",
  // Floor 2 (201-210)
  "201", "202", "203", "204", "205", "206", "207", "208", "209", "210",
  // Floor 3 (301-310)
  "301", "302", "303", "304", "305", "306", "307", "308", "309", "310",
  // Floor 4 (401-410)
  "401", "402", "403", "404", "405", "406", "407", "408", "409", "410",
  // Floor 5 (501-510)
  "501", "502", "503", "504", "505", "506", "507", "508", "509", "510",
  // Floor 6 (601-603)
  "601", "602", "603"
];

export function getFloorForRoom(roomNum: string): number {
  if (roomNum.startsWith("1")) return 1;
  if (roomNum.startsWith("2")) return 2;
  if (roomNum.startsWith("3")) return 3;
  if (roomNum.startsWith("4")) return 4;
  if (roomNum.startsWith("5")) return 5;
  if (roomNum.startsWith("6")) return 6;
  return 1;
}

export const initialRoomsList: Room[] = ALL_ROOM_NUMBERS.map((roomNum) => {
  return {
    id: roomNum,
    roomNum,
    floor: getFloorForRoom(roomNum),
    capacity: 6,
    occupiedCount: 0,
    status: "vacant"
  };
});
