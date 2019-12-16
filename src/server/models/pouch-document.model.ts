export interface IPouchDBAllDocsResult<T> {
    offset: number;
    total_rows: number;
    rows: IPouchDBRow<T>[];
}

export interface IPouchDBGetResult {
    _id: string;
    _rev: string;
}

export interface IPouchDBPutResult {
    ok: boolean;
    id: string;
    rev: string;
}

export interface IPouchDBRemoveResult {
    ok: boolean;
    id: string;
    rev: string;
}

export interface IPouchDBRow<T> {
    id: string;
    key: string;
    value: { rev: string };

    // Only included if include_docs is set to true during query.
    doc?: T;
}

export interface IPouchDBInfo {
  db_name: string;
  doc_count: number;
  update_seq: number;
}
