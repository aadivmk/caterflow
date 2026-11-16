/**
 * The app's records use a string `id`. In MongoDB that string is stored as the
 * document's `_id`, so there is no id translation anywhere else in the app.
 */
export function toDoc(record) {
  const { id, ...rest } = record;
  return { _id: id, ...rest };
}

export function fromDoc(doc) {
  const { _id, ...rest } = doc;
  return { id: _id, ...rest };
}
