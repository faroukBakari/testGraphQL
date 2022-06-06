
export default class dataService {
    private static tables: Map<string, string[]> = new Map([
        ['users', [JSON.stringify({
            name: "lol",
        })]],
        ['shows', [JSON.stringify({
            name: "hhhh",
            userId: 0,
            state: 0,
            schedule: 1653182625161,
            currentProductId: null
        })]],
        ['products', [JSON.stringify({
            name: "uuuu",
            showId: 0,
            startingPrice: 5,
            auctionState: 0,
            expiration: null,
            lastBid: null
        })]]
    ]);
    private static parseWithId(row: string, id: number) : Object {
        return {...JSON.parse(row), id};
    };
    private static rowAsObj(tab: string[], id: number) : Object {
        if (id in tab) {
            return this.parseWithId(tab[id], id);
        } else {
            throw new Error(`record id [${id}] not found`);
        }
    };
    static getTable(tabName: string): Object[] | undefined {
        if (!this.tables.has(tabName)) throw new Error(`table ${tabName} not found`);
        return this.tables.get(tabName)?.map((row, id) => this.parseWithId(row, id));
    };
    static getTableRow(tabName: string, id: number): Object | undefined {
        const tab = this.tables.get(tabName);
        if (tab) {
            return this.rowAsObj(tab, id);
        } else {
            throw new Error(`table ${tabName} not found`);
        }
    };
    static filterTable(tabName: string, filter: (obj: Object) => boolean): Object[] | undefined {
        if (!this.tables.has(tabName)) throw new Error(`table ${tabName} not found`);
        return this.tables.get(tabName)?.map((row, id) => this.parseWithId(row, id)).filter(filter);
    };
    static insertTableRow(tabName: string, obj: Object): Object {
        const tab = this.tables.get(tabName);
        if (tab) {
            tab.push(JSON.stringify(obj));
            return this.rowAsObj(tab, (tab.length - 1));
        } else {
            throw new Error(`table ${tabName} not found`);
        }
    };
    static updateTableRow(tabName: string, obj: Object): Object {
        const tab = this.tables.get(tabName);
        if (tab) {
            const id = (obj as {id: number}).id;
            if (id ===  undefined || !(id in tab)) {
                throw new Error(`no record id [${id}] in table ${tabName}`);
            }
            tab[id] = JSON.stringify(obj);
            return this.rowAsObj(tab, id);
        } else {
            throw new Error(`table ${tabName} not found`);
        }
    };
}

