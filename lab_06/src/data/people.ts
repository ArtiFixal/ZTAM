export type Person = {
  id: number;
  name: string;
  surname: string;
  avatar: string;
  following: boolean;
};

export const people: Person[] = [
  { id: 1, name: 'Anna', surname: 'Kowalska', avatar: 'https://i.pravatar.cc/150?img=5', following: true },
  { id: 2, name: 'Piotr', surname: 'Nowak', avatar: 'https://i.pravatar.cc/150?img=12', following: false },
  { id: 3, name: 'Maria', surname: 'Wiśniewska', avatar: 'https://i.pravatar.cc/150?img=9', following: false },
  { id: 4, name: 'Tomasz', surname: 'Wójcik', avatar: 'https://i.pravatar.cc/150?img=15', following: true },
];
