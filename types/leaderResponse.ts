import Leader from './leader';

export default class LeaderboardResponseObject {
    current_user_place? : number;
    leaders: Array<Leader> = [];
}