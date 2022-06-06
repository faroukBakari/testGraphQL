export default class User {
    constructor (record: User) {
        this.name = record.name;
        this.id = record.id;
    }
    private id: number;
    private name: string;

    getId() {
        return this.id;
    }
}