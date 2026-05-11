import { SortedSet } from '@rimbu/sorted';

export type ConversationOrder = {
    id: string;      // conversationId (identity)
    sortId: string;  // ordering key
};



const conversationOrderComp = {
    isComparable: (value: unknown): value is ConversationOrder =>
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'sortId' in value,

    compare: (a: ConversationOrder, b: ConversationOrder): number => {
        // same id ⇒ treat as equal
        if (a.id === b.id) return 0;

        // otherwise sort by sortId descending
        return b.sortId.localeCompare(a.sortId);
    }

};

export const conversationSetContext = SortedSet.createContext<ConversationOrder>({
    comp: conversationOrderComp,
    // blockSizeBits: 5 // optional (default is good)
});
