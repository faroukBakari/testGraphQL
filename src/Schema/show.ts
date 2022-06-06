import state from './state'

export default class Show {
    constructor (record: Show) {
        this.name = record.name;
        this.id = record.id;
        this.userId = record.userId;
        this.schedule = record.schedule;
        this.state = record.state;
        this.currentProductId = record.currentProductId;
    };
    private id: number;
    private userId: number;
    private name: string;
    private state: state;
    private schedule: number;
    private currentProductId: number | null;

    getId() {
        return this.id;
    }

    start() {
        if (this.state === state.PENDING) {
            this.schedule = Date.now();
            this.state = state.LIVE; // no need for state management. will be inferred from starting timestamp
            return this;
        } else {
            throw new Error(`show [${this.id}] allready started`);
        }
    }
}