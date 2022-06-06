export default class Bid {
    constructor(data: Bid) {
        this.userId = data.userId;
        this.amount = data.amount;
    }
    private userId: number;
    private amount: number;

    getAmount() {
        return this.amount
    }
}