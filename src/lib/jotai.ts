import { Getter, SetStateAction, Setter, atom, useSetAtom } from 'jotai';
import { useEffect } from 'react';

type TypeDiscriminable = { type: string };
function isTypeDiscriminable(val: unknown): val is TypeDiscriminable {
  return val !== null && typeof val === 'object' && 'type' in val && typeof val.type === 'string';
}

type Msg<V extends TypeDiscriminable = TypeDiscriminable> = V | null | undefined;

type ExtractType<Value extends Msg> = Value extends TypeDiscriminable ? Value['type'] : never;

type FilteredCallback<Value extends Msg, FilterTypes extends ReadonlyArray<string>> = (
  get: Getter,
  set: Setter,
  newVal: Extract<Value, { type: FilterTypes[number] }>,
  prevVal: Value
) => void;

type ListenerEntry<Value extends Msg> = {
  callback: (get: Getter, set: Setter, newVal: Value, prevVal: Value) => void;
  filterTypes: ReadonlyArray<string>;
};

/**
 * Creates an atom for type-discriminable objects that can be listened to.

 * @example
 *
 * ```tsx
 * type Message = { type: 'A', data: string } | { type: 'B', count: number } | { type: 'C' }
 * const [msgAtom, useMsgListener] = atomMsgWithListeners<Message | null>(null)
 *
 * useMsgListener(['A', 'B'], (get, set, msg, prevMsg) => {
 *   if (msg.type === 'A') console.log(msg.data)
 *   else if (msg.type === 'B') console.log(msg.count)
 * })
 * ```
 *
 * @see https://jotai.org/docs/recipes/atom-with-listeners
 */
export function atomMsgWithListeners<Value extends Msg<TypeDiscriminable>>(initialValue: Value) {
  const baseAtom = atom(initialValue);
  const listenersAtom = atom<ListenerEntry<Value>[]>([]);

  const anAtom = atom(
    (get) => get(baseAtom),
    (get, set, arg: SetStateAction<Value>) => {
      const prevVal = get(baseAtom);
      set(baseAtom, arg);
      const newVal = get(baseAtom);

      // Validate
      if (!isTypeDiscriminable(newVal)) {
        console.warn('atomWithMsgListeners: received a non-type-discriminable object', newVal);
        return;
      }

      // Emit to listeners
      get(listenersAtom).forEach((listener) => {
        if (!listener.filterTypes.includes(newVal.type)) {
          return;
        }

        listener.callback(get, set, newVal, prevVal);
      });
    }
  );

  function useListener<FilterTypes extends ReadonlyArray<ExtractType<Value>>>(
    filterTypes: FilterTypes,
    callback: FilteredCallback<Value, FilterTypes>
  ): void {
    const setListeners = useSetAtom(listenersAtom);

    useEffect(() => {
      const listenerEntry: ListenerEntry<Value> = {
        callback: callback as (get: Getter, set: Setter, newVal: Value, prevVal: Value) => void,
        filterTypes,
      };
      setListeners((prev) => [...prev, listenerEntry]);

      return () => {
        setListeners((prev) => {
          const next = prev.filter((entry) => entry.callback !== callback);
          return next.length === prev.length ? prev : next;
        });
      };
    }, [setListeners, callback, filterTypes]);
  }

  return [anAtom, useListener] as const;
}
