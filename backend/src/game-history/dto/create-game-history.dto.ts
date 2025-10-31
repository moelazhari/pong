import { User } from "src/entities/user.entity";


export class GameHistoryDTO {
    winner: User;
    loser: User;
    loserScore: number;
}
