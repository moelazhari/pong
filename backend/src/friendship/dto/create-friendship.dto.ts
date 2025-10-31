import { Fstatus, User } from "src/entities/user.entity";

export class FriendshipDTO {
    initiater: User;
    receiver: User;
    status: Fstatus;
}
