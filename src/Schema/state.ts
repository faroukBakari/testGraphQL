export enum state {
    PENDING,
    LIVE,
    DONE
}

export const stateStr = {
    [state.PENDING]: 'PENDING',
    [state.LIVE]: 'LIVE',
    [state.DONE]: 'DONE',
};